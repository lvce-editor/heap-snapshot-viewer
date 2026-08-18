import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.very-deep'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const objectCount = 2500
  const nodes = [0, 0, 0, 1]
  const edges: number[] = []
  for (let ordinal = 1; ordinal <= objectCount; ordinal++) {
    nodes.push(1, 1, 1, ordinal < objectCount ? 1 : 0)
    edges.push(0, 1, ordinal * 4)
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
    strings: ['(GC roots)', 'DeepNode'],
  })
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/very-deep.heapsnapshot`
  await FileSystem.writeFile(uri, snapshot)
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const metadataValues = Locator('.HeapSnapshotMetadataValue')
  const nodeCount = metadataValues.nth(1)
  const constructor = Locator('.HeapSnapshotClassName')
  const aggregateCount = Locator('.HeapSnapshotCountLabel')
  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(nodeCount).toHaveText('2,501')
  await expect(constructor).toHaveText('DeepNode')
  await expect(aggregateCount).toHaveText('× 2,500')
  await expect(errorMessage).toHaveCount(0)
}
