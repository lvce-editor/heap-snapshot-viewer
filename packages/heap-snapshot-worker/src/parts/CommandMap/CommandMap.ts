import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'

export const commandMap = {
  'Heapsnapshot.parse': ParseHeapSnapshot.parseHeapSnapshot,
  'Heapsnapshot.getAggregatesByClassName': GetAggregatesByClassName.getAggregratesByClassName,
}
