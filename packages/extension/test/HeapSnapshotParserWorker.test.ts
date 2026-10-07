import { beforeEach, expect, jest, test } from '@jest/globals'
import * as HeapSnapshotParserWorker from '../src/parts/HeapSnapshotParserWorker/HeapSnapshotParserWorker.ts'

const invoke = jest.fn<(method: string, ...params: readonly unknown[]) => Promise<unknown>>()
const parserInvoke = jest.fn<(method: string, ...params: readonly unknown[]) => Promise<unknown>>()
const dispose = jest.fn<() => Promise<void>>(async () => {})
const createRpc = jest.fn<
  (options: { readonly id: string }) => Promise<{
    readonly dispose: typeof dispose
    readonly invoke: typeof invoke
  }>
>(async () => ({ dispose, invoke }))

beforeEach(() => {
  jest.resetAllMocks()
  createRpc.mockImplementation(async ({ id }) => ({ dispose, invoke: id.endsWith('parser-worker') ? parserInvoke : invoke }))
  HeapSnapshotParserWorker.state.createRpc = createRpc
  HeapSnapshotParserWorker.state.parserRpcPromise = undefined
  HeapSnapshotParserWorker.state.analysisRpcPromise = undefined
  HeapSnapshotParserWorker.state.ownerCount = 0
  HeapSnapshotParserWorker.state.operationCount = 0
  HeapSnapshotParserWorker.state.generation++
})

test('passes parsed typed data from the parser worker to a distinct analysis worker', async () => {
  const release = HeapSnapshotParserWorker.acquire()
  const firstSnapshot = { aggregates: [], memoryByType: [], summary: {}, timings: [] }
  const secondSnapshot = { aggregates: [], memoryByType: [], summary: {}, timings: [] }
  const data = { edges: new Uint32Array([2]), nodes: new Uint32Array([1]) }
  parserInvoke.mockResolvedValueOnce({ type: 'success', value: data }).mockResolvedValueOnce({ type: 'success', value: data })
  invoke.mockResolvedValueOnce(firstSnapshot).mockResolvedValueOnce(secondSnapshot)

  await expect(HeapSnapshotParserWorker.parseHeapSnapshot(new Blob(['first snapshot']))).resolves.toBe(firstSnapshot)
  await expect(HeapSnapshotParserWorker.parseHeapSnapshot(new Blob(['second snapshot']))).resolves.toBe(secondSnapshot)

  expect(createRpc).toHaveBeenCalledTimes(2)
  expect(createRpc).toHaveBeenCalledWith({ id: 'builtin.heap-snapshot-viewer.parser-worker' })
  expect(createRpc).toHaveBeenCalledWith({ id: 'builtin.heap-snapshot-viewer.analysis-worker' })
  expect(parserInvoke).toHaveBeenNthCalledWith(1, 'HeapSnapshotParser.parseBlob', expect.any(Blob))
  expect(parserInvoke).toHaveBeenNthCalledWith(2, 'HeapSnapshotParser.parseBlob', expect.any(Blob))
  expect(invoke).toHaveBeenNthCalledWith(1, 'HeapSnapshotAnalysis.analyze', data)
  expect(invoke).toHaveBeenNthCalledWith(2, 'HeapSnapshotAnalysis.analyze', data)
  release()
  await Promise.resolve()
})

test('disposes initialized workers and can be called before initialization', async () => {
  await HeapSnapshotParserWorker.dispose()
  expect(dispose).not.toHaveBeenCalled()

  parserInvoke.mockResolvedValue({ type: 'success', value: { edges: new Uint32Array(), nodes: new Uint32Array() } })
  invoke.mockResolvedValue({ aggregates: [], memoryByType: [], summary: {}, timings: [] })
  await HeapSnapshotParserWorker.parseHeapSnapshot(new Blob(['snapshot']))
  await HeapSnapshotParserWorker.dispose()

  expect(dispose).toHaveBeenCalledTimes(2)
  expect(HeapSnapshotParserWorker.state.parserRpcPromise).toBeUndefined()
  expect(HeapSnapshotParserWorker.state.analysisRpcPromise).toBeUndefined()

  await expect(HeapSnapshotParserWorker.parseHeapSnapshot(new Blob(['reopened snapshot']))).resolves.toMatchObject({
    summary: {},
  })
  expect(createRpc).toHaveBeenCalledTimes(4)
})

test('keeps shared workers alive until the final view releases its ownership', async () => {
  parserInvoke.mockResolvedValue({ type: 'success', value: { edges: new Uint32Array(), nodes: new Uint32Array() } })
  invoke.mockResolvedValue({ aggregates: [], memoryByType: [], summary: {}, timings: [] })
  const releaseFirst = HeapSnapshotParserWorker.acquire()
  const releaseSecond = HeapSnapshotParserWorker.acquire()

  await HeapSnapshotParserWorker.parseHeapSnapshot(new Blob(['snapshot']))
  releaseFirst()
  await Promise.resolve()
  expect(dispose).not.toHaveBeenCalled()
  await expect(HeapSnapshotParserWorker.parseHeapSnapshot(new Blob(['surviving snapshot']))).resolves.toBeDefined()
  expect(dispose).not.toHaveBeenCalled()

  releaseSecond()
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
  expect(dispose).toHaveBeenCalledTimes(2)
  expect(HeapSnapshotParserWorker.state.parserRpcPromise).toBeUndefined()
  expect(HeapSnapshotParserWorker.state.analysisRpcPromise).toBeUndefined()
})

test('does not start analysis after the owning view closes during parsing', async () => {
  const { promise, resolve } = Promise.withResolvers<unknown>()
  parserInvoke.mockReturnValue(promise)
  const controller = new AbortController()
  const parsing = HeapSnapshotParserWorker.parseHeapSnapshot(new Blob(['snapshot']), controller.signal)
  controller.abort()
  resolve({ type: 'success', value: { edges: new Uint32Array(), nodes: new Uint32Array() } })

  await expect(parsing).rejects.toMatchObject({ name: 'AbortError' })
  expect(createRpc).toHaveBeenCalledTimes(1)
  expect(invoke).not.toHaveBeenCalled()
  expect(dispose).toHaveBeenCalledTimes(1)
})

test('reconstructs validation errors from worker responses', async () => {
  parserInvoke.mockResolvedValue({ message: 'The file is empty.', type: 'validation-error' })

  await expect(HeapSnapshotParserWorker.parseHeapSnapshot(new Blob())).rejects.toMatchObject({
    message: 'The file is empty.',
    name: 'HeapSnapshotValidationError',
  })
  expect(createRpc).toHaveBeenCalledTimes(1)
})
