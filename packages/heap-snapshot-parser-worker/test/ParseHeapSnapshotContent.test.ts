import { expect, test } from '@jest/globals'
import * as HeapSnapshotState from '../src/parts/HeapSnapshotState/HeapSnapshotState.ts'
import { parseHeapSnapshotContentWithDependencies } from '../src/parts/ParseHeapSnapshotContent/ParseHeapSnapshotContent.ts'

const heapSnapshot = JSON.stringify({
  edges: [2, 3, 7, 2, 4, 14],
  nodes: [9, 0, 1, 0, 2, 0, 0, 3, 1, 2, 5, 0, 0, 0, 3, 2, 3, 3, 0, 0, 0],
  snapshot: {
    meta: {
      edge_fields: ['type', 'name_or_index', 'to_node'],
      edge_types: [['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak']],
      node_fields: ['type', 'name', 'id', 'self_size', 'edge_count', 'trace_node_id', 'detachedness'],
      node_types: [
        [
          'hidden',
          'array',
          'string',
          'object',
          'code',
          'closure',
          'regexp',
          'number',
          'native',
          'synthetic',
          'concatenated string',
          'sliced string',
          'symbol',
          'bigint',
          'object shape',
        ],
      ],
    },
  },
  strings: ['(GC roots)', 'Widget', 'Controller', 'widget', 'controller'],
})

test('parses a heap snapshot into render-ready data', () => {
  let time = 0
  const parsed = parseHeapSnapshotContentWithDependencies(heapSnapshot, {
    id: 1,
    now: () => time++,
  })

  expect(parsed.aggregates).toEqual([
    { count: 1, name: 'Widget', retainedSize: 5, shallowSize: 5, type: 'object' },
    { count: 1, name: 'Controller', retainedSize: 3, shallowSize: 3, type: 'object' },
  ])
  expect(parsed.memoryByType).toEqual([{ name: 'Objects', size: 8 }])
  expect(parsed.summary).toEqual({
    edgeCount: 2,
    nodeCount: 3,
    snapshotSize: new TextEncoder().encode(heapSnapshot).byteLength,
    totalShallowSize: 8,
  })
  expect(parsed.timings).toEqual([
    { name: 'create', time: 1 },
    { name: 'pre-parse', time: 1 },
    { name: 'statistics', time: 1 },
    { name: 'parse', time: 1 },
    { name: 'aggregates', time: 1 },
  ])
})

test('cleans up parser state when parsing fails', () => {
  expect(() =>
    parseHeapSnapshotContentWithDependencies('not json', {
      id: 2,
      now: () => 0,
    }),
  ).toThrow(SyntaxError)

  expect(HeapSnapshotState.get(2)).toBeUndefined()
})
