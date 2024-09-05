import * as CreateHeapSnapshot from '../CreateHeapSnapshot/CreateHeapSnapshot.ts'
import * as DisposeHeapSnapshot from '../DisposeHeapSnapshot/DisposeHeapSnapshot.ts'
import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as GetHeapSnapshot from '../GetHeapSnapshot/GetHeapSnapshot.ts'
import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'
import * as PreparseHeapSnapshot from '../PreparseHeapSnapshot/PreparseHeapSnapshot.ts'

export const commandMap = {
  'HeapSnapshot.create': CreateHeapSnapshot.createHeapSnapshot,
  'HeapSnapshot.dispose': DisposeHeapSnapshot.disposeHeapSnapshot,
  'HeapSnapshot.get': GetHeapSnapshot.getHeapSnapshot,
  'HeapSnapshot.getAggregatesByClassName': GetAggregatesByClassName.getAggregratesByClassName,
  'HeapSnapshot.parse': ParseHeapSnapshot.parseHeapSnapshot,
  'HeapSnapshot.preparse': PreparseHeapSnapshot.preparseHeapSnapshot,
}
