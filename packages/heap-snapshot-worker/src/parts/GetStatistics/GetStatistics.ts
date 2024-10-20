import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const getStatistics = (id: number) => {
  const { nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, strings, firstEdgeIndexes } = HeapSnapshotState.get(id)

  console.log({ nodes })
  return {}
}
