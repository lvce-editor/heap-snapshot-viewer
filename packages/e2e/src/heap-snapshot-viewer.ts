import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer'

const heapSnapshot = JSON.stringify({
  edges: [2, 3, 7, 2, 4, 14],
  nodes: [9, 0, 1, 0, 2, 0, 0, 3, 1, 2, 5, 0, 0, 0, 3, 2, 3, 3, 0, 0, 0],
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
  strings: ['(GC roots)', 'Widget', 'Controller', 'widget', 'controller'],
})

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.heapsnapshot`, heapSnapshot)
  await Workspace.setPath(tmpDir)

  await Main.openUri(`${tmpDir}/test.heapsnapshot`)

  const view = Locator('.HeapSnapshotView')
  await expect(view).toBeVisible()
  const table = Locator('.HeapSnapshotTable')
  await expect(table).toBeVisible()
  await expect(table).toHaveCSS('table-layout', 'fixed')
  const metadataLabels = Locator('.HeapSnapshotMetadataLabel')
  await expect(metadataLabels).toHaveCount(3)
  const snapshotMetadataLabel = metadataLabels.nth(0)
  const nodeMetadataLabel = metadataLabels.nth(1)
  const edgeMetadataLabel = metadataLabels.nth(2)
  await expect(snapshotMetadataLabel).toHaveText('Snapshot')
  await expect(nodeMetadataLabel).toHaveText('Nodes')
  await expect(edgeMetadataLabel).toHaveText('Edges')
  const memoryTypes = Locator('.HeapSnapshotMemoryTypeName')
  await expect(memoryTypes).toHaveCount(1)
  await expect(memoryTypes).toHaveText('Objects')
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
  await expect(firstShallowSize).toHaveText('5 B')
  await expect(firstRetainedSize).toHaveText('5 B')

  const disclosure = Locator('.HeapSnapshotDisclosure').nth(0)
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  await disclosure.dispatchEvent('click', { bubbles: true } as unknown as string)
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  const details = Locator('.HeapSnapshotAggregateDetails')
  await expect(details).toBeVisible()
  const expandedChevron = Locator('.HeapSnapshotChevronExpanded')
  await expect(expandedChevron).toHaveCount(1)

  const filterInput = Locator('.HeapSnapshotFilterInputWrapper > .HeapSnapshotFilterInput')
  await filterInput.type('controller')
  await expect(filterInput).toHaveValue('controller')
  await new Promise((resolve) => setTimeout(resolve, 100))

  const filteredConstructors = Locator('.HeapSnapshotClassName')
  await expect(filteredConstructors).toHaveCount(1)
  await expect(filteredConstructors).toHaveText('Controller')
}
