import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const saveState = (id: number) => {
  const state = HeapSnapshotState.get(id)
  return state
}
