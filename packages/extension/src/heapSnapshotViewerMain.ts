export const activate = () => {
  vscode.registerViewer({
    id: 'builtin.heap-snapshot-viewer',
    async open(uri, webView) {
      const content = await vscode.readFile(uri)
      webView.postMessage({
        jsonrpc: '2.0',
        method: 'setContent',
        params: [content],
      })
    },
  })
  console.log('hello from heap snapshot viewer')
}
