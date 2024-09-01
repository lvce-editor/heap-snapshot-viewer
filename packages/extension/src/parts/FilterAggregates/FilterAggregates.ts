const matchesFilterValue = (item: any, filterValue: string) => {
  if (!filterValue) {
    return true
  }
  return item.name.includes(filterValue)
}

export const filterAggregates = (aggregates: any[], filterValue: string) => {
  const filtered: any[] = []
  for (const item of aggregates) {
    if (matchesFilterValue(item, filterValue)) {
      filtered.push(item)
    }
  }
  return filtered
}
