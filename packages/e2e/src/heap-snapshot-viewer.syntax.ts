import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.syntax'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Workspace }) => {
  const fixtureDir = await FileSystem.loadFixture(import.meta.resolve('../fixtures'))
  const heapSnapshot = await FileSystem.readFile(`${fixtureDir}/syntax.heapsnapshot`)
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/syntax.heapsnapshot`
  await FileSystem.writeFile(uri, heapSnapshot)
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)
  await Command.execute('Timeout.sleep', 5000)

  const view = Locator('.HeapSnapshotView')
  await expect(view).toBeVisible()
  const metadataValues = Locator('.HeapSnapshotMetadataValue')
  const nodeCount = metadataValues.nth(1)
  const edgeCount = metadataValues.nth(2)
  await expect(nodeCount).toHaveText('18,108')
  await expect(edgeCount).toHaveText('67,561')

  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(errorMessage).toHaveCount(0)
  const filterInput = Locator('.HeapSnapshotFilterInput')
  await filterInput.type('RegExp')
  const constructors = Locator('.HeapSnapshotClassName')
  await expect(constructors).toHaveCount(2)
  const regexpConstructor = constructors.nth(0)
  const regexpStringIteratorConstructor = constructors.nth(1)
  await expect(regexpConstructor).toHaveText('RegExp')
  await expect(regexpStringIteratorConstructor).toHaveText('RegExp String Iterator')
  const countLabels = Locator('.HeapSnapshotCountLabel')
  const regexpCount = countLabels.nth(0)
  const regexpStringIteratorCount = countLabels.nth(1)
  await expect(regexpCount).toHaveText('× 39')
  await expect(regexpStringIteratorCount).toHaveText('× 2')
}
