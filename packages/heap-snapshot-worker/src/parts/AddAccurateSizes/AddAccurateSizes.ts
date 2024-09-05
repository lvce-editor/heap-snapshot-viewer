// based on Chrome Devtools Heap Snapshot(https://github.com/ChromeDevTools/devtools-frontend/blob/7ca2fec01b492e9b23b21738394200397a74c4aa/front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts, License BSD)
import * as EdgeFieldType from '../EdgeFieldType/EdgeFieldType.ts'
import * as EdgeType from '../EdgeType/EdgeType.ts'
import * as NodeFieldType from '../NodeFieldType/NodeFieldType.ts'
import * as NodeType from '../NodeType/NodeType.ts'

const getNodeType = (nodes: Uint32Array, i: number, typeIndex: number, nodeTypes: readonly string[]) => {
  const value = nodes[i + typeIndex]
  return nodeTypes[value]
}
const getEdgeType = (edges: Uint32Array, i: number, typeIndex: number, edgeTypes: readonly string[]) => {
  const value = edges[i + typeIndex]
  return edgeTypes[value]
}

export const addAccurateSizes = (
  nodes: Uint32Array,
  nodeFields: readonly string[],
  nodeTypes: readonly string[],
  edges: Uint32Array,
  edgeFields: readonly string[],
  edgeTypes: readonly string[],
  strings: readonly string[],
  firstEdgeIndexes: Uint32Array,
) => {
  const owners = new Uint32Array(nodes.length)
  const kUnvisited = 0xffffffff
  const kHasMultipleOwners = 0xfffffffe
  const worklist: number[] = []
  const typeIndex = nodeFields.indexOf(NodeFieldType.Type)
  const edgeCountOffset = nodeFields.indexOf(NodeFieldType.EdgeCount)
  const edgeFieldCount = edgeFields.length
  const edgeTypeOffset = edgeFields.indexOf(EdgeFieldType.Type)
  const edgeToNodeOffset = edgeFields.indexOf(EdgeFieldType.ToNode)
  const nodeSizeOffset = nodeFields.indexOf(NodeFieldType.SelfSize)
  const nodeFieldCount = nodeFields.length
  const nodeCount = nodes.length / nodeFieldCount
  let nodeIndex = 0
  for (let i = 0; i < nodeCount; i++) {
    const nodeType = getNodeType(nodes, nodeIndex, typeIndex, nodeTypes)
    // TODO compare number?
    if (nodeType === NodeType.Hidden || nodeType === NodeType.Array) {
      owners[i] = kUnvisited
    } else {
      owners[i] = i
      worklist.push(i)
    }
    nodeIndex += nodeFieldCount
  }
  while (worklist.length > 0) {
    const id = worklist.pop() as number
    const owner = owners[id]
    const edgeStart = firstEdgeIndexes[id]
    const edgeCount = nodes[id + edgeCountOffset]
    const edgeEnd = edgeStart + edgeCount * edgeFieldCount
    for (let i = edgeStart; i < edgeEnd; i += edgeFieldCount) {
      const edgeType = getEdgeType(edges, i, edgeTypeOffset, edgeTypes)
      if (edgeType === EdgeType.Weak) {
        continue
      }
      const targetId = edges[i + edgeToNodeOffset]
      switch (owners[targetId]) {
        case kUnvisited:
          owners[targetId] = owner
          worklist.push(targetId)
          break
        case targetId:
        case owner:
        case kHasMultipleOwners:
          break
        default:
          owners[targetId] = kHasMultipleOwners
          worklist.push(targetId)
          break
      }
    }
  }
  for (let i = 0; i < nodeCount; i++) {
    const ownerId = owners[i]
    switch (ownerId) {
      case kUnvisited:
      case kHasMultipleOwners:
      case i:
        break
      default:
        const ownedNodeIndex = i * nodeFieldCount
        const ownerNodeIndex = ownerId * nodeFieldCount
        const ownerType = getNodeType(nodes, nodeIndex, typeIndex, nodeTypes)
        if (ownerType === NodeType.Synthetic || ownerNodeIndex === 0) {
          break
        }
        const sizeToTransfer = nodes[ownedNodeIndex + nodeSizeOffset]
        nodes[ownedNodeIndex + nodeSizeOffset] = 0
        nodes[ownerNodeIndex + nodeSizeOffset] = sizeToTransfer
        break
    }
  }
}
