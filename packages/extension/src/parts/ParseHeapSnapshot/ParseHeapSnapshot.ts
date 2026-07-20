import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'
import * as ParseHeapSnapshotInternal from '../ParseHeapSnapshotInternal/ParseHeapSnapshotInternal.ts'

export const parseHeapSnapshot = (id: number) => {
  const { edgeFields, edges, edgeTypes, nodeFields, nodes, nodeTypes, strings } = HeapSnapshotState.get(id)
  const { firstEdgeIndexes } = ParseHeapSnapshotInternal.parseHeapSnapshotInternal(
    nodes,
    nodeFields,
    nodeTypes,
    edges,
    edgeFields,
    edgeTypes,
  )
  HeapSnapshotState.add(id, {
    edgeFields,
    edges,
    edgeTypes,
    firstEdgeIndexes,
    nodeFields,
    nodes,
    nodeTypes,
    strings,
  })
}
