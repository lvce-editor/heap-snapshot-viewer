import { expect, test } from '@jest/globals'
import * as CalculateRetainedSizes from '../src/parts/CalculateRetainedSizes/CalculateRetainedSizes.ts'

const nodeFields = ['type', 'name', 'id', 'self_size', 'edge_count', 'trace_node_id', 'detachedness']
const edgeFields = ['type', 'name_or_index', 'to_node']
const edgeTypes = ['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak']
const nodeFieldCount = nodeFields.length

const node = (size: number, edgeCount: number): readonly number[] => [3, 0, 0, size, edgeCount, 0, 0]
const edge = (targetOrdinal: number, type = 2): readonly number[] => [type, 0, targetOrdinal * nodeFieldCount]

test('calculates retained sizes for a chain', () => {
  const nodes = new Uint32Array([node(0, 1), node(10, 1), node(20, 0)].flat())
  const edges = new Uint32Array([edge(1), edge(2)].flat())
  const result = CalculateRetainedSizes.calculateRetainedSizes(
    nodes,
    nodeFields,
    edges,
    edgeFields,
    edgeTypes,
    new Uint32Array([0, 3, 6]),
    0,
  )

  expect(result.dominatorsTree).toEqual(new Uint32Array([0, 0, 1]))
  expect(result.retainedSizes).toEqual(new Float64Array([30, 30, 20]))
})

test('does not retain a node that is reachable through another branch', () => {
  const nodes = new Uint32Array([node(0, 2), node(10, 1), node(5, 1), node(20, 0)].flat())
  const edges = new Uint32Array([edge(1), edge(2), edge(3), edge(3)].flat())
  const result = CalculateRetainedSizes.calculateRetainedSizes(
    nodes,
    nodeFields,
    edges,
    edgeFields,
    edgeTypes,
    new Uint32Array([0, 6, 9, 12]),
    0,
  )

  expect(result.dominatorsTree).toEqual(new Uint32Array([0, 0, 0, 0]))
  expect(result.retainedSizes).toEqual(new Float64Array([35, 10, 5, 20]))
})

test('does not treat weak edges as retaining references', () => {
  const nodes = new Uint32Array([node(0, 1), node(10, 1), node(20, 0)].flat())
  const edges = new Uint32Array([edge(1), edge(2, 6)].flat())
  const result = CalculateRetainedSizes.calculateRetainedSizes(
    nodes,
    nodeFields,
    edges,
    edgeFields,
    edgeTypes,
    new Uint32Array([0, 3, 6]),
    0,
  )

  expect(result.dominatorsTree).toEqual(new Uint32Array([0, 0, 0]))
  expect(result.retainedSizes).toEqual(new Float64Array([30, 10, 20]))
})
