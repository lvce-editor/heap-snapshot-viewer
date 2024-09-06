import { expect, test } from '@jest/globals'
import * as GetAggregatesByClassNameInternal from '../src/parts/GetAggregatesByClassNameInternal/GetAggregatesByClassNameInternal.js'

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

test('exclude zero size node', () => {
  const nodes = new Uint32Array([[3, 0, 0, 0, 2, 0, 0]].flat(1))
  const edges = new Uint32Array([])
  const strings = ['test']
  const firstEdgeIndexes = new Uint32Array()
  expect(
    GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(
      nodes,
      nodeFields,
      nodeTypes,
      edges,
      edgeFields,
      edgeTypes,
      strings,
      firstEdgeIndexes,
    ),
  ).toEqual([])
})

test('regexp node', () => {
  const nodes = new Uint32Array([[6, 0, 0, 1, 0, 0, 0]].flat(1))
  const edges = new Uint32Array([])
  const strings = ['test']
  const firstEdgeIndexes = new Uint32Array()
  expect(
    GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(
      nodes,
      nodeFields,
      nodeTypes,
      edges,
      edgeFields,
      edgeTypes,
      strings,
      firstEdgeIndexes,
    ),
  ).toEqual([
    {
      name: 'RegExp',
      count: 1,
    },
  ])
})
