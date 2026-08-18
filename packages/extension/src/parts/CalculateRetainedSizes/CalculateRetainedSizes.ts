// Based on Chrome DevTools Heap Snapshot (https://github.com/ChromeDevTools/devtools-frontend/blob/7ca2fec01b492e9b23b21738394200397a74c4aa/front_end/entrypoints/heap_snapshot_worker/HeapSnapshot.ts, License BSD)
import * as EdgeFieldType from '../EdgeFieldType/EdgeFieldType.ts'
import * as EdgeType from '../EdgeType/EdgeType.ts'
import * as NodeFieldType from '../NodeFieldType/NodeFieldType.ts'

interface RetainedSizeResult {
  readonly dominatorsTree: Uint32Array
  readonly retainedSizes: Float64Array
}

const getEdgeEnd = (nodeOrdinal: number, firstEdgeIndexes: Uint32Array, edgesLength: number): number => {
  return nodeOrdinal + 1 < firstEdgeIndexes.length ? firstEdgeIndexes[nodeOrdinal + 1] : edgesLength
}

const isStrongEdge = (edges: Uint32Array, edgeIndex: number, edgeTypeOffset: number, weakEdgeType: number): boolean => {
  return edges[edgeIndex + edgeTypeOffset] !== weakEdgeType
}

const buildRetainers = (
  edges: Uint32Array,
  edgeFieldCount: number,
  edgeToNodeOffset: number,
  edgeTypeOffset: number,
  firstEdgeIndexes: Uint32Array,
  nodeCount: number,
  nodeFieldCount: number,
  weakEdgeType: number,
): { readonly firstRetainerIndex: Uint32Array; readonly retainingNodes: Uint32Array } => {
  const firstRetainerIndex = new Uint32Array(nodeCount + 1)
  let strongEdgeCount = 0
  for (let sourceOrdinal = 0; sourceOrdinal < nodeCount; sourceOrdinal++) {
    const edgeEnd = getEdgeEnd(sourceOrdinal, firstEdgeIndexes, edges.length)
    for (let edgeIndex = firstEdgeIndexes[sourceOrdinal]; edgeIndex < edgeEnd; edgeIndex += edgeFieldCount) {
      if (!isStrongEdge(edges, edgeIndex, edgeTypeOffset, weakEdgeType)) {
        continue
      }
      const targetOrdinal = edges[edgeIndex + edgeToNodeOffset] / nodeFieldCount
      firstRetainerIndex[targetOrdinal + 1]++
      strongEdgeCount++
    }
  }
  for (let nodeOrdinal = 1; nodeOrdinal <= nodeCount; nodeOrdinal++) {
    firstRetainerIndex[nodeOrdinal] += firstRetainerIndex[nodeOrdinal - 1]
  }

  const retainingNodes = new Uint32Array(strongEdgeCount)
  const nextRetainerIndex = new Uint32Array(firstRetainerIndex)
  for (let sourceOrdinal = 0; sourceOrdinal < nodeCount; sourceOrdinal++) {
    const edgeEnd = getEdgeEnd(sourceOrdinal, firstEdgeIndexes, edges.length)
    for (let edgeIndex = firstEdgeIndexes[sourceOrdinal]; edgeIndex < edgeEnd; edgeIndex += edgeFieldCount) {
      if (!isStrongEdge(edges, edgeIndex, edgeTypeOffset, weakEdgeType)) {
        continue
      }
      const targetOrdinal = edges[edgeIndex + edgeToNodeOffset] / nodeFieldCount
      retainingNodes[nextRetainerIndex[targetOrdinal]++] = sourceOrdinal
    }
  }
  return { firstRetainerIndex, retainingNodes }
}

