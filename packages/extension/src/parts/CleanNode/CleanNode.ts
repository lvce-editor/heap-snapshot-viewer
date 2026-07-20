export const cleanNode = (node) => {
  const { id, name, selfSize, type } = node
  return {
    id,
    name,
    size: selfSize,
    type,
  }
}
