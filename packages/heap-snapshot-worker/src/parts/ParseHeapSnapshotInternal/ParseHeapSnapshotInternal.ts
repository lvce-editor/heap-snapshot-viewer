import * as Assert from '../Assert/Assert.ts'
import * as CleanNodes from '../CleanNodes/CleanNodes.ts'
import * as ParseHeapSnapshotInternalEdges from '../ParseHeapSnapshotInternalEdges/ParseHeapSnapshotInternalEdges.ts'
import * as ParseHeapSnapshotInternalGraph from '../ParseHeapSnapshotInternalGraph/ParseHeapSnapshotInternalGraph.ts'
import * as ParseHeapSnapshotInternalNodes from '../ParseHeapSnapshotInternalNodes/ParseHeapSnapshotInternalNodes.ts'

export const parseHeapSnapshotInternal = (
  nodes,
  nodeFields,
  nodeTypes,
  edges,
  edgeFields,
  edgeTypes,
  strings,
) => {
  Assert.array(nodes)
  Assert.array(nodeFields)
  Assert.array(nodeTypes)
  Assert.array(edges)
  Assert.array(edgeFields)
  Assert.array(edgeTypes)
  Assert.array(strings)
  const parsedNodes =
    ParseHeapSnapshotInternalNodes.parseHeapSnapshotInternalNodes(
      nodes,
      nodeFields,
      nodeTypes,
      strings,
    )
  const parsedEdges =
    ParseHeapSnapshotInternalEdges.parseHeapSnapshotInternalEdges(
      edges,
      edgeFields,
      edgeTypes,
      nodeFields.length,
      strings,
    )
  const graph = ParseHeapSnapshotInternalGraph.parseHeapSnapshotInternalGraph(
    parsedNodes,
    parsedEdges,
  )
  const cleanNodes = CleanNodes.cleanNode(parsedNodes)
  return {
    parsedNodes: cleanNodes,
    graph,
  }
}