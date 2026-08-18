import { parseHeapSnapshotContent } from '../ParseHeapSnapshotContent/ParseHeapSnapshotContent.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'HeapSnapshotParser.parse': parseHeapSnapshotContent,
}
