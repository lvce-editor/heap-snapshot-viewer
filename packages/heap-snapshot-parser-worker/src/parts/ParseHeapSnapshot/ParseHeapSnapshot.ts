import * as CalculateRetainedSizes from '../CalculateRetainedSizes/CalculateRetainedSizes.ts'
import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'
import * as ParseHeapSnapshotInternal from '../ParseHeapSnapshotInternal/ParseHeapSnapshotInternal.ts'

export const parseHeapSnapshot = (id: number) => {
  const { edgeFields, edges, edgeTypes, nodeFields, nodes, nodeTypes, rootNodeIndex, snapshotSize, strings } =
    HeapSnapshotState.get(id)
  const { firstEdgeIndexes } = ParseHeapSnapshotInternal.parseHeapSnapshotInternal(
    nodes,
    nodeFields,
    nodeTypes,
    edges,
    edgeFields,
    edgeTypes,
  )
  const { dominatorsTree, retainedSizes } = CalculateRetainedSizes.calculateRetainedSizes(
    nodes,
    nodeFields,
    edges,
    edgeFields,
    edgeTypes,
    firstEdgeIndexes,
    rootNodeIndex,
  )
  HeapSnapshotState.add(id, {
    dominatorsTree,
    edgeFields,
    edges,
    edgeTypes,
    firstEdgeIndexes,
    nodeFields,
    nodes,
    nodeTypes,
    retainedSizes,
    rootNodeIndex,
    snapshotSize,
    strings,
  })
}
