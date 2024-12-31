import * as CreateHeapSnapshot from '../CreateHeapSnapshot/CreateHeapSnapshot.ts'
import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'
import * as PreparseHeapSnapshot from '../PreparseHeapSnapshot/PreparseHeapSnapshot.ts'
import * as Rpc from '../Rpc/Rpc.ts'

export const create = async ({ port, savedState, webViewId, uri, id }) => {
  const timings: any[] = []
  const startReadFile = performance.now()

  const content = await Rpc.invoke('WebView.readFile', uri)
  const endReadFile = performance.now()

  timings.push({
    name: 'read-file',
    time: endReadFile - startReadFile,
  })
  const createTime = performance.now()

  CreateHeapSnapshot.createHeapSnapshot(id, content)
  const createTimeEnd = performance.now()
  timings.push({
    name: 'create',
    time: createTimeEnd - createTime,
  })

  const preparseTime = performance.now()
  PreparseHeapSnapshot.preparseHeapSnapshot(id)
  const preparseTimeEnd = performance.now()
  timings.push({
    name: 'pre-parse',
    time: preparseTimeEnd - preparseTime,
  })

  const parseTime = performance.now()
  ParseHeapSnapshot.parseHeapSnapshot(id)
  const parseTimeEnd = performance.now()
  timings.push({
    name: 'parse',
    time: parseTimeEnd - parseTime,
  })

  const aggregatesStart = performance.now()
  const aggregrates = await GetAggregatesByClassName.getAggregratesByClassName(id)
  const aggregatesEnd = performance.now()
  timings.push({
    name: 'aggregates',
    time: aggregatesEnd - aggregatesStart,
  })

  await port.invoke('initialize', aggregrates, timings)

  return {}
}
