import * as NodeType from '../NodeType/NodeType.ts'

export const getNodeClassName = (node) => {
  switch (node.type) {
    case NodeType.Hidden:
      return '(system)'
    case NodeType.Code:
      return '(compiled code)'
    case NodeType.Regexp:
      return 'RegExp'
    case NodeType.Closure:
      return 'Function'
    default:
      return node.name
  }
}
