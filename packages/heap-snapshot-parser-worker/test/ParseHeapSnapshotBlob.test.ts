import { expect, test } from '@jest/globals'
import { parseHeapSnapshotBlob } from '../src/parts/ParseHeapSnapshotBlob.ts'

const snapshot = {
  edges: [2, 3, 7, 2, 4, 14],
  nodes: [9, 0, 1, 0, 2, 0, 0, 3, 1, 2, 5, 0, 0, 0, 3, 2, 3, 3, 0, 0, 0],
  snapshot: {
    meta: {
      edge_fields: ['type', 'name_or_index', 'to_node'],
      edge_types: [['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak']],
      node_fields: ['type', 'name', 'id', 'self_size', 'edge_count', 'trace_node_id', 'detachedness'],
      node_types: [['hidden', 'array', 'string', 'object', 'code', 'closure', 'regexp', 'number', 'native', 'synthetic']],
    },
  },
  strings: ['(GC roots)', 'Widget', 'Controller', 'widget', 'controller'],
}

test('parses a Blob into typed arrays and metadata without analysis', async () => {
  const blob = new Blob([JSON.stringify(snapshot)])
  const result = await parseHeapSnapshotBlob(blob)

  expect(result.type).toBe('success')
  if (result.type !== 'success') {
    return
  }
  expect(result.value.nodes).toBeInstanceOf(Uint32Array)
  expect(result.value.edges).toBeInstanceOf(Uint32Array)
  expect([...result.value.nodes]).toEqual(snapshot.nodes)
  expect([...result.value.edges]).toEqual(snapshot.edges)
  expect(result.value.strings).toEqual(snapshot.strings)
  expect(result.value.snapshotSize).toBe(blob.size)
})

test('returns malformed input as a validation error', async () => {
  await expect(parseHeapSnapshotBlob(new Blob(['not json']))).resolves.toEqual({
    message: 'The file is not valid JSON. Check the file contents and try again.',
    type: 'validation-error',
  })
})
