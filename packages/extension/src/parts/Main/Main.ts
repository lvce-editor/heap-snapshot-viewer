import * as FilterAggregates from '../FilterAggregates/FilterAggregates.ts'
import * as HeapSnapshotWorker from '../HeapSnapshotWorker/HeapSnapshotWorker.ts'

// TODO for best performance:
// 1. create heapsnapshot worker
// 2. create connection between heapsnapshot worker and iframe
// 3. create connection between heapsnapshot worker and electron shared process
// 4. read file, send file directly from shared process to heapsnapshot worker
// 5. parse heapsnapshot file
// 6. send visible regions from heapsnapshot worker to iframe
const webViewProvider = {
  id: 'builtin.heap-snapshot-viewer',
  async create(webView, uri) {
    const timings: any[] = []
    const startReadFile = performance.now()
    // @ts-ignore
    const content = await vscode.readFile(uri)
    const endReadFile = performance.now()
    timings.push({
      name: 'read-file',
      time: endReadFile - startReadFile,
    })
    // TODO use heapsnapshot worker to parse heapsnapshot
    const heapSnapshotId = 1
    const createTime = performance.now()
    await HeapSnapshotWorker.invoke('HeapSnapshot.create', heapSnapshotId, content)
    const createTimeEnd = performance.now()
    timings.push({
      name: 'create',
      time: createTimeEnd - createTime,
    })
    const preparseTime = performance.now()
    await HeapSnapshotWorker.invoke('HeapSnapshot.preparse', heapSnapshotId)
    const preparseTimeEnd = performance.now()
    timings.push({
      name: 'pre-parse',
      time: preparseTimeEnd - preparseTime,
    })
    const parseTime = performance.now()
    await HeapSnapshotWorker.invoke('HeapSnapshot.parse', heapSnapshotId)
    const parseTimeEnd = performance.now()
    timings.push({
      name: 'parse',
      time: parseTimeEnd - parseTime,
    })

    const aggregatesStart = performance.now()
    const aggregrates = await HeapSnapshotWorker.invoke('HeapSnapshot.getAggregatesByClassName', heapSnapshotId)
    const aggregatesEnd = performance.now()
    timings.push({
      name: 'aggregates',
      time: aggregatesEnd - aggregatesStart,
    })

    timings.push({
      name: 'total',
      time: aggregatesEnd - startReadFile,
    })

    await HeapSnapshotWorker.invoke('HeapSnapshot.dispose', heapSnapshotId)
    await webView.invoke('initialize', aggregrates, timings)
    // TODO support connecting state to webview
    // @ts-ignore
    this.aggregates = aggregrates
    // @ts-ignore
    this.webView = webView
  },
  async open(uri, webView) {
    // const content = await vscode.readFile(uri)
    // webView.postMessage({
    //   jsonrpc: '2.0',`
    //   method: 'setContent',
    //   params: [content],
    // })
  },
  commands: {
    async handleInput(text) {
      // @ts-ignore
      const aggregates = webViewProvider.aggregates
      // @ts-ignore
      const webView = webViewProvider.webView
      const filtered = FilterAggregates.filterAggregates(aggregates, text)
      await webView.invoke('setContent', filtered)
    },
  },
}

export const activate = () => {
  // @ts-ignore
  vscode.registerWebViewProvider(webViewProvider)
}
