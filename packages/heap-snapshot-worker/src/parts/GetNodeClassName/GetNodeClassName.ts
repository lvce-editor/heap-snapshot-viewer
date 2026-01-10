import * as NodeType from '../NodeType/NodeType.ts'

export const getNodeClassName = (nodeType: string, nodeName: string) => {
  switch (nodeType) {
    case NodeType.Closure:
      return 'Function'
    case NodeType.Code:
      return '(compiled code)'
    case NodeType.Hidden:
      return '(system)'
    case NodeType.Native:
    case NodeType.Object:
      return nodeName
    case NodeType.Regexp:
      return 'RegExp'
    case NodeType.String:
      return '(string)'
    default:
      return `(${nodeType})`
  }
}
