import { expect, test } from '@jest/globals'
import {
  createHeapSnapshotStringsFileSystemProvider,
  createHeapSnapshotStringsUri,
  formatHeapSnapshotStrings,
  getHeapSnapshotSourceUri,
} from '../src/parts/HeapSnapshotStrings/HeapSnapshotStrings.ts'

test('round trips source URIs with spaces and URI delimiters', () => {
  const sourceUri = 'file:///workspace/a path/heap?snapshot#1.heapsnapshot'
  expect(getHeapSnapshotSourceUri(createHeapSnapshotStringsUri(sourceUri))).toBe(sourceUri)
})

test('formats strings by Unicode character length and escapes multiline strings', () => {
  expect(formatHeapSnapshotStrings(['longer', '😀', '', 'é', 'a\nb', 'a', 'a'])).toBe(
    '""\n"a"\n"a"\n"é"\n"😀"\n"a\\nb"\n"longer"',
  )
})

test('rejects malformed strings URIs', () => {
  expect(() => getHeapSnapshotSourceUri('heapnapshot-strings:///bad%ZZ')).toThrow('Invalid heap snapshot strings URI')
  expect(() => getHeapSnapshotSourceUri('heapnapshot-strings:///')).toThrow('Invalid heap snapshot strings URI')
})

test('does not mutate the source string table', () => {
  const strings = Object.freeze(['longer', '', 'a'])
  expect(formatHeapSnapshotStrings(strings)).toBe('""\n"a"\n"longer"')
  expect(strings).toEqual(['longer', '', 'a'])
})

test('provider is read-only and exposes no file or directory mutation methods', () => {
  const provider = createHeapSnapshotStringsFileSystemProvider()
  expect(provider.isReadonly()).toBe(true)
  for (const method of ['writeFile', 'mkdir', 'remove', 'rename']) {
    expect(provider).not.toHaveProperty(method)
  }
})
