import * as CreateHeapSnapshot from '../../extension/src/parts/CreateHeapSnapshot/CreateHeapSnapshot.ts'
import * as GetAggregatesByClassName from '../../extension/src/parts/GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as GetHeapSnapshot from '../../extension/src/parts/GetHeapSnapshot/GetHeapSnapshot.ts'
import * as ParseHeapSnapshot from '../../extension/src/parts/ParseHeapSnapshot/ParseHeapSnapshot.ts'
import * as PreparseHeapSnapshot from '../../extension/src/parts/PreparseHeapSnapshot/PreparseHeapSnapshot.ts'

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
