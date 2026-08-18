import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const createHeapSnapshot = (id: number, content: string) => {
  const snapshotSize = new TextEncoder().encode(content).byteLength
  HeapSnapshotState.add(id, { content, snapshotSize })
}
