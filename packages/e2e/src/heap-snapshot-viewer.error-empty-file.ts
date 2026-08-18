import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.error-empty-file'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/empty.heapsnapshot`
  await FileSystem.writeFile(uri, '')
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const errorTitle = Locator('.HeapSnapshotErrorTitle')
  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(errorTitle).toHaveText('Unable to open heap snapshot')
  await expect(errorMessage).toHaveText('The file is empty. Select a non-empty .heapsnapshot file and try again.')
}
