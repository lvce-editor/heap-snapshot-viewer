import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'
import * as ParseHeapSnapshotInternal from '../ParseHeapSnapshotInternal/ParseHeapSnapshotInternal.ts'

export const parseHeapSnapshot = (id: number) => {
  const { content } = HeapSnapshotState.get(id)
  const heapsnapshot = JSON.parse(content)
  const { snapshot, nodes, edges, strings } = heapsnapshot
  const { meta } = snapshot
  const { node_types, node_fields, edge_types, edge_fields } = meta
  const parsed = ParseHeapSnapshotInternal.parseHeapSnapshotInternal(
    nodes,
    node_fields,
    node_types[0],
    edges,
    edge_fields,
    edge_types[0],
    strings,
  )
  HeapSnapshotState.add(id, { parsed })
}
