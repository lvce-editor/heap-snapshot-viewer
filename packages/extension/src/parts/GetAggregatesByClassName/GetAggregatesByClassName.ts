const toSorted = (items, compare) => {
  return [...items].sort(compare)
}

const compareCount = (a, b) => {
  return b.count - a.count
}

export const getAggregratesByClassName = (parsed) => {
  console.log(parsed)
  const { parsedNodes } = parsed
  const countMap = Object.create(null)
  for (const node of parsedNodes) {
    const { name } = node
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
