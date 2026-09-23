import type { Aggregate } from '../GetAggregatesByClassNameInternal/GetAggregatesByClassNameInternal.ts'
import * as GetAggregatesByClassNameInternal from '../GetAggregatesByClassNameInternal/GetAggregatesByClassNameInternal.ts'
import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const getAggregratesByClassName = (id: number): readonly Aggregate[] => {
  const { dominatorsTree, nodeFields, nodes, nodeTypes, retainedSizes, strings } = HeapSnapshotState.get(id)
  return GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(
    nodes,
    nodeFields,
    nodeTypes,
    strings,
    retainedSizes,
    dominatorsTree,
  )
}
