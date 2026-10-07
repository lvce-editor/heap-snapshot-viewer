import * as DisposeWorker from './DisposeWorker/DisposeWorker.ts'
import { parseHeapSnapshotBlob } from './ParseHeapSnapshotBlob.ts'

export const getHeapSnapshotStrings = async (blob: Blob): Promise<readonly string[]> => {
  const result = await parseHeapSnapshotBlob(blob)
  if (result.type === 'validation-error') {
    throw new Error(result.message)
  }
  return result.value.strings
}

export const commandMap: Readonly<Record<string, unknown>> = {
  'HeapSnapshotParser.getStrings': getHeapSnapshotStrings,
  'HeapSnapshotParser.parseBlob': parseHeapSnapshotBlob,
  'Worker.dispose': DisposeWorker.dispose,
}
