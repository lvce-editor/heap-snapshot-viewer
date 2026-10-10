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

test('formats strings as an indented JSON array sorted by Unicode character length', () => {
  const strings = ['longer', '😀', '', 'é', 'a\nb', 'a', 'a']
  const formatted = formatHeapSnapshotStrings(strings)
  expect(formatted).toBe('[\n  "",\n  "a",\n  "a",\n  "é",\n  "😀",\n  "a\\nb",\n  "longer"\n]')
  expect(JSON.parse(formatted)).toEqual(['', 'a', 'a', 'é', '😀', 'a\nb', 'longer'])
})

test('formats empty and single-item string arrays as valid JSON', () => {
  expect(formatHeapSnapshotStrings([])).toBe('[]')
  expect(JSON.parse(formatHeapSnapshotStrings([]))).toEqual([])

  const formatted = formatHeapSnapshotStrings(['single'])
  expect(formatted).toBe('[\n  "single"\n]')
  expect(JSON.parse(formatted)).toEqual(['single'])
})

test('preserves quotes, backslashes, Unicode and control characters in JSON strings', () => {
  const controlCharacters = JSON.parse('"\\b\\t\\n\\f\\r\\u0000\\u001f"') as string
  const strings = ['quote " and slash \\', controlCharacters, 'é', '😀']
  const formatted = formatHeapSnapshotStrings(strings)
  expect(JSON.parse(formatted)).toEqual(['é', '😀', controlCharacters, 'quote " and slash \\'])
  expect(formatted).toContain('\\b\\t\\n\\f\\r\\u0000\\u001f')
  expect(formatted).toContain('quote \\" and slash \\\\')
})

test('rejects malformed strings URIs', () => {
  expect(() => getHeapSnapshotSourceUri('heapnapshot-strings:///bad%ZZ')).toThrow('Invalid heap snapshot strings URI')
  expect(() => getHeapSnapshotSourceUri('heapnapshot-strings:///')).toThrow('Invalid heap snapshot strings URI')
})

test('does not mutate the source string table', () => {
  const strings = Object.freeze(['longer', '', 'a'])
  expect(formatHeapSnapshotStrings(strings)).toBe('[\n  "",\n  "a",\n  "longer"\n]')
  expect(strings).toEqual(['longer', '', 'a'])
})

test('provider is read-only and exposes no file or directory mutation methods', () => {
  const provider = createHeapSnapshotStringsFileSystemProvider()
  expect(provider.isReadonly()).toBe(true)
  for (const method of ['writeFile', 'mkdir', 'remove', 'rename']) {
    expect(provider).not.toHaveProperty(method)
  }
})
