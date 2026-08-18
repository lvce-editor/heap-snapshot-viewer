import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.empty-snapshot'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const snapshot = JSON.stringify({
    edges: [],
    nodes: [0, 0, 0, 0],
    snapshot: {
      meta: {
        edge_fields: ['type', 'name_or_index', 'to_node'],
        edge_types: [['property']],
        node_fields: ['type', 'name', 'self_size', 'edge_count'],
        node_types: [['synthetic']],
      },
    },
    strings: ['(GC roots)'],
  })
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/root-only.heapsnapshot`
  await FileSystem.writeFile(uri, snapshot)
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const view = Locator('.HeapSnapshotView')
  const metadataValues = Locator('.HeapSnapshotMetadataValue')
  const nodeCount = metadataValues.nth(1)
  const edgeCount = metadataValues.nth(2)
  const constructors = Locator('.HeapSnapshotClassName')
  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(view).toBeVisible()
  await expect(nodeCount).toHaveText('1')
  await expect(edgeCount).toHaveText('0')
  await expect(constructors).toHaveCount(0)
  await expect(errorMessage).toHaveCount(0)
}
