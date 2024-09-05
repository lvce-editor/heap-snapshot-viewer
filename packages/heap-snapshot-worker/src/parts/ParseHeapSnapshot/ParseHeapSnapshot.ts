import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'
import * as ParseHeapSnapshotInternal from '../ParseHeapSnapshotInternal/ParseHeapSnapshotInternal.ts'

export const parseHeapSnapshot = (id: number) => {
  const { nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, strings } = HeapSnapshotState.get(id)
  const nodeCount = nodes.length / nodeFields.length
  const firstEdgeIndexes = new Uint32Array(nodeCount)
  const parsed = ParseHeapSnapshotInternal.parseHeapSnapshotInternal(
    nodes,
    nodeFields,
    nodeTypes,
    edges,
    edgeFields,
    edgeTypes,
    strings,
  )
  HeapSnapshotState.add(id, { parsed })
}
