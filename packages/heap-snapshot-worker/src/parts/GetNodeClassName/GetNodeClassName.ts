import type { Node } from '../Node/Node.ts'
import * as NodeType from '../NodeType/NodeType.ts'

export const getNodeClassName = (node: Node) => {
  switch (node.type) {
    case NodeType.Hidden:
      return '(system)'
    case NodeType.Code:
      return '(compiled code)'
    case NodeType.Regexp:
      return 'RegExp'
    case NodeType.Closure:
      return 'Function'
    case NodeType.String:
      return '(string)'
    case NodeType.Native:
    case NodeType.Object:
      return node.name
    default:
      return `(${node.type})`
  }
}
