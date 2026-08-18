import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.error-invalid-number'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const snapshot = {
    edges: [0, 1, 4, 0, 2, 8],
    nodes: [0, 0, 0, 2, 1, 1, -5, 0, 1, 2, 3, 0],
    snapshot: {
      meta: {
        edge_fields: ['type', 'name_or_index', 'to_node'],
        edge_types: [['property']],
        node_fields: ['type', 'name', 'self_size', 'edge_count'],
        node_types: [['synthetic', 'object']],
      },
    },
    strings: ['(GC roots)', 'Widget', 'Controller'],
  }
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/invalid-number.heapsnapshot`
  await FileSystem.writeFile(uri, JSON.stringify(snapshot))
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(errorMessage).toHaveText('Every value in "nodes" must be a non-negative 32-bit integer.')
}
