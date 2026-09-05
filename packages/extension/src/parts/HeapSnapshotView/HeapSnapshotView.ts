import type { InstanceView } from '@lvce-editor/api'
import type { HeapSnapshotComponentState } from '../HeapSnapshotViewInstance/HeapSnapshotViewInstance.ts'
import { createInstance, type HeapSnapshotViewInstance } from '../HeapSnapshotViewInstance/HeapSnapshotViewInstance.ts'

export const viewId = 'builtin.heap-snapshot-viewer'

export const view: InstanceView<HeapSnapshotViewInstance, HeapSnapshotComponentState> = {
  create: createInstance,
  getComponentState: (instance) => instance.getComponentState(),
  id: viewId,
  kind: 'virtualDom',
  setComponentState: (instance, state) => instance.setComponentState(state),
  title: 'Heap Snapshot Viewer',
}
