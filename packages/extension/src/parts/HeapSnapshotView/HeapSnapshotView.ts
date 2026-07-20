import type { View } from '@lvce-editor/api'
import { createInstance, type HeapSnapshotViewInstance } from '../HeapSnapshotViewInstance/HeapSnapshotViewInstance.ts'

export const viewId = 'builtin.heap-snapshot-viewer'

export const view: View<HeapSnapshotViewInstance> = {
  create: createInstance,
  id: viewId,
  kind: 'virtualDom',
  title: 'Heap Snapshot Viewer',
}
