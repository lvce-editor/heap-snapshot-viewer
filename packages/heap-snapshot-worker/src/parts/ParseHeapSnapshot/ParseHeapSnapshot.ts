import * as GetTime from '../GetTime/GetTime.ts'
import * as ParseHeapSnapshotInternal from '../ParseHeapSnapshotInternal/ParseHeapSnapshotInternal.ts'

export const parseHeapSnapshot = (content: string) => {
  const heapsnapshot = JSON.parse(content)
  const { snapshot, nodes, edges, strings } = heapsnapshot
  const { meta } = snapshot
  const { node_types, node_fields, edge_types, edge_fields } = meta
  const start = GetTime.getTime()
  const parsed = ParseHeapSnapshotInternal.parseHeapSnapshotInternal(
    nodes,
    node_fields,
    node_types[0],
    edges,
    edge_fields,
    edge_types[0],
    strings,
  )
  const end = GetTime.getTime()
  // @ts-ignore
  parsed.time = end - start
  return parsed
}
