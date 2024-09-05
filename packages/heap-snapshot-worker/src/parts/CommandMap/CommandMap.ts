import * as CreateHeapSnapshot from '../CreateHeapSnapshot/CreateHeapSnapshot.ts'
import * as DisposeHeapSnapshot from '../DisposeHeapSnapshot/DisposeHeapSnapshot.ts'
import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'

export const commandMap = {
  'HeapSnapshot.parse': ParseHeapSnapshot.parseHeapSnapshot,
  'HeapSnapshot.create': CreateHeapSnapshot.createHeapSnapshot,
  'HeapSnapshot.dispose': DisposeHeapSnapshot.disposeHeapSnapshot,
  'HeapSnapshot.getAggregatesByClassName': GetAggregatesByClassName.getAggregratesByClassName,
}
