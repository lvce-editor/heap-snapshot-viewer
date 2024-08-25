const webViewProvider = {
  id: 'builtin.heap-snapshot-viewer',
  async open(uri, webView) {
    // const content = await vscode.readFile(uri)
    // webView.postMessage({
    //   jsonrpc: '2.0',
    //   method: 'setContent',
    //   params: [content],
    // })
  },
}

export const activate = () => {
  // @ts-ignore
  vscode.registerWebViewProvider(webViewProvider)
}
