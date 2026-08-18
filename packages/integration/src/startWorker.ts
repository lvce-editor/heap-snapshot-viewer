import * as CreateHeapSnapshot from '../../heap-snapshot-parser-worker/src/parts/CreateHeapSnapshot/CreateHeapSnapshot.ts'
import * as GetAggregatesByClassName from '../../heap-snapshot-parser-worker/src/parts/GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as GetHeapSnapshot from '../../heap-snapshot-parser-worker/src/parts/GetHeapSnapshot/GetHeapSnapshot.ts'
import * as ParseHeapSnapshot from '../../heap-snapshot-parser-worker/src/parts/ParseHeapSnapshot/ParseHeapSnapshot.ts'
import * as PreparseHeapSnapshot from '../../heap-snapshot-parser-worker/src/parts/PreparseHeapSnapshot/PreparseHeapSnapshot.ts'

const commandMap = {
  'HeapSnapshot.create': CreateHeapSnapshot.createHeapSnapshot,
  'HeapSnapshot.get': GetHeapSnapshot.getHeapSnapshot,
  'HeapSnapshot.getAggregatesByClassName': GetAggregatesByClassName.getAggregratesByClassName,
  'HeapSnapshot.parse': ParseHeapSnapshot.parseHeapSnapshot,
  'HeapSnapshot.preparse': PreparseHeapSnapshot.preparseHeapSnapshot,
}

export const startWorker = async (rpc) => {
  return {
    execute(commandId, ...args) {
      const command = commandMap[commandId]
      return command(...args)
    },
  }
}
