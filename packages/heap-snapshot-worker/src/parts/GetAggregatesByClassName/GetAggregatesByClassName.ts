import * as GetAggregatesByClassNameInternal from '../GetAggregatesByClassNameInternal/GetAggregatesByClassNameInternal.ts'
import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const getAggregratesByClassName = (id: number) => {
  const { parsed } = HeapSnapshotState.get(id)
  return GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(parsed)
}
