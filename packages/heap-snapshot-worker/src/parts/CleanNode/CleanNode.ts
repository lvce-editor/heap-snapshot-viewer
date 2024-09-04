export const cleanNode = (node) => {
  const { type, name, id, selfSize } = node
  return {
    type,
    name,
    id,
    size: selfSize,
  }
}
