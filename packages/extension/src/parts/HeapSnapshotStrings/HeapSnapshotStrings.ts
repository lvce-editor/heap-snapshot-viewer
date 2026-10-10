import { getHeapSnapshotStrings } from '../HeapSnapshotParserWorker/HeapSnapshotParserWorker.ts'
import { readHeapSnapshotBlob } from '../ReadHeapSnapshotBlob/ReadHeapSnapshotBlob.ts'

const scheme = 'heapnapshot-strings'
const prefix = `${scheme}:///`
const documentExtension = '.json'

export const createHeapSnapshotStringsUri = (sourceUri: string): string =>
  `${prefix}${encodeURIComponent(sourceUri)}${documentExtension}`

export const getHeapSnapshotSourceUri = (uri: string): string => {
  if (!uri.startsWith(prefix)) {
    throw new Error('Invalid heap snapshot strings URI')
  }
  try {
    const encodedSourceUri = uri.slice(prefix.length)
    if (!encodedSourceUri.endsWith(documentExtension)) {
      throw new Error('Invalid heap snapshot strings URI')
    }
    const sourceUri = decodeURIComponent(encodedSourceUri.slice(0, -documentExtension.length))
    if (!sourceUri) {
      throw new Error('The source heap snapshot URI is missing')
    }
    return sourceUri
  } catch {
    throw new Error('Invalid heap snapshot strings URI')
  }
}

interface SizedString {
  readonly length: number
  readonly value: string
}

const compareStrings = (a: SizedString, b: SizedString): number => {
  const lengthDifference = a.length - b.length
  if (lengthDifference !== 0) {
    return lengthDifference
  }
  if (a.value < b.value) {
    return -1
  }
  if (a.value > b.value) {
    return 1
  }
  return 0
}

export const formatHeapSnapshotStrings = (strings: readonly string[]): string =>
  JSON.stringify(
    strings
      .map((value) => ({ length: [...value].length, value }))
      .sort(compareStrings)
      .map(({ value }) => value),
    null,
    2,
  )

export const createHeapSnapshotStringsFileSystemProvider = () => ({
  id: scheme,
  isReadonly: () => true,
  readFile: async (uri: string): Promise<string> => {
    const sourceUri = getHeapSnapshotSourceUri(uri)
    const blob = await readHeapSnapshotBlob(sourceUri)
    const strings = await getHeapSnapshotStrings(blob)
    return formatHeapSnapshotStrings(strings)
  },
})
