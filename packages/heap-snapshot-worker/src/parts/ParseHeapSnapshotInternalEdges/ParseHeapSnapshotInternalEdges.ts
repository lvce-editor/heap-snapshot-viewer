export const parseHeapSnapshotInternalEdges = (nodes: Uint32Array, edgeCountOffset: number, nodeFieldCount: number) => {
  const nodeCount = nodes.length / nodeFieldCount
  const firstEdgeIndexes = new Uint32Array(nodeCount + 1)
  let edgeIndex = 0
  for (let i = 0; i < nodeCount; i++) {
    firstEdgeIndexes[i] = edgeIndex
    const edgeCount = nodes[i * nodeFieldCount + edgeCountOffset]
    edgeIndex += edgeCount
  }
  return firstEdgeIndexes
}
