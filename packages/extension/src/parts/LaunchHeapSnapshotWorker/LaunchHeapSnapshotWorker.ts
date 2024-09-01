import * as HeapSnapshotWorkerUrl from '../HeapSnapshotWorkerUrl/HeapSnapshotWorkerUrl.ts'

const execute = (method, ...params) => {
  return {}
}

export const launchHeapSnapshotWorker = async () => {
  // @ts-ignore
  const rpc = await vscode.createRpc({
    url: HeapSnapshotWorkerUrl.heapSnapshotWorkerUrl,
    name: 'Heap Snapshot Worker',
    execute,
  })
  return rpc
}
