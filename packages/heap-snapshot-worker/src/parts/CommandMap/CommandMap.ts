import * as Create2 from '../Create2/Create2.ts'
import * as CreateHeapSnapshot from '../CreateHeapSnapshot/CreateHeapSnapshot.ts'
import * as DisposeHeapSnapshot from '../DisposeHeapSnapshot/DisposeHeapSnapshot.ts'
import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as GetHeapSnapshot from '../GetHeapSnapshot/GetHeapSnapshot.ts'
import * as GetStatistics from '../GetStatistics/GetStatistics.ts'
import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'
import * as PreparseHeapSnapshot from '../PreparseHeapSnapshot/PreparseHeapSnapshot.ts'
import * as SaveState from '../SaveState/SaveState.ts'

export const commandMap = {
  'HeapSnapshot.create': CreateHeapSnapshot.createHeapSnapshot,
  'HeapSnapshot.dispose': DisposeHeapSnapshot.disposeHeapSnapshot,

  'HeapSnapshot.get': GetHeapSnapshot.getHeapSnapshot,
  'HeapSnapshot.getAggregatesByClassName': GetAggregatesByClassName.getAggregratesByClassName,
  'HeapSnapshot.getStatistics': GetStatistics.getStatistics,
  'HeapSnapshot.parse': ParseHeapSnapshot.parseHeapSnapshot,
  'HeapSnapshot.preparse': PreparseHeapSnapshot.preparseHeapSnapshot,
  'HeapSnapshot.saveState': SaveState.saveState,
  'WebView.create': Create2.create,
  'WebView.saveState': SaveState.saveState,
}
