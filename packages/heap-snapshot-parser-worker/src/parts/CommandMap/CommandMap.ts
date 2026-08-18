import { parseHeapSnapshotRequest } from '../ParseHeapSnapshotContent/ParseHeapSnapshotContent.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'HeapSnapshotParser.parse': parseHeapSnapshotRequest,
}
