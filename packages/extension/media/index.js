const handleInput = async (event) => {
  const { target } = event
  const { value } = target
  console.log('before invoke')
  await rpc.invoke('handleInput', value)
  console.log('after invoke')
}

const setContent = (parsedNodes) => {
  const app = document.createElement('div')
  app.className = 'App'

  const header = document.createElement('header')
  header.className = 'Header'

  const filterInput = document.createElement('input')
  filterInput.className = 'FilterInput'
  filterInput.placeholder = 'Filter'
  filterInput.addEventListener('input', handleInput)
  header.append(filterInput)
  app.append(header)

  const table = document.createElement('table')
  table.className = 'Table'

  const thead = document.createElement('thead')
  thead.className = 'TableHeader'
  const firstRow = document.createElement('tr')
  firstRow.className = 'TableHeaderRow'
  const firstColumnLabelCell = document.createElement('th')
  firstColumnLabelCell.className = 'TableHeaderCell'
  firstColumnLabelCell.textContent = 'Constructor'
  firstRow.append(firstColumnLabelCell)
  thead.append(firstRow)
  table.append(thead)

  const tbody = document.createElement('tbody')
  tbody.className = 'TableBody'
  for (const node of parsedNodes) {
    const tr = document.createElement('tr')
    tr.className = 'TableBodyRow'
    const td1 = document.createElement('td')
    td1.className = 'TableCell'

    const classNameLabel = document.createElement('span')
    classNameLabel.className = 'ClassName'
    classNameLabel.textContent = node.name

    const countLabel = document.createElement('span')
    countLabel.className = 'CountLabel'
    countLabel.textContent = `x ${node.count}`

    td1.append(classNameLabel, countLabel)
    tr.append(td1)
    tbody.append(tr)
  }
  table.append(tbody)
  app.append(table)

  document.body.append(app)
  // const pre = document.createElement('pre')
  // pre.className = 'HeapSnapshotView'
  // const stringified = JSON.stringify(parsedNodes, null, 2)
  // pre.textContent = stringified
  // document.body.append(pre)
}

const rpc = globalThis.lvceRpc({
  setContent,
})
