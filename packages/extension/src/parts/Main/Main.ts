import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'
import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as FilterAggregates from '../FilterAggregates/FilterAggregates.ts'

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
    // @ts-ignore
    const content = await vscode.readFile(uri)
    // TODO use heapsnapshot worker to parse heapsnapshot
    const parsed = ParseHeapSnapshot.parseHeapSnapshot(content)
    console.time('aggregate')
    const aggregrates =
      GetAggregatesByClassName.getAggregratesByClassName(parsed)
    console.timeEnd('aggregate')
    await webView.invoke('initialize', aggregrates)
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
