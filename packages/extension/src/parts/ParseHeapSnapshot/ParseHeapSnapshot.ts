import * as ParseHeapSnapshotInternal from '../ParseHeapSnapshotInternal/ParseHeapSnapshotInternal.ts'

// TODO move this to heapsnapshot worker

export const parseHeapSnapshot = (content: string) => {
  const heapsnapshot = JSON.parse(content)
  const { snapshot, nodes, edges, strings } = heapsnapshot
  const { meta } = snapshot
  const { node_types, node_fields, edge_types, edge_fields } = meta
  console.time('parse')
  const parsed = ParseHeapSnapshotInternal.parseHeapSnapshotInternal(
    nodes,
    node_fields,
    node_types[0],
    edges,
    edge_fields,
    edge_types[0],
    strings,
  )
  console.timeEnd('parse')
  return parsed
}
