import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer'

const basicHeapSnapshot = JSON.stringify({
  edges: [2, 3, 7, 2, 4, 14],
  nodes: [9, 0, 1, 0, 2, 0, 0, 3, 1, 2, 2300, 0, 0, 0, 3, 2, 3, 1500, 0, 0, 0],
  snapshot: {
    meta: {
      edge_fields: ['type', 'name_or_index', 'to_node'],
      edge_types: [['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak']],
      node_fields: ['type', 'name', 'id', 'self_size', 'edge_count', 'trace_node_id', 'detachedness'],
      node_types: [
        [
          'hidden',
          'array',
          'string',
          'object',
          'code',
          'closure',
          'regexp',
          'number',
          'native',
          'synthetic',
          'concatenated string',
          'sliced string',
          'symbol',
          'bigint',
          'object shape',
        ],
      ],
    },
  },
  strings: ['(GC roots)', 'Widget', 'Controller', 'widget', 'controller', '', 'a', 'a', 'é', '😀', 'line\nbreak'],
})

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test with spaces.heapsnapshot`, basicHeapSnapshot)
  await Workspace.setPath(tmpDir)

  await Main.openUri(`${tmpDir}/test with spaces.heapsnapshot`)

  const view = Locator('.HeapSnapshotView')
  await expect(view).toBeVisible()
  const table = Locator('.HeapSnapshotTable')
  await expect(table).toBeVisible()
  await expect(table).toHaveCSS('table-layout', 'fixed')
  const viewSelector = Locator('.HeapSnapshotViewSelector')
  await expect(viewSelector).toBeVisible()
  const columns = Locator('.HeapSnapshotTable > colgroup > col')
  await expect(columns).toHaveCount(3)
  const constructorColumn = columns.nth(0)
  const shallowSizeColumn = columns.nth(1)
  const retainedSizeColumn = columns.nth(2)
  await expect(constructorColumn).toHaveClass('HeapSnapshotTableColumnConstructor')
  await expect(shallowSizeColumn).toHaveClass('HeapSnapshotTableColumnShallowSize')
  await expect(retainedSizeColumn).toHaveClass('HeapSnapshotTableColumnRetainedSize')
  const metadataLabels = Locator('.HeapSnapshotMetadataLabel')
  await expect(metadataLabels).toHaveCount(3)
  const snapshotMetadataLabel = metadataLabels.nth(0)
  const nodeMetadataLabel = metadataLabels.nth(1)
  const edgeMetadataLabel = metadataLabels.nth(2)
  await expect(snapshotMetadataLabel).toHaveText('Heap size')
  await expect(nodeMetadataLabel).toHaveText('Nodes')
  await expect(edgeMetadataLabel).toHaveText('Edges')
  const metadataValues = Locator('.HeapSnapshotMetadataValue')
  const heapSize = metadataValues.nth(0)
  await expect(heapSize).toHaveText('3.8 kB')
  const memoryTypes = Locator('.HeapSnapshotMemoryTypeName')
  const memoryList = Locator('.HeapSnapshotMemoryList')
  await expect(memoryTypes).toHaveCount(1)
  await expect(memoryTypes).toHaveText('Objects')
  await expect(memoryList).toHaveCSS('display', 'flex')
  await expect(memoryList).toHaveCSS('flex-wrap', 'wrap')
  const timings = Locator('.HeapSnapshotTimingsSection')
  await expect(timings).toHaveCount(0)
  const constructors = Locator('.HeapSnapshotClassName')
  await expect(constructors).toHaveCount(2)
  const firstConstructor = constructors.nth(0)
  const secondConstructor = constructors.nth(1)
  await expect(firstConstructor).toHaveText('Widget')
  await expect(secondConstructor).toHaveText('Controller')
  const numericCells = Locator('.HeapSnapshotTableBodyRow .HeapSnapshotNumericCell')
  await expect(numericCells).toHaveCount(4)
  const firstShallowSize = numericCells.nth(0)
  const firstRetainedSize = numericCells.nth(1)
  await expect(firstShallowSize).toHaveText('2.3 kB')
  await expect(firstRetainedSize).toHaveText('2.3 kB')

  const disclosure = Locator('.HeapSnapshotDisclosure').nth(0)
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  // eslint-disable-next-line e2e/no-direct-click -- This extension-local disclosure does not have a shared page object.
  await disclosure.click()
  const details = Locator('.HeapSnapshotAggregateDetails')
  await expect(details).toBeVisible()
  await expect(details).toHaveCSS('display', 'flex')
  await expect(details).toHaveCSS('flex-wrap', 'wrap')
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  const expandedChevron = Locator('.HeapSnapshotDisclosureExpanded')
  await expect(expandedChevron).toHaveCount(1)

  const filterInput = Locator('.HeapSnapshotFilterInputWrapper > .HeapSnapshotFilterInput')
  await filterInput.type('controller')
  await expect(filterInput).toHaveValue('controller')

  const filteredConstructors = Locator('.HeapSnapshotClassName')
  await expect(filteredConstructors).toHaveCount(1)
  await expect(filteredConstructors).toHaveText('Controller')

  const statisticsTab = Locator('.HeapSnapshotViewTab').nth(1)
  // eslint-disable-next-line e2e/no-direct-click -- The view selector is extension-local and has no shared page object.
  await statisticsTab.click()
  const statistics = Locator('.HeapSnapshotStatistics')
  const donut = Locator('.HeapSnapshotDonut')
  const donutLegend = Locator('.HeapSnapshotDonutLegend')
  const donutTotal = Locator('.HeapSnapshotDonutTotal')
  const donutName = Locator('.HeapSnapshotDonutName')
  const constructorTable = Locator('.HeapSnapshotTable')
  await expect(statistics).toBeVisible()
  await expect(donut).toBeVisible()
  await expect(donut).toHaveCSS('display', 'flex')
  await expect(donutLegend).toHaveCSS('flex-direction', 'column')
  await expect(donutTotal).toHaveText('3.8 kB')
  await expect(donutName).toHaveText('Objects')
  await expect(constructorTable).toHaveCount(0)

  const constructorsTab = Locator('.HeapSnapshotViewTab').nth(0)
  // eslint-disable-next-line e2e/no-direct-click -- The view selector is extension-local and has no shared page object.
  await constructorsTab.click()
  await expect(constructorTable).toBeVisible()
  await expect(filteredConstructors).toHaveCount(1)

  const stringsTab = Locator('.HeapSnapshotViewTab').nth(2)
  // eslint-disable-next-line e2e/no-direct-click -- The view selector is extension-local and has no shared page object.
  await stringsTab.click()
  const editor = Locator('.Editor')
  await expect(editor).toBeVisible()
  const stringRows = Locator('.EditorRow')
  await expect(stringRows).toHaveCount(11)
  const expectedStrings = [
    '""',
    '"a"',
    '"a"',
    '"é"',
    '"😀"',
    '"Widget"',
    '"widget"',
    '"(GC roots)"',
    '"Controller"',
    '"controller"',
    '"line\\nbreak"',
  ]
  for (let index = 0; index < expectedStrings.length; index++) {
    const stringRow = stringRows.nth(index)
    await expect(stringRow).toHaveText(expectedStrings[index])
  }
  // Read-only providers reject persistence even though LVCE permits buffer edits.
  await Editor.type('unsaved buffer edit')
  await Main.save()

  await Main.closeAllEditors()
  const sourceUri = `${tmpDir}/test with spaces.heapsnapshot`
  const stringsUri = `heapnapshot-strings:///${encodeURIComponent(sourceUri)}.json`
  await Main.openUri(stringsUri)
  await expect(editor).toBeVisible()
  await expect(stringRows).toHaveCount(11)
  const firstStringRow = stringRows.nth(0)
  const lastStringRow = stringRows.nth(10)
  await expect(firstStringRow).toHaveText('""')
  await expect(lastStringRow).toHaveText('"line\\nbreak"')

  await Main.closeAllEditors()
  const malformedUri = `${tmpDir}/malformed.heapsnapshot`
  await FileSystem.writeFile(malformedUri, 'not json')
  await Main.openUri(`heapnapshot-strings:///${encodeURIComponent(malformedUri)}.json`)
  const errorMessage = Locator('.TextEditorErrorMessage')
  await expect(errorMessage).toHaveText('The file is not valid JSON. Check the file contents and try again.')
}
