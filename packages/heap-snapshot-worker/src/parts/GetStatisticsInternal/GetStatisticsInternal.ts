import * as NodeFieldType from '../NodeFieldType/NodeFieldType.ts'
import * as NodeType from '../NodeType/NodeType.ts'

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
  const nodeNativeType = nodeTypes.indexOf(NodeType.Native)
  const nodeStringType = nodeTypes.indexOf(NodeType.String)
  const nodeConcatenatedStringType = nodeTypes.indexOf(NodeType.ConcatenatedString)
  const nodeSlicedStringType = nodeTypes.indexOf(NodeType.SlicedString)
  const nodeCodeType = nodeTypes.indexOf(NodeType.Code)
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
    if (nodeType === nodeNativeType) {
      sizeNative += selfSize
    } else if (nodeType === nodeCodeType) {
      sizeCode += selfSize
    } else if (nodeType === nodeSlicedStringType || nodeType === nodeConcatenatedStringType || nodeType === nodeStringType) {
      sizeStrings += selfSize
    } else {
      const name = strings[nodeName]
      if (name === 'Array') {
        // TODO compute size of array
        // sizeJSArrays+=
      }
    }
  }

  return {
    sizeNative,
    sizeCode,
    sizeStrings,
    sizeJSArrays,
    sizeSystem,
  }
}
