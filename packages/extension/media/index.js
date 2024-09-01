const setContent = (parsedNodes) => {
  // const overview = document.createElement('ul')
  // overview.className = 'Overview'
  const pre = document.createElement('pre')
  pre.className = 'HeapSnapshotView'
  const stringified = JSON.stringify(parsedNodes, null, 2)
  pre.textContent = stringified.slice(0, 1000)
  document.body.append(pre)
}

const rpc = globalThis.lvceRpc({
  setContent,
})
