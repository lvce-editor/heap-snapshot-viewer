import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.zz-average-shallow'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Workspace }) => {
  const fixtureDir = await FileSystem.loadFixture(import.meta.resolve('../fixtures'))
  const heapSnapshot = await FileSystem.readFile(`${fixtureDir}/syntax.heapsnapshot`)
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/syntax.heapsnapshot`
  await FileSystem.writeFile(uri, heapSnapshot)
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)
  await Command.execute('Timeout.sleep', 5000)

  const filterInput = Locator('.HeapSnapshotFilterInput')
  await filterInput.type('Function')
  const disclosure = Locator('.HeapSnapshotDisclosure[name="toggle-aggregate:Function"]')
  // eslint-disable-next-line e2e/no-direct-click -- This extension-local disclosure does not have a shared page object.
  await disclosure.click()
  const averageShallow = Locator('.HeapSnapshotAggregateDetailValue').nth(2)
  await expect(averageShallow).toHaveText('30.61 B')
}
