import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.error-inconsistent-edge-count'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const snapshot = {
    edges: [0, 1, 4, 0, 2, 8],
    nodes: [0, 0, 0, 1, 1, 1, 5, 0, 1, 2, 3, 0],
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
  const uri = `${tmpDir}/inconsistent-edge-count.heapsnapshot`
  await FileSystem.writeFile(uri, JSON.stringify(snapshot))
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(errorMessage).toHaveText('The nodes declare 1 edge, but the snapshot contains 2.')
}
