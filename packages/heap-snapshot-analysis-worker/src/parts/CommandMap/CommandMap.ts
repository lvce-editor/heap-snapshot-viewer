import { analyzeHeapSnapshot } from '../AnalyzeHeapSnapshot/AnalyzeHeapSnapshot.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'HeapSnapshotAnalysis.analyze': analyzeHeapSnapshot,
}
