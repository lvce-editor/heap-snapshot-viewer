import * as GetAggregatesByClassNameInternal from '../GetAggregatesByClassNameInternal/GetAggregatesByClassNameInternal.ts'
import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const getAggregratesByClassName = (id: number) => {
  const { nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, strings, firstEdgeIndexes } = HeapSnapshotState.get(id)
  return GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(
    nodes,
    nodeFields,
    nodeTypes,
    edges,
    edgeFields,
    edgeTypes,
    strings,
    firstEdgeIndexes,
  )
}
