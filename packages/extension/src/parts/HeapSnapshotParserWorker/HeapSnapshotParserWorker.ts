import { createRpc } from '@lvce-editor/api'
import type { ParsedHeapSnapshot } from '../HeapSnapshot/HeapSnapshot.ts'
import { HeapSnapshotValidationError } from '../HeapSnapshotValidationError/HeapSnapshotValidationError.ts'

interface Rpc {
  readonly dispose: () => Promise<void> | void
  readonly invoke: (method: string, ...params: readonly unknown[]) => Promise<unknown>
}

type CreateRpc = (options: { readonly id: string }) => Promise<Rpc>

export const state: {
  createRpc: CreateRpc
  rpcPromise: Promise<Rpc> | undefined
} = {
  createRpc,
  rpcPromise: undefined,
}

const getRpc = (): Promise<Rpc> => {
  const { createRpc: createRpcFunction, rpcPromise } = state
  if (rpcPromise) {
    return rpcPromise
  }
  const newRpcPromise = createRpcFunction({ id: 'builtin.heap-snapshot-viewer.parser-worker' })
  state.rpcPromise = newRpcPromise
  return newRpcPromise
}

export const parseHeapSnapshot = async (content: string): Promise<ParsedHeapSnapshot> => {
  const rpc = await getRpc()
  const result = (await rpc.invoke('HeapSnapshotParser.parse', content)) as
    | {
        readonly message: string
        readonly type: 'validation-error'
      }
    | {
        readonly type: 'success'
        readonly value: ParsedHeapSnapshot
      }
  if (result.type === 'validation-error') {
    throw new HeapSnapshotValidationError(result.message)
  }
  return result.value
}

export const dispose = async (): Promise<void> => {
  const { rpcPromise } = state
  state.rpcPromise = undefined
  if (!rpcPromise) {
    return
  }
  const rpc = await rpcPromise
  await rpc.dispose()
}
