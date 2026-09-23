import { HeapSnapshotValidationError } from './HeapSnapshotValidationError.ts'
import * as ValidateHeapSnapshot from './ValidateHeapSnapshot.ts'

export interface ParsedHeapSnapshotData {
  readonly edgeFields: readonly string[]
  readonly edges: Uint32Array
  readonly edgeTypes: readonly string[]
  readonly nodeFields: readonly string[]
  readonly nodes: Uint32Array
  readonly nodeTypes: readonly string[]
  readonly rootNodeIndex: number
  readonly snapshotSize: number
  readonly strings: readonly string[]
}

export type ParseHeapSnapshotResult =
  | { readonly type: 'success'; readonly value: ParsedHeapSnapshotData }
  | { readonly type: 'validation-error'; readonly message: string }

export const parseHeapSnapshotBlob = async (blob: Blob): Promise<ParseHeapSnapshotResult> => {
  try {
    const content = await blob.text()
    return {
      type: 'success',
      value: {
        ...ValidateHeapSnapshot.validateHeapSnapshot(content),
        snapshotSize: blob.size,
      },
    }
  } catch (error) {
    if (error instanceof HeapSnapshotValidationError) {
      return { message: error.message, type: 'validation-error' }
    }
    throw error
  }
}
