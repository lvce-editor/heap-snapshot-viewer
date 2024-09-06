import * as AddAccurateSizes from '../AddAccurateSizes/AddAccurateSizes.ts'
import * as NodeFieldType from '../NodeFieldType/NodeFieldType.ts'
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
  const edgeFieldCount = edgeFields.length
  const edgeCountOffset = nodeFields.indexOf(NodeFieldType.EdgeCount)
  const firstEdgeIndexes = ParseHeapSnapshotInternalEdges.parseHeapSnapshotInternalEdges(
    nodes,
    edgeCountOffset,
    nodeFieldCount,
    edgeFieldCount,
  )
  AddAccurateSizes.addAccurateSizes(nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, firstEdgeIndexes)
  return {
    firstEdgeIndexes,
  }
}
