import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'
import * as ParseHeapSnapshotInternal from '../ParseHeapSnapshotInternal/ParseHeapSnapshotInternal.ts'

export const parseHeapSnapshot = (id: number) => {
  const { nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, strings } = HeapSnapshotState.get(id)
  const { firstEdgeIndexes } = ParseHeapSnapshotInternal.parseHeapSnapshotInternal(
    nodes,
    nodeFields,
    nodeTypes,
    edges,
    edgeFields,
    edgeTypes,
  )
  HeapSnapshotState.add(id, {
    nodes,
    nodeFields,
    nodeTypes,
    edges,
    edgeFields,
    edgeTypes,
    strings,
    firstEdgeIndexes,
  })
}
