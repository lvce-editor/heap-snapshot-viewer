import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.error-unexpected-shape'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/unexpected-shape.heapsnapshot`
  await FileSystem.writeFile(uri, JSON.stringify({ edges: [], nodes: [], strings: [] }))
  await Workspace.setPath(tmpDir)
  await Main.openUri(uri)

  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(errorMessage).toHaveText('The heap snapshot is missing the required "snapshot" object.')
}
