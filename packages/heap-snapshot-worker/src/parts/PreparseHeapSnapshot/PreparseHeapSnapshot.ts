import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const preparseHeapSnapshot = (id: number) => {
  const { content } = HeapSnapshotState.get(id)
  const heapsnapshot = JSON.parse(content)
  const { snapshot, nodes, edges, strings } = heapsnapshot
  const { meta } = snapshot
  const { node_types, node_fields, edge_types, edge_fields } = meta
  HeapSnapshotState.add(id, {
    nodes: new Uint32Array(nodes),
    nodeFields: node_fields,
    nodeTypes: node_types[0],
    edges: new Uint32Array(edges),
    edgeFields: edge_fields,
    edgeTypes: edge_types[0],
    strings,
  })
}
