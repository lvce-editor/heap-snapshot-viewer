export const cleanNode = (node) => {
  const { type, name, id, self_size } = node
  return {
    type,
    name,
    id,
    size: self_size,
  }
}
