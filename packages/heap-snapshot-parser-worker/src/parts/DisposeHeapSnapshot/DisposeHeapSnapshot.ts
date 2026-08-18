import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const disposeHeapSnapshot = (id: number) => {
  HeapSnapshotState.remove(id)
}
