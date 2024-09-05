import * as fs from 'node:fs'
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
  const edgeCountOffset = nodeFields.indexOf(NodeFieldType.EdgeCount)
  const firstEdgeIndexes = ParseHeapSnapshotInternalEdges.parseHeapSnapshotInternalEdges(nodes, edgeCountOffset, nodeFieldCount)
  // const result: any[] = []
  // for (let i = 0; i < nodes.length; i += nodeFieldCount) {
  //   const idOffset = 2
  //   const edgeOffset = 4
  //   const nodeId = nodes[i + idOffset]
  //   const edgeCount = nodes[i + edgeOffset]
  //   result.push({
  //     nodeId,
  //     edgeCount,
  //   })
  // }
  // fs.writeFileSync('/tmp/b.json', JSON.stringify(result, null, 2) + '\n')
  AddAccurateSizes.addAccurateSizes(nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, firstEdgeIndexes)
  return {
    firstEdgeIndexes,
  }
}
