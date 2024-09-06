import { expect, test } from '@jest/globals'
import * as AddAccurateSizes from '../src/parts/AddAccurateSizes/AddAccurateSizes.ts'

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

test('add size to array owner', () => {
  const nodes = new Uint32Array(
    [
      [9, 0, 1, 1, 0, 0, 0], // root, size 1
      [3, 0, 2, 1, 1, 0, 0], // object, size 1
      [1, 0, 3, 2, 0, 0, 0], // array, size 2
    ].flat(1),
  )
  const nodeFieldCount = nodeFields.length
  const edges = new Uint32Array(
    [
      [2, 0, 2 * nodeFieldCount], // edge from object to array
    ].flat(1),
  )
  const firstEdgeIndexes = new Uint32Array([0, 0, 0])
  AddAccurateSizes.addAccurateSizes(nodes, nodeFields, nodeTypes, edges, edgeFields, edgeTypes, firstEdgeIndexes)
  const sizeOffset = nodeFields.indexOf('self_size')
  expect(nodes[0 * nodeFieldCount + sizeOffset]).toBe(1)
  expect(nodes[1 * nodeFieldCount + sizeOffset]).toBe(3)
  expect(nodes[2 * nodeFieldCount + sizeOffset]).toBe(0)
})
