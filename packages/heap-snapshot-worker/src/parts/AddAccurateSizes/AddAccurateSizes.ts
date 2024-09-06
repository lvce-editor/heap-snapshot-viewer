// based on Chrome Devtools Heap Snapshot(https://github.com/ChromeDevTools/devtools-frontend/blob/7ca2fec01b492e9b23b21738394200397a74c4aa/front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts, License BSD)
import * as EdgeFieldType from '../EdgeFieldType/EdgeFieldType.ts'
import * as EdgeType from '../EdgeType/EdgeType.ts'
import * as NodeFieldType from '../NodeFieldType/NodeFieldType.ts'
import * as NodeType from '../NodeType/NodeType.ts'

export const addAccurateSizes = (
  nodes: Uint32Array,
  nodeFields: readonly string[],
  nodeTypes: readonly string[],
  edges: Uint32Array,
  edgeFields: readonly string[],
  edgeTypes: readonly string[],
  firstEdgeIndexes: Uint32Array,
) => {
  const kUnvisited = 0xffffffff
  const kHasMultipleOwners = 0xfffffffe
  const worklist: number[] = []
  const nodeTypeOffset = nodeFields.indexOf(NodeFieldType.Type)
  const edgeCountOffset = nodeFields.indexOf(NodeFieldType.EdgeCount)
  const edgeFieldCount = edgeFields.length
  const edgeTypeOffset = edgeFields.indexOf(EdgeFieldType.Type)
  const edgeToNodeOffset = edgeFields.indexOf(EdgeFieldType.ToNode)
  const nodeSizeOffset = nodeFields.indexOf(NodeFieldType.SelfSize)
  const nodeFieldCount = nodeFields.length
  const nodeCount = nodes.length / nodeFieldCount
  const owners = new Uint32Array(nodeCount)
  const nodeHiddenOffset = nodeTypes.indexOf(NodeType.Hidden)
  const nodeArrayOffset = nodeTypes.indexOf(NodeType.Array)
  const nodeSyntheticOffset = nodeTypes.indexOf(NodeType.Synthetic)
  const edgeWeakOffset = edgeTypes.indexOf(EdgeType.Weak)
  for (let i = 0; i < nodeCount; i++) {
    const nodeIndex = i * nodeFieldCount
    const nodeType = nodes[nodeIndex + nodeTypeOffset]
    if (nodeType === nodeHiddenOffset || nodeType === nodeArrayOffset) {
      owners[i] = kUnvisited
    } else {
      owners[i] = i
      worklist.push(i)
    }
  }
  while (worklist.length > 0) {
    const id = worklist.pop() as number
    const owner = owners[id]
    const edgeStart = firstEdgeIndexes[id]
    const edgeCount = nodes[id * nodeFieldCount + edgeCountOffset]
    const edgeEnd = edgeStart + edgeCount * edgeFieldCount
    for (let i = edgeStart; i < edgeEnd; i += edgeFieldCount) {
      const edgeType = edges[i + edgeTypeOffset]
      if (edgeType === edgeWeakOffset) {
        continue
      }
      const targetId = edges[i + edgeToNodeOffset] / nodeFieldCount
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
        const ownerType = nodes[ownerNodeIndex + nodeTypeOffset]
        if (ownerType === nodeSyntheticOffset || ownerNodeIndex === 0) {
          break
        }
        const sizeToTransfer = nodes[ownedNodeIndex + nodeSizeOffset]
        nodes[ownedNodeIndex + nodeSizeOffset] = 0
        nodes[ownerNodeIndex + nodeSizeOffset] += sizeToTransfer
        break
    }
  }
}
