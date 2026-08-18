import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const getSnapshotSummary = (id: number) => {
  const { edgeFields, edges, nodeFields, nodes, snapshotSize } = HeapSnapshotState.get(id)
  return {
    edgeCount: edges.length / edgeFields.length,
    nodeCount: nodes.length / nodeFields.length,
    snapshotSize,
  }
}
