import type { ParsedHeapSnapshot } from '../HeapSnapshot/HeapSnapshot.ts'

const MaxEntries = 3
const cache = new Map<string, { readonly fingerprint: string; readonly value: ParsedHeapSnapshot }>()

export const get = (uri: string, fingerprint: string): ParsedHeapSnapshot | undefined => {
  const entry = cache.get(uri)
  if (!entry || entry.fingerprint !== fingerprint) {
    return undefined
  }
  cache.delete(uri)
  cache.set(uri, entry)
  return entry.value
}

export const set = (uri: string, fingerprint: string, value: ParsedHeapSnapshot): void => {
  cache.delete(uri)
  cache.set(uri, { fingerprint, value })
  while (cache.size > MaxEntries) {
    const oldestUri = cache.keys().next().value
    if (typeof oldestUri !== 'string') {
      return
    }
    cache.delete(oldestUri)
  }
}

export const clear = (): void => {
  cache.clear()
}
