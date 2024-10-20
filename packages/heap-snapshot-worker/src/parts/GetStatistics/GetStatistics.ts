import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'
import * as GetStatisticsInternal from '../GetStatisticsInternal/GetStatisticsInternal.ts'

export const getStatistics = (id: number) => {
  const { nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, strings, firstEdgeIndexes } = HeapSnapshotState.get(id)
  const statistics = GetStatisticsInternal.getStatisicsInternal(nodes, nodeFields, nodeTypes, strings)
  return statistics
}
