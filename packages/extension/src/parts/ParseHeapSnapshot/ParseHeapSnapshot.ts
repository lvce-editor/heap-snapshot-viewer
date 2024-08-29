// TODO move this to heapsnapshot worker

export const parseHeapSnapshot = (content: string) => {
  const parsed = JSON.parse(content)
  return parsed
}
