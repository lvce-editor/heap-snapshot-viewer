import { beforeEach, expect, jest, test } from '@jest/globals'
import * as HeapSnapshotParserWorker from '../src/parts/HeapSnapshotParserWorker/HeapSnapshotParserWorker.ts'

const invoke = jest.fn<(method: string, ...params: readonly unknown[]) => Promise<unknown>>()
const dispose = jest.fn<() => Promise<void>>(async () => {})
const createRpc = jest.fn<
  (options: { readonly id: string }) => Promise<{
    readonly dispose: typeof dispose
    readonly invoke: typeof invoke
  }>
>(async () => ({ dispose, invoke }))

beforeEach(() => {
  jest.resetAllMocks()
  createRpc.mockResolvedValue({ dispose, invoke })
  HeapSnapshotParserWorker.state.createRpc = createRpc
  HeapSnapshotParserWorker.state.rpcPromise = undefined
})

test('starts the parser worker lazily and reuses its RPC connection', async () => {
  const firstSnapshot = { aggregates: [], memoryByType: [], summary: {}, timings: [] }
  const secondSnapshot = { aggregates: [], memoryByType: [], summary: {}, timings: [] }
  invoke
    .mockResolvedValueOnce({ type: 'success', value: firstSnapshot })
    .mockResolvedValueOnce({ type: 'success', value: secondSnapshot })

  await expect(HeapSnapshotParserWorker.parseHeapSnapshot('first snapshot')).resolves.toBe(firstSnapshot)
  await expect(HeapSnapshotParserWorker.parseHeapSnapshot('second snapshot')).resolves.toBe(secondSnapshot)

  expect(createRpc).toHaveBeenCalledTimes(1)
  expect(createRpc).toHaveBeenCalledWith({
    id: 'builtin.heap-snapshot-viewer.parser-worker',
  })
  expect(invoke).toHaveBeenNthCalledWith(1, 'HeapSnapshotParser.parse', 'first snapshot')
  expect(invoke).toHaveBeenNthCalledWith(2, 'HeapSnapshotParser.parse', 'second snapshot')
})

test('disposes an initialized worker and can be called before initialization', async () => {
  await HeapSnapshotParserWorker.dispose()
  expect(dispose).not.toHaveBeenCalled()

  invoke.mockResolvedValue({
    type: 'success',
    value: { aggregates: [], memoryByType: [], summary: {}, timings: [] },
  })
  await HeapSnapshotParserWorker.parseHeapSnapshot('snapshot')
  await HeapSnapshotParserWorker.dispose()

  expect(dispose).toHaveBeenCalledTimes(1)
  expect(HeapSnapshotParserWorker.state.rpcPromise).toBeUndefined()
})

test('reconstructs validation errors from worker responses', async () => {
  invoke.mockResolvedValue({ message: 'The file is empty.', type: 'validation-error' })

  await expect(HeapSnapshotParserWorker.parseHeapSnapshot('')).rejects.toMatchObject({
    message: 'The file is empty.',
    name: 'HeapSnapshotValidationError',
  })
})
