import * as AddAccurateSizes from '../AddAccurateSizes/AddAccurateSizes.ts'
import * as EdgeFieldType from '../EdgeFieldType/EdgeFieldType.ts'
import * as ParseHeapSnapshotInternalEdges from '../ParseHeapSnapshotInternalEdges/ParseHeapSnapshotInternalEdges.ts'

export const parseHeapSnapshotInternal = (
  nodes: Uint32Array,
  nodeFields: readonly string[],
  nodeTypes: readonly string[],
  edges: Uint32Array,
  edgeFields: readonly string[],
  edgeTypes: readonly string[],
) => {
  const nodeFieldCount = nodeFields.length
  const edgeCountOffset = nodeFields.indexOf(EdgeFieldType.EdgeCount)
  const firstEdgeIndexes = ParseHeapSnapshotInternalEdges.parseHeapSnapshotInternalEdges(nodes, edgeCountOffset, nodeFieldCount)
  AddAccurateSizes.addAccurateSizes(nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, firstEdgeIndexes)
  return {
    firstEdgeIndexes,
  }
}
