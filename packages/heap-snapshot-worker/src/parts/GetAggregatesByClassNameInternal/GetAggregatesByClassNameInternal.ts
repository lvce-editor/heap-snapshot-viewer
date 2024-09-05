import * as GetNodeClassName from '../GetNodeClassName/GetNodeClassName.ts'
import * as GetTime from '../GetTime/GetTime.ts'
import * as IsTest from '../IsTest/IsTest.ts'

const toSorted = (items, compare) => {
  return [...items].sort(compare)
}

const compareCount = (a, b) => {
  return b.count - a.count
}

export const getAggregratesByClassNameInternal = (parsed: any) => {
  const start = GetTime.getTime()
  const { parsedNodes } = parsed
  const countMap = Object.create(null)
  for (const node of parsedNodes) {
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
  const end = GetTime.getTime()
  const duration = end - start
  if (!IsTest.isTest) {
    // @ts-ignore
    sorted.time = duration
  }
  return sorted
}
