import * as GetNodeClassName from '../GetNodeClassName/GetNodeClassName.ts'

const toSorted = (items, compare) => {
  return [...items].sort(compare)
}

const compareCount = (a, b) => {
  return b.count - a.count
}

export const getAggregratesByClassName = (parsed) => {
  const { parsedNodes } = parsed
  const countMap = Object.create(null)
  const zNodes = parsedNodes.filter((n) => n.size === 0)
  console.log(zNodes)
  // console.log(parsedNodes[100])
  for (const node of parsedNodes) {
    // if (!node.size) {
    //   console.log(node)
    // }
    if (node.size === 0) {
      continue
    }
    const name = GetNodeClassName.getNodeClassName(node)
    countMap[name] ||= 0
    countMap[name]++
  }
  const aggregate = Object.entries(countMap).map(([key, value]) => {
    return {
      name: key,
      count: value,
    }
  })
  const sorted = toSorted(aggregate, compareCount)
  return sorted
}
