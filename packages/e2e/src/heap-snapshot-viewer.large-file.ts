import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.large-file'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const objectCount = 2000
  const nodes = [0, 0, 0, objectCount]
  const edges: number[] = []
  for (let ordinal = 1; ordinal <= objectCount; ordinal++) {
    nodes.push(1, 1, 1, 0)
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
    strings: ['(GC roots)', 'LargeItem', 'x'.repeat(1.5 * 1000 * 1000)],
  })
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/large.heapsnapshot`
  await FileSystem.writeFile(uri, snapshot)
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const metadataValues = Locator('.HeapSnapshotMetadataValue')
  const snapshotSize = metadataValues.nth(0)
  const nodeCount = metadataValues.nth(1)
  const aggregateCount = Locator('.HeapSnapshotCountLabel')
  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(snapshotSize).toContainText('MB')
  await expect(nodeCount).toHaveText('2,001')
  await expect(aggregateCount).toHaveText('× 2,000')
  await expect(errorMessage).toHaveCount(0)
}
