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
test('exclude zero size node', () => {
  const nodes = new Uint32Array([[3, 0, 0, 0, 2, 0, 0]].flat())
  const strings = ['test']
  expect(
    GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(
      nodes,
      nodeFields,
      nodeTypes,
      strings,
      new Float64Array([0]),
      new Uint32Array([0]),
    ),
  ).toEqual([])
})

test('regexp node', () => {
  const nodes = new Uint32Array([[6, 0, 0, 1, 0, 0, 0]].flat())
  const strings = ['test']
  expect(
    GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(
      nodes,
      nodeFields,
      nodeTypes,
      strings,
      new Float64Array([1]),
      new Uint32Array([0]),
    ),
  ).toEqual([
    {
      count: 1,
      name: 'RegExp',
      retainedSize: 1,
      shallowSize: 1,
      type: 'regexp',
    },
  ])
})

test('does not double count retained size for nested instances of the same class', () => {
  const nodes = new Uint32Array(
    [
      [9, 0, 0, 0, 1, 0, 0],
      [3, 1, 0, 10, 1, 0, 0],
      [3, 1, 0, 5, 0, 0, 0],
    ].flat(),
  )
  const strings = ['(GC roots)', 'Widget']
  expect(
    GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(
      nodes,
      nodeFields,
      nodeTypes,
      strings,
      new Float64Array([15, 15, 5]),
      new Uint32Array([0, 0, 1]),
    ),
  ).toEqual([
    {
      count: 2,
      name: 'Widget',
      retainedSize: 15,
      shallowSize: 15,
      type: 'object',
    },
  ])
})
