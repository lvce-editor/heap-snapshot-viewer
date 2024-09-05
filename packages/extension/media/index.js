// TODO use virtual dom in heap snapshot worker

const handleInput = async (event) => {
  const { target } = event
  const { value } = target
  await rpc.invoke('handleInput', value)
}

const setContent = (parsedNodes) => {
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
  const app = document.querySelector('.App')
  // @ts-ignore
  const existingTable = app.querySelector('table')
  if (existingTable) {
    existingTable.remove()
  }
  // @ts-ignore
  app.append(table)
}

const initialize = (parsedNodes, timings) => {
  const app = document.createElement('div')
  app.className = 'App'

  const header = document.createElement('header')
  header.className = 'Header'

  const filterInput = document.createElement('input')
  filterInput.className = 'FilterInput'
  filterInput.name = 'FilterInput'
  filterInput.placeholder = 'Filter'
  filterInput.addEventListener('input', handleInput)
  header.append(filterInput)
  app.append(header)
  document.body.append(app)
  const timingsElement = document.createElement('ul')
  timingsElement.className = 'Timings'
  for (const item of timings) {
    const listItem = document.createElement('li')
    listItem.textContent = `${item.name}: ${item.time.toFixed(2)}`
    timingsElement.append(listItem)
  }
  app.append(timingsElement)

  setContent(parsedNodes)
}

const rpc = globalThis.lvceRpc({
  initialize,
  setContent,
})
