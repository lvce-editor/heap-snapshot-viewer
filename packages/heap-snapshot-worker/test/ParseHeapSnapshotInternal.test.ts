import { expect, test } from '@jest/globals'
import * as ParseHeapSnapshotInternal from '../src/parts/ParseHeapSnapshotInternal/ParseHeapSnapshotInternal.js'

test('parseHeapSnapshotInternalEdges', () => {
  const nodes = new Uint32Array(
    [
      [0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 0, 2, 0, 0],
    ].flat(1),
  )
  const nodeFields = ['type', 'name', 'id', 'self_size', 'edge_count', 'trace_node_id', 'detachedness']
  const nodeTypes = [
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
  ]
  const edgeFields = ['type', 'name_or_index', 'to_node']
  const edgeTypes = ['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak']
  const edges = new Uint32Array(
    [
      [0, 0, 0],
      [0, 0, 0],
    ].flat(1),
  )
  const strings = ['test']
  expect(
    ParseHeapSnapshotInternal.parseHeapSnapshotInternal(nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, strings),
  ).toEqual({
    firstEdgeIndexes: new Uint32Array([0, 2]),
  })
})
