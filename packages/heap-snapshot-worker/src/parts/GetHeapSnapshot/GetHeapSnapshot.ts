import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const getHeapSnapshot = (id: number) => {
  return HeapSnapshotState.get(id)
}
