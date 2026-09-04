import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.many-rows'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Workspace }) => {
  const objectCount = 600
  const strings = ['(GC roots)']
  const nodes = [0, 0, 0, objectCount]
  const edges: number[] = []
  for (let ordinal = 1; ordinal <= objectCount; ordinal++) {
    strings.push(`Row${String(ordinal).padStart(4, '0')}`)
    nodes.push(1, ordinal, 1, 0)
    edges.push(0, ordinal, ordinal * 4)
  }
  const snapshot = JSON.stringify({
    edges,
    nodes,
    snapshot: {
      meta: {
        edge_fields: ['type', 'name_or_index', 'to_node'],
        edge_types: [['property']],
        node_fields: ['type', 'name', 'self_size', 'edge_count'],
        node_types: [['synthetic', 'object']],
      },
    },
    strings,
  })
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/many-rows.heapsnapshot`
  await FileSystem.writeFile(uri, snapshot)
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const constructors = Locator('.HeapSnapshotClassName')
  await expect(constructors).toHaveCount(500)
  const paginationLabel = Locator('.HeapSnapshotPaginationLabel')
  await expect(paginationLabel).toHaveText('Showing 1–500 of 600 constructors')
  const nextPage = Locator('.HeapSnapshotPaginationButton[name="next-page"]')
  // eslint-disable-next-line e2e/no-direct-click -- This extension-local pagination button does not have a shared page object.
  await nextPage.click()
  await Command.execute('Timeout.sleep', 200)
  await expect(constructors).toHaveCount(100)
  await expect(paginationLabel).toHaveText('Showing 501–600 of 600 constructors')
  const lastConstructor = constructors.nth(99)
  await expect(lastConstructor).toHaveText('Row0600')
  const filter = Locator('.HeapSnapshotFilterInput')
  await filter.type('Row0300')
  await Command.execute('Timeout.sleep', 200)
  const filteredConstructors = Locator('.HeapSnapshotClassName')
  await expect(filteredConstructors).toHaveCount(1)
  await expect(filteredConstructors).toHaveText('Row0300')
}
