import * as GetOrCreateWorker from '../GetOrCreateWorker/GetOrCreateWorker.js'
import * as LaunchJsonWorker from '../LaunchHeapSnapshotWorker/LaunchHeapSnapshotWorker.js'

const { invoke } = GetOrCreateWorker.getOrCreateWorker(LaunchJsonWorker.launchHeapSnapshotWorker)

export { invoke }
