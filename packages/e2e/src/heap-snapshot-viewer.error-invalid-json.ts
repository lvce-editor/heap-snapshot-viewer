import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.error-invalid-json'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/invalid-json.heapsnapshot`
  await FileSystem.writeFile(uri, '{ "snapshot": ')
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(errorMessage).toHaveText('The file is not valid JSON. Check the file contents and try again.')
}
