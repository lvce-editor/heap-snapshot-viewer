import * as NodeType from '../NodeType/NodeType.ts'

export const addAccurateSizes = (graph, nodes) => {
  // compute accurate sizes
  const owners = new Uint32Array(nodes.length)
  const kUnvisited = 0xffffffff
  const kHasMultipleOwners = 0xfffffffe
  const worklist: number[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.type === NodeType.Hidden || node.type === NodeType.Array) {
      owners[i] = kUnvisited
    } else {
      owners[i] = i
      worklist.push(i)
    }
  }
  while (worklist.length > 0) {
    const id = worklist.pop() as number
    const owner = owners[id]
    const node = nodes[id]
    const edges = graph[node.id] || []
    for (const edge of edges) {
      if (edge.type === 'weak') {
        continue
      }
      const targetId = edge.nodeIndex
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
  for (let i = 0; i < nodes.length; i++) {
    const ownerId = owners[i]
    switch (ownerId) {
      case kUnvisited:
      case kHasMultipleOwners:
      case i:
        break
      default:
        const ownedNodeIndex = i
        const ownerNodeIndex = ownerId
        const owner = nodes[ownerNodeIndex]
        if (owner.type === 'synthetic' || ownerNodeIndex === 0) {
          break
        }
        const owned = nodes[ownedNodeIndex]
        const sizeToTransfer = owned.size
        owned.size = 0
        owner.size += sizeToTransfer
        break
    }
  }
}
