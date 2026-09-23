import type { Statistics } from '../GetStatisticsInternal/GetStatisticsInternal.ts'
import * as GetStatisticsInternal from '../GetStatisticsInternal/GetStatisticsInternal.ts'
import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const getStatistics = (id: number): Statistics => {
  const { nodeFields, nodes, nodeTypes } = HeapSnapshotState.get(id)
  const statistics = GetStatisticsInternal.getStatisicsInternal(nodes, nodeFields, nodeTypes)
  return statistics
}
