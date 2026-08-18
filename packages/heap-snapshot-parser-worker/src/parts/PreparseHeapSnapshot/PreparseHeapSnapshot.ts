import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'
import * as ValidateHeapSnapshot from '../ValidateHeapSnapshot/ValidateHeapSnapshot.ts'

export const preparseHeapSnapshot = (id: number) => {
  const { content, snapshotSize } = HeapSnapshotState.get(id)
  const { edgeFields, edges, edgeTypes, nodeFields, nodes, nodeTypes, rootNodeIndex, strings } =
    ValidateHeapSnapshot.validateHeapSnapshot(content)
  HeapSnapshotState.add(id, {
    edgeFields,
    edges: new Uint32Array(edges),
    edgeTypes,
    nodeFields,
    nodes: new Uint32Array(nodes),
    nodeTypes,
    rootNodeIndex,
    snapshotSize,
    strings,
  })
}
