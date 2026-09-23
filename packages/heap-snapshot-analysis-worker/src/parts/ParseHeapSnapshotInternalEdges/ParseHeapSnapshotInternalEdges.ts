export const parseHeapSnapshotInternalEdges = (
  nodes: Uint32Array,
  edgeCountOffset: number,
  nodeFieldCount: number,
  edgeFieldCount: number,
) => {
  const nodeCount = nodes.length / nodeFieldCount
  const firstEdgeIndexes = new Uint32Array(nodeCount)
  let edgeIndex = 0
  for (let i = 0; i < nodeCount; i++) {
    firstEdgeIndexes[i] = edgeIndex
    edgeIndex += nodes[i * nodeFieldCount + edgeCountOffset] * edgeFieldCount
  }
  return firstEdgeIndexes
}
