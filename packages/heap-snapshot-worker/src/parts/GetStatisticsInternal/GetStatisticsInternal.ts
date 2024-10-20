import * as GetNodeClassName from '../GetNodeClassName/GetNodeClassName.ts'
import * as NodeFieldType from '../NodeFieldType/NodeFieldType.ts'

export const getStatisicsInternal = (
  nodes: Uint32Array,
  nodeFields: readonly string[],
  nodeTypes: readonly string[],
  strings: readonly string[],
) => {
  const nodeFieldCount = nodeFields.length
  const selfSizeOffset = nodeFields.indexOf(NodeFieldType.SelfSize)
  const nodeTypeOffset = nodeFields.indexOf(NodeFieldType.Type)
  const nodeNameOffset = nodeFields.indexOf(NodeFieldType.Name)
  let sizeNative = 0
  let sizeCode = 0
  let sizeStrings = 0
  let sizeJSArrays = 0
  let sizeSystem = 0
  for (let i = 0; i < nodes.length; i += nodeFieldCount) {
    const selfSize = nodes[i + selfSizeOffset]
    if (selfSize === 0) {
      continue
    }
    const nodeType = nodes[i + nodeTypeOffset]
    const nodeName = nodes[i + nodeNameOffset]
    const nodeTypeString = nodeTypes[nodeType]
    const nodeNameString = strings[nodeName]
  }

  return {
    sizeNative,
    sizeCode,
    sizeStrings,
    sizeJSArrays,
    sizeSystem,
  }
}
