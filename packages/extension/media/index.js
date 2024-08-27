const rpc = globalThis.lvceRpc({
  setContent(content) {
    const pre = document.createElement('pre')
    pre.textContent = content
    document.body.append(pre)
  },
})
