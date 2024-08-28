const rpc = globalThis.lvceRpc({
  setContent(content) {
    const pre = document.createElement('pre')
    pre.className = 'HeapSnapshotView'
    pre.textContent = content.slice(0, 1000)
    document.body.append(pre)
  },
})
