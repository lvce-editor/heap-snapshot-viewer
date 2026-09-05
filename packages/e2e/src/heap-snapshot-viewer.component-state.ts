import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'heap-snapshot-viewer.component-state'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/state.heapsnapshot`, '{')
  await Main.openUri(`${tmpDir}/state.heapsnapshot`)
  const errorMessage = Locator('.HeapSnapshotErrorMessage')
  await expect(errorMessage).toBeVisible()
  const components = (await Command.execute('ComponentState.getComponents')) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'ExtensionView')
  if (!component?.editable) {
    throw new Error('Expected editable extension component state')
  }
  const state = await Command.execute('ComponentState.getState', component.uid)
  if (typeof state.errorMessage !== 'string') {
    throw new TypeError('Expected live heap snapshot error state')
  }
  await Command.execute('ComponentState.setState', component.uid, { ...state, errorMessage: 'Inspector heap snapshot error' })
  await expect(errorMessage).toHaveText('Inspector heap snapshot error')
}
