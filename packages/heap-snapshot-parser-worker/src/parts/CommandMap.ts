import { parseHeapSnapshotBlob } from './ParseHeapSnapshotBlob.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'HeapSnapshotParser.parseBlob': parseHeapSnapshotBlob,
}
