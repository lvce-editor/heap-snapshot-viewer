import { expect, test } from '@jest/globals'
import * as GetStatisticsInternal from '../src/parts/GetStatisticsInternal/GetStatisticsInternal.ts'

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

test('groups occupied shallow memory by type', () => {
  const nodes = new Uint32Array(
    [
      [2, 0, 0, 10, 0, 0, 0],
      [10, 0, 0, 5, 0, 0, 0],
      [3, 0, 0, 20, 0, 0, 0],
      [1, 0, 0, 8, 0, 0, 0],
      [9, 0, 0, 2, 0, 0, 0],
    ].flat(),
  )

  expect(GetStatisticsInternal.getStatisicsInternal(nodes, nodeFields, nodeTypes)).toEqual({
    memoryByType: [
      { name: 'Objects', size: 20 },
      { name: 'Strings', size: 15 },
      { name: 'Arrays', size: 8 },
      { name: 'System', size: 2 },
    ],
    totalShallowSize: 45,
  })
})