const buildPostOrderIndex = (
  edges: Uint32Array,
  edgeFieldCount: number,
  edgeToNodeOffset: number,
  edgeTypeOffset: number,
  firstEdgeIndexes: Uint32Array,
  nodeCount: number,
  nodeFieldCount: number,
  rootNodeOrdinal: number,
  weakEdgeType: number,
): { readonly nodeOrdinalToPostOrderIndex: Uint32Array; readonly postOrderIndexToNodeOrdinal: Uint32Array } => {
  const nodeOrdinalToPostOrderIndex = new Uint32Array(nodeCount)
  const postOrderIndexToNodeOrdinal = new Uint32Array(nodeCount)
  const stackCurrentEdge = new Uint32Array(nodeCount)
  const stackNodes = new Uint32Array(nodeCount)
  const visited = new Uint8Array(nodeCount)
  let postOrderIndex = 0

  const visit = (startNodeOrdinal: number): void => {
    let stackTop = 0
    stackNodes[0] = startNodeOrdinal
    stackCurrentEdge[0] = firstEdgeIndexes[startNodeOrdinal]
    visited[startNodeOrdinal] = 1
    while (stackTop >= 0) {
      const nodeOrdinal = stackNodes[stackTop]
      const edgeIndex = stackCurrentEdge[stackTop]
      const edgeEnd = getEdgeEnd(nodeOrdinal, firstEdgeIndexes, edges.length)
      if (edgeIndex < edgeEnd) {
        stackCurrentEdge[stackTop] += edgeFieldCount
        if (!isStrongEdge(edges, edgeIndex, edgeTypeOffset, weakEdgeType)) {
          continue
        }
        const childNodeOrdinal = edges[edgeIndex + edgeToNodeOffset] / nodeFieldCount
        if (visited[childNodeOrdinal]) {
          continue
        }
        stackTop++
        stackNodes[stackTop] = childNodeOrdinal
        stackCurrentEdge[stackTop] = firstEdgeIndexes[childNodeOrdinal]
        visited[childNodeOrdinal] = 1
        continue
      }
      if (nodeOrdinal !== rootNodeOrdinal) {
        nodeOrdinalToPostOrderIndex[nodeOrdinal] = postOrderIndex
        postOrderIndexToNodeOrdinal[postOrderIndex++] = nodeOrdinal
      }
      stackTop--
    }
  }

  visit(rootNodeOrdinal)
  for (let nodeOrdinal = 0; nodeOrdinal < nodeCount; nodeOrdinal++) {
    if (!visited[nodeOrdinal]) {
      visit(nodeOrdinal)
    }
  }
  nodeOrdinalToPostOrderIndex[rootNodeOrdinal] = postOrderIndex
  postOrderIndexToNodeOrdinal[postOrderIndex] = rootNodeOrdinal
  return { nodeOrdinalToPostOrderIndex, postOrderIndexToNodeOrdinal }
}

