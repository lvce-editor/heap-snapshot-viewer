import * as GetNodeClassName from '../GetNodeClassName/GetNodeClassName.ts'
import * as NodeFieldType from '../NodeFieldType/NodeFieldType.ts'

export interface Aggregate {
  readonly count: number
  readonly name: string
  readonly retainedSize: number
  readonly shallowSize: number
  readonly type: string
}

interface MutableAggregate {
  count: number
  readonly name: string
  retainedSize: number
  shallowSize: number
  readonly type: string
}

const compareRetainedSize = (a: Aggregate, b: Aggregate): number => {
  return b.retainedSize - a.retainedSize || b.shallowSize - a.shallowSize || b.count - a.count || a.name.localeCompare(b.name)
}

const buildDominatedNodes = (dominatorsTree: Uint32Array, rootNodeOrdinal: number) => {
  const nodeCount = dominatorsTree.length
  const firstDominatedNodeIndex = new Uint32Array(nodeCount + 1)
  for (let nodeOrdinal = 0; nodeOrdinal < nodeCount; nodeOrdinal++) {
    if (nodeOrdinal === rootNodeOrdinal) {
      continue
    }
    firstDominatedNodeIndex[dominatorsTree[nodeOrdinal] + 1]++
  }
  for (let nodeOrdinal = 1; nodeOrdinal <= nodeCount; nodeOrdinal++) {
    firstDominatedNodeIndex[nodeOrdinal] += firstDominatedNodeIndex[nodeOrdinal - 1]
  }
  const dominatedNodes = new Uint32Array(Math.max(0, nodeCount - 1))
  const nextDominatedNodeIndex = new Uint32Array(firstDominatedNodeIndex)
  for (let nodeOrdinal = 0; nodeOrdinal < nodeCount; nodeOrdinal++) {
    if (nodeOrdinal === rootNodeOrdinal) {
      continue
    }
    const dominatorOrdinal = dominatorsTree[nodeOrdinal]
    dominatedNodes[nextDominatedNodeIndex[dominatorOrdinal]++] = nodeOrdinal
  }
  return { dominatedNodes, firstDominatedNodeIndex }
}

const calculateAggregateRetainedSizes = (
  aggregates: readonly MutableAggregate[],
  classIds: Uint32Array,
  dominatorsTree: Uint32Array,
  retainedSizes: Float64Array,
): void => {
  let rootNodeOrdinal = 0
  for (let nodeOrdinal = 0; nodeOrdinal < dominatorsTree.length; nodeOrdinal++) {
    if (dominatorsTree[nodeOrdinal] === nodeOrdinal) {
      rootNodeOrdinal = nodeOrdinal
      break
    }
  }
  const { dominatedNodes, firstDominatedNodeIndex } = buildDominatedNodes(dominatorsTree, rootNodeOrdinal)
  const activeClassCounts = new Uint32Array(aggregates.length + 1)
  const stackNextChildIndex = new Uint32Array(dominatorsTree.length)
  const stackNodes = new Uint32Array(dominatorsTree.length)
  let stackTop = 0
  stackNodes[0] = rootNodeOrdinal
  stackNextChildIndex[0] = firstDominatedNodeIndex[rootNodeOrdinal]

  const enterNode = (nodeOrdinal: number): void => {
    const classId = classIds[nodeOrdinal]
    if (classId === 0) {
      return
    }
    if (activeClassCounts[classId] === 0) {
      aggregates[classId - 1].retainedSize += retainedSizes[nodeOrdinal]
    }
    activeClassCounts[classId]++
  }
  enterNode(rootNodeOrdinal)

  while (stackTop >= 0) {
    const nodeOrdinal = stackNodes[stackTop]
    const childIndex = stackNextChildIndex[stackTop]
    const childEnd = firstDominatedNodeIndex[nodeOrdinal + 1]
    if (childIndex < childEnd) {
      const childNodeOrdinal = dominatedNodes[childIndex]
      stackNextChildIndex[stackTop]++
      stackTop++
      stackNodes[stackTop] = childNodeOrdinal
      stackNextChildIndex[stackTop] = firstDominatedNodeIndex[childNodeOrdinal]
      enterNode(childNodeOrdinal)
      continue
    }
    const classId = classIds[nodeOrdinal]
    if (classId !== 0) {
      activeClassCounts[classId]--
    }
    stackTop--
  }
}

export const getAggregratesByClassNameInternal = (
  nodes: Uint32Array,
  nodeFields: readonly string[],
  nodeTypes: readonly string[],
  strings: readonly string[],
  retainedSizes: Float64Array,
  dominatorsTree: Uint32Array,
): readonly Aggregate[] => {
  const nodeFieldCount = nodeFields.length
  const selfSizeOffset = nodeFields.indexOf(NodeFieldType.SelfSize)
  const nodeTypeOffset = nodeFields.indexOf(NodeFieldType.Type)
  const nodeNameOffset = nodeFields.indexOf(NodeFieldType.Name)
  const nodeCount = nodes.length / nodeFieldCount
  const classIds = new Uint32Array(nodeCount)
  const classIdMap = new Map<string, number>()
  const aggregateMap = new Map<string, MutableAggregate>()
  const aggregates: MutableAggregate[] = []

  for (let nodeOrdinal = 0; nodeOrdinal < nodeCount; nodeOrdinal++) {
    const nodeIndex = nodeOrdinal * nodeFieldCount
    const shallowSize = nodes[nodeIndex + selfSizeOffset]
    if (shallowSize === 0) {
      continue
    }
    const nodeTypeString = nodeTypes[nodes[nodeIndex + nodeTypeOffset]]
    const nodeNameString = strings[nodes[nodeIndex + nodeNameOffset]]
    const name = GetNodeClassName.getNodeClassName(nodeTypeString, nodeNameString)
    let aggregate = aggregateMap.get(name)
    if (!aggregate) {
      aggregate = {
        count: 0,
        name,
        retainedSize: 0,
        shallowSize: 0,
        type: nodeTypeString,
      }
      aggregateMap.set(name, aggregate)
      aggregates.push(aggregate)
      classIdMap.set(name, aggregates.length)
    }
    aggregate.count++
    aggregate.shallowSize += shallowSize
    classIds[nodeOrdinal] = classIdMap.get(name) as number
  }

  calculateAggregateRetainedSizes(aggregates, classIds, dominatorsTree, retainedSizes)
  return aggregates.sort(compareRetainedSize)
}
