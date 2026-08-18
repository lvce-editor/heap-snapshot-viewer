import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.error-null'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/null.heapsnapshot`
  await FileSystem.writeFile(uri, 'null')
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(errorMessage).toHaveText('Expected a JSON object with snapshot, nodes, edges, and strings.')
}
