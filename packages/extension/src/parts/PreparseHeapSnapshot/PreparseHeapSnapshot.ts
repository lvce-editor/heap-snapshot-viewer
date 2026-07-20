import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'

export const preparseHeapSnapshot = (id: number) => {
  const { content } = HeapSnapshotState.get(id)
  const heapsnapshot = JSON.parse(content)
  const { edges, nodes, snapshot, strings } = heapsnapshot
  const { meta } = snapshot
  const { edge_fields, edge_types, node_fields, node_types } = meta
  HeapSnapshotState.add(id, {
    edgeFields: edge_fields,
    edges: new Uint32Array(edges),
    edgeTypes: edge_types[0],
    nodeFields: node_fields,
    nodes: new Uint32Array(nodes),
    nodeTypes: node_types[0],
    strings,
  })
}
