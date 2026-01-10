import * as GetStatisticsInternal from '../GetStatisticsInternal/GetStatisticsInternal.ts'
import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const getStatistics = (id: number) => {
  const { nodeFields, nodes, nodeTypes, strings } = HeapSnapshotState.get(id)
  const statistics = GetStatisticsInternal.getStatisicsInternal(nodes, nodeFields, nodeTypes, strings)
  return statistics
}
