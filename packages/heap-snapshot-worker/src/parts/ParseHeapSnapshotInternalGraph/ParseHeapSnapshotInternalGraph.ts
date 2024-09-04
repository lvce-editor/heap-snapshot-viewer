import * as Assert from '../Assert/Assert.ts'

export const parseHeapSnapshotInternalGraph = (nodes, edges) => {
  Assert.array(edges)
  Assert.array(nodes)
  const graph = Object.create(null)
  for (const node of nodes) {
    graph[node.id] = []
  }
  let edgeIndex = 0
  for (const node of nodes) {
    for (let i = 0; i < node.edgeCount; i++) {
      const edge = edges[edgeIndex++]
      if (edge.toNode === 29) {
        console.log({ node })
      }
      graph[node.id].push({ index: edge.toNode, name: edge.nameOrIndex })
    }
  }
  // const id = 59
  // console.log('g', graph[id])
  // const gIndex=nodes[173]
  // console.log('other', nodes[173], nodes[39])
  // console.log('2', graph[nodes[173].id])
  // console.log('3', graph[nodes[39].id])
  return graph
}
