import { createRpc } from '@lvce-editor/api'
import type { ParsedHeapSnapshot } from '../HeapSnapshot/HeapSnapshot.ts'
import { HeapSnapshotValidationError } from '../HeapSnapshotValidationError/HeapSnapshotValidationError.ts'

interface Rpc {
  readonly dispose: () => Promise<void> | void
  readonly invoke: (method: string, ...params: readonly unknown[]) => Promise<unknown>
}

type CreateRpc = (options: { readonly id: string }) => Promise<Rpc>

interface ParsedHeapSnapshotData {
  readonly edgeFields: readonly string[]
  readonly edges: Uint32Array
  readonly edgeTypes: readonly string[]
  readonly nodeFields: readonly string[]
  readonly nodes: Uint32Array
  readonly nodeTypes: readonly string[]
  readonly rootNodeIndex: number
  readonly snapshotSize: number
  readonly strings: readonly string[]
}

export const state: {
  createRpc: CreateRpc
  analysisRpcPromise: Promise<Rpc> | undefined
  parserRpcPromise: Promise<Rpc> | undefined
  ownerCount: number
  operationCount: number
  generation: number
} = {
  analysisRpcPromise: undefined,
  createRpc,
  generation: 0,
  operationCount: 0,
  ownerCount: 0,
  parserRpcPromise: undefined,
}

const disposeWorkers = async (): Promise<void> => {
  const promises = [state.parserRpcPromise, state.analysisRpcPromise]
  state.parserRpcPromise = undefined
  state.analysisRpcPromise = undefined
  await Promise.all(
    promises.map(async (promise) => {
      if (!promise) {
        return
      }
      const rpc = await promise
      try {
        await rpc.invoke('Worker.dispose')
      } finally {
        await rpc.dispose()
      }
    }),
  )
}

const disposeIfUnused = async (): Promise<void> => {
  if (state.ownerCount === 0 && state.operationCount === 0) {
    await disposeWorkers()
  }
}

export const acquire = (): (() => void) => {
  const { generation } = state
  state.ownerCount++
  let released = false
  return () => {
    if (released) {
      return
    }
    released = true
    if (generation !== state.generation) {
      return
    }
    state.ownerCount--
    void disposeIfUnused()
  }
}

const withOperation = async <T>(operation: () => Promise<T>): Promise<T> => {
  const { generation } = state
  state.operationCount++
  try {
    return await operation()
  } finally {
    if (generation === state.generation) {
      state.operationCount--
      await disposeIfUnused()
    }
  }
}

const getRpc = (kind: 'analysis' | 'parser'): Promise<Rpc> => {
  const id = `builtin.heap-snapshot-viewer.${kind}-worker`
  const rpcPromise = kind === 'parser' ? state.parserRpcPromise : state.analysisRpcPromise
  if (rpcPromise) {
    return rpcPromise
  }
  const newRpcPromise = state.createRpc({ id })
  if (kind === 'parser') {
    state.parserRpcPromise = newRpcPromise
  } else {
    state.analysisRpcPromise = newRpcPromise
  }
  return newRpcPromise
}

export const parseHeapSnapshot = async (blob: Blob, signal?: AbortSignal): Promise<ParsedHeapSnapshot> =>
  withOperation(async () => {
    const parserRpc = await getRpc('parser')
    const result = (await parserRpc.invoke('HeapSnapshotParser.parseBlob', blob)) as
      | {
          readonly message: string
          readonly type: 'validation-error'
        }
      | {
          readonly type: 'success'
          readonly value: ParsedHeapSnapshotData
        }
    if (result.type === 'validation-error') {
      throw new HeapSnapshotValidationError(result.message)
    }
    if (signal?.aborted) {
      throw new DOMException('The heap snapshot view was closed', 'AbortError')
    }
    const analysisRpc = await getRpc('analysis')
    return (await analysisRpc.invoke('HeapSnapshotAnalysis.analyze', result.value)) as ParsedHeapSnapshot
  })

export const getHeapSnapshotStrings = async (blob: Blob): Promise<readonly string[]> =>
  withOperation(async () => {
    const parserRpc = await getRpc('parser')
    const strings = await parserRpc.invoke('HeapSnapshotParser.getStrings', blob)
    if (!Array.isArray(strings) || strings.some((value) => typeof value !== 'string')) {
      throw new Error('The heap snapshot parser returned invalid strings')
    }
    return strings
  })

export const dispose = async (): Promise<void> => {
  state.generation++
  state.ownerCount = 0
  state.operationCount = 0
  await disposeWorkers()
}
