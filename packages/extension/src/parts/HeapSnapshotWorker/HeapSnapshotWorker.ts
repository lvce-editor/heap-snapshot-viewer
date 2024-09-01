import * as GetOrCreateWorker from '../GetOrCreateWorker/GetOrCreateWorker.ts'
import * as LaunchHeapSnapshotWorker from '../LaunchHeapSnapshotWorker/LaunchHeapSnapshotWorker.ts'

const { invoke } = GetOrCreateWorker.getOrCreateWorker(LaunchHeapSnapshotWorker.launchHeapSnapshotWorker)

export { invoke }
