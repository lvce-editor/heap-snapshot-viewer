import { activate as activateExtensionApi, registerView } from '@lvce-editor/api'
import { dispose as disposeHeapSnapshotParserWorker } from '../HeapSnapshotParserWorker/HeapSnapshotParserWorker.ts'
import { view } from '../HeapSnapshotView/HeapSnapshotView.ts'

const state = {
  isActivated: false,
}

export const activate = async (): Promise<void> => {
  if (state.isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  registerView(view)
}

export const deactivate = async (): Promise<void> => {
  await disposeHeapSnapshotParserWorker()
}
