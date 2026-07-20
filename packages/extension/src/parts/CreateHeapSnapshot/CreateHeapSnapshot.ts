import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const createHeapSnapshot = (id: number, content: string) => {
  HeapSnapshotState.add(id, { content })
}
