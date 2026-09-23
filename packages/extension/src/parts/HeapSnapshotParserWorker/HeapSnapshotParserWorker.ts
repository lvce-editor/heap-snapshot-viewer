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
} = {
  analysisRpcPromise: undefined,
  createRpc,
  parserRpcPromise: undefined,
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

export const parseHeapSnapshot = async (blob: Blob): Promise<ParsedHeapSnapshot> => {
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
  const analysisRpc = await getRpc('analysis')
  return (await analysisRpc.invoke('HeapSnapshotAnalysis.analyze', result.value)) as ParsedHeapSnapshot
}

export const dispose = async (): Promise<void> => {
  const promises = [state.parserRpcPromise, state.analysisRpcPromise]
  state.parserRpcPromise = undefined
  state.analysisRpcPromise = undefined
  await Promise.all(
    promises.map(async (promise) => {
      if (!promise) {
        return
      }
      const rpc = await promise
      await rpc.dispose()
    }),
  )
}