const buildDominatorTree = (
  firstRetainerIndex: Uint32Array,
  nodeOrdinalToPostOrderIndex: Uint32Array,
  postOrderIndexToNodeOrdinal: Uint32Array,
  retainingNodes: Uint32Array,
): Uint32Array => {
  const nodeCount = postOrderIndexToNodeOrdinal.length
  const rootPostOrderIndex = nodeCount - 1
  const noEntry = nodeCount
  const dominators = new Uint32Array(nodeCount)
  dominators.fill(noEntry)
  dominators[rootPostOrderIndex] = rootPostOrderIndex

  let changed = true
  while (changed) {
    changed = false
    for (let postOrderIndex = rootPostOrderIndex - 1; postOrderIndex >= 0; postOrderIndex--) {
      const nodeOrdinal = postOrderIndexToNodeOrdinal[postOrderIndex]
      const retainerStart = firstRetainerIndex[nodeOrdinal]
      const retainerEnd = firstRetainerIndex[nodeOrdinal + 1]
      let newDominator = noEntry
      for (let retainerIndex = retainerStart; retainerIndex < retainerEnd; retainerIndex++) {
        const retainerPostOrderIndex = nodeOrdinalToPostOrderIndex[retainingNodes[retainerIndex]]
        if (dominators[retainerPostOrderIndex] === noEntry) {
          continue
        }
        if (newDominator === noEntry) {
          newDominator = retainerPostOrderIndex
          continue
        }
        let left = retainerPostOrderIndex
        let right = newDominator
        while (left !== right) {
          while (left < right) {
            left = dominators[left]
          }
          while (right < left) {
            right = dominators[right]
          }
        }
        newDominator = left
        if (newDominator === rootPostOrderIndex) {
          break
        }
      }
      if (newDominator !== noEntry && dominators[postOrderIndex] !== newDominator) {
        dominators[postOrderIndex] = newDominator
        changed = true
      }
    }
  }

  const dominatorsTree = new Uint32Array(nodeCount)
  for (let postOrderIndex = 0; postOrderIndex < nodeCount; postOrderIndex++) {
    const nodeOrdinal = postOrderIndexToNodeOrdinal[postOrderIndex]
    const dominatorPostOrderIndex = dominators[postOrderIndex]
    const resolvedDominatorPostOrderIndex = dominatorPostOrderIndex === noEntry ? rootPostOrderIndex : dominatorPostOrderIndex
    dominatorsTree[nodeOrdinal] = postOrderIndexToNodeOrdinal[resolvedDominatorPostOrderIndex]
  }
  return dominatorsTree
}

export const calculateRetainedSizes = (
  nodes: Uint32Array,
  nodeFields: readonly string[],
  edges: Uint32Array,
  edgeFields: readonly string[],
  edgeTypes: readonly string[],
  firstEdgeIndexes: Uint32Array,
  rootNodeIndex: number,
): RetainedSizeResult => {
  const nodeFieldCount = nodeFields.length
  const nodeCount = nodes.length / nodeFieldCount
  const edgeFieldCount = edgeFields.length
  const edgeToNodeOffset = edgeFields.indexOf(EdgeFieldType.ToNode)
  const edgeTypeOffset = edgeFields.indexOf(EdgeFieldType.Type)
  const selfSizeOffset = nodeFields.indexOf(NodeFieldType.SelfSize)
  const weakEdgeType = edgeTypes.indexOf(EdgeType.Weak)
  const rootNodeOrdinal = rootNodeIndex / nodeFieldCount
  const { firstRetainerIndex, retainingNodes } = buildRetainers(
    edges,
    edgeFieldCount,
    edgeToNodeOffset,
    edgeTypeOffset,
    firstEdgeIndexes,
    nodeCount,
    nodeFieldCount,
    weakEdgeType,
  )
  const { nodeOrdinalToPostOrderIndex, postOrderIndexToNodeOrdinal } = buildPostOrderIndex(
    edges,
    edgeFieldCount,
    edgeToNodeOffset,
    edgeTypeOffset,
    firstEdgeIndexes,
    nodeCount,
    nodeFieldCount,
    rootNodeOrdinal,
    weakEdgeType,
  )
  const dominatorsTree = buildDominatorTree(
    firstRetainerIndex,
    nodeOrdinalToPostOrderIndex,
    postOrderIndexToNodeOrdinal,
    retainingNodes,
  )
  const retainedSizes = new Float64Array(nodeCount)
  for (let nodeOrdinal = 0; nodeOrdinal < nodeCount; nodeOrdinal++) {
    retainedSizes[nodeOrdinal] = nodes[nodeOrdinal * nodeFieldCount + selfSizeOffset]
  }
  for (let postOrderIndex = 0; postOrderIndex < nodeCount - 1; postOrderIndex++) {
    const nodeOrdinal = postOrderIndexToNodeOrdinal[postOrderIndex]
    retainedSizes[dominatorsTree[nodeOrdinal]] += retainedSizes[nodeOrdinal]
  }
  return { dominatorsTree, retainedSizes }
}
