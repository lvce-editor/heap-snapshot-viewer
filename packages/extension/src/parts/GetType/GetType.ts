export const getType = (value: unknown): string => {
  switch (typeof value) {
    case 'boolean':
      return 'boolean'
    case 'function':
      return 'function'
    case 'number':
      return 'number'
    case 'object':
      if (value === null) {
        return 'null'
      }
      if (Array.isArray(value)) {
        return 'array'
      }
      return 'object'
    case 'string':
      return 'string'
    default:
      return 'unknown'
  }
}
