import * as ParseHeapSnapshotInternalEdges from '../ParseHeapSnapshotInternalEdges/ParseHeapSnapshotInternalEdges.ts'

export const parseHeapSnapshotInternal = (
  nodes: Uint32Array,
  nodeFields: readonly string[],
  nodeTypes: readonly string[],
  edges: Uint32Array,
  edgeFields: readonly string[],
  edgeTypes: readonly string[],
  strings: string[],
) => {
  console.log({ nodeFields, nodeTypes, edgeFields, edgeTypes })
  const nodeFieldCount = nodeFields.length
  const edgeCountOffset = nodeFields.indexOf('edge_count')
  const firstEdgeIndexes = ParseHeapSnapshotInternalEdges.parseHeapSnapshotInternalEdges(nodes, edgeCountOffset, nodeFieldCount)
  return {
    firstEdgeIndexes,
  }
}
