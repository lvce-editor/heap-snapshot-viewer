// based on Chrome Devtools Heap Snapshot(https://github.com/ChromeDevTools/devtools-frontend/blob/7ca2fec01b492e9b23b21738394200397a74c4aa/front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts, License BSD)
import * as EdgeType from '../EdgeType/EdgeType.ts'
import type { Graph } from '../Graph/Graph.ts'
import type { Node } from '../Node/Node.ts'
import * as NodeType from '../NodeType/NodeType.ts'

export const addAccurateSizes = (graph: Graph, nodes: readonly Node[]) => {
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
      if (edge.type === EdgeType.Weak) {
        continue
      }
      const targetId = edge.index
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
        if (owner.type === NodeType.Synthetic || ownerNodeIndex === 0) {
          break
        }
        const owned = nodes[ownedNodeIndex]
        // @ts-ignore
        const sizeToTransfer = owned.selfSize

        // TODO create new nodes array?
        // @ts-ignore
        owned.selfSize = 0
        // @ts-ignore
        owner.selfSize += sizeToTransfer
        break
    }
  }
  console.log('final', nodes[7436])
}
