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
  }
}
