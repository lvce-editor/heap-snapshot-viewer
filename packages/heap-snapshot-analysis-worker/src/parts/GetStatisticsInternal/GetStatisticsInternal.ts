import * as NodeFieldType from '../NodeFieldType/NodeFieldType.ts'

export interface MemoryByType {
  readonly name: string
  readonly size: number
}

export interface Statistics {
  readonly memoryByType: readonly MemoryByType[]
  readonly totalShallowSize: number
}

const MemoryTypeNames: Readonly<Record<string, string>> = {
  array: 'Arrays',
  bigint: 'Numbers',
  closure: 'Closures',
  code: 'Code',
  'concatenated string': 'Strings',
  hidden: 'System',
  native: 'Native',
  number: 'Numbers',
  object: 'Objects',
  'object shape': 'Object shapes',
  regexp: 'Regular expressions',
  'sliced string': 'Strings',
  string: 'Strings',
  symbol: 'Symbols',
  synthetic: 'System',
}

const getMemoryTypeName = (type: string): string => {
  return MemoryTypeNames[type] || (type ? `${type[0].toUpperCase()}${type.slice(1)}` : 'Other')
}

export const getStatisicsInternal = (
  nodes: Uint32Array,
  nodeFields: readonly string[],
  nodeTypes: readonly string[],
): Statistics => {
  const nodeFieldCount = nodeFields.length
  const selfSizeOffset = nodeFields.indexOf(NodeFieldType.SelfSize)
  const nodeTypeOffset = nodeFields.indexOf(NodeFieldType.Type)
  const sizeMap = new Map<string, number>()
  let totalShallowSize = 0
  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += nodeFieldCount) {
    const shallowSize = nodes[nodeIndex + selfSizeOffset]
    if (shallowSize === 0) {
      continue
    }
    const name = getMemoryTypeName(nodeTypes[nodes[nodeIndex + nodeTypeOffset]])
    sizeMap.set(name, (sizeMap.get(name) || 0) + shallowSize)
    totalShallowSize += shallowSize
  }
  const memoryByType = Array.from(sizeMap, ([name, size]) => ({ name, size })).sort(
    (a, b) => b.size - a.size || a.name.localeCompare(b.name),
  )
  return { memoryByType, totalShallowSize }
}
