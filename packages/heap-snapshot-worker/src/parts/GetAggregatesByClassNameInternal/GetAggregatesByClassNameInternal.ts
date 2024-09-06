import * as GetNodeClassName from '../GetNodeClassName/GetNodeClassName.ts'
import * as GetTime from '../GetTime/GetTime.ts'
import * as IsTest from '../IsTest/IsTest.ts'
import * as NodeFieldType from '../NodeFieldType/NodeFieldType.ts'

const toSorted = (items, compare) => {
  return [...items].sort(compare)
}

const compareCount = (a, b) => {
  return b.count - a.count
}

export const getAggregratesByClassNameInternal = (
  nodes: Uint32Array,
  nodeFields: readonly string[],
  nodeTypes: readonly string[],
  edges: Uint32Array,
  edgeFields: readonly string[],
  edgeTypes: readonly string[],
  strings: readonly string[],
  firstEdgeIndexes: Uint32Array,
) => {
  const start = GetTime.getTime()
  const countMap = Object.create(null)
  const nodeFieldCount = nodeFields.length
  const selfSizeOffset = nodeFields.indexOf(NodeFieldType.SelfSize)
  const nodeTypeOffset = nodeFields.indexOf(NodeFieldType.Type)
  const nodeNameOffset = nodeFields.indexOf(NodeFieldType.Name)
  for (let i = 0; i < nodes.length; i += nodeFieldCount) {
    const selfSize = nodes[i + selfSizeOffset]
    if (selfSize === 0) {
      continue
    }
    const nodeType = nodes[i + nodeTypeOffset]
    const nodeName = nodes[i + nodeNameOffset]
    const nodeTypeString = nodeTypes[nodeType]
    const nodeNameString = strings[nodeName]
    const name = GetNodeClassName.getNodeClassName(nodeTypeString, nodeNameString)
    countMap[name] ||= 0
    countMap[name]++
  }
  // TODO speed this up also
  const aggregate = Object.entries(countMap).map(([key, value]) => {
    return {
      name: key,
      count: value,
    }
  })
  const sorted = toSorted(aggregate, compareCount)
  const end = GetTime.getTime()
  const duration = end - start
  if (!IsTest.isTest) {
    // @ts-ignore
    sorted.time = duration
  }
  return sorted
}
