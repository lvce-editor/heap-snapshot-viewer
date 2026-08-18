const heapSnapshots = Object.create(null)

export const add = (id: number, state: any) => {
  heapSnapshots[id] = state
}

export const get = (id: number) => {
  return heapSnapshots[id]
}

export const remove = (id: number) => {
  delete heapSnapshots[id]
}
