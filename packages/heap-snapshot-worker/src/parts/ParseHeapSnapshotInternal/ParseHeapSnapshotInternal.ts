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
  // Assert.array(nodeFields)
  // Assert.array(nodeTypes)
  // Assert.array(edgeFields)
  // Assert.array(edgeTypes)
  // Assert.array(strings)
  // const parsedNodes = ParseHeapSnapshotInternalNodes.parseHeapSnapshotInternalNodes(nodes, nodeFields, nodeTypes, strings)
  const nodeFieldCount = nodeFields.length
  const edgeCountOffset = nodeFields.indexOf('edge_count')
  const firstEdgeIndexes = ParseHeapSnapshotInternalEdges.parseHeapSnapshotInternalEdges(nodes, edgeCountOffset, nodeFieldCount)
  // const graph = ParseHeapSnapshotInternalGraph.parseHeapSnapshotInternalGraph(parsedNodes, parsedEdges)
  // AddAccurateSizes.addAccurateSizes(graph, parsedNodes)
  // const cleanNodes = CleanNodes.cleanNode(parsedNodes)
  return {
    firstEdgeIndexes,
    // parsedNodes: cleanNodes,
    // graph,
  }
}
