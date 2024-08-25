const rpc = globalThis.lvceRpc({
  setContent(content) {
    console.log({ content })
  },
})

console.log('did load index js')
