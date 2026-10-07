import { analyzeHeapSnapshot } from '../AnalyzeHeapSnapshot/AnalyzeHeapSnapshot.ts'
import * as DisposeWorker from '../DisposeWorker/DisposeWorker.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'HeapSnapshotAnalysis.analyze': analyzeHeapSnapshot,
  'Worker.dispose': DisposeWorker.dispose,
}
