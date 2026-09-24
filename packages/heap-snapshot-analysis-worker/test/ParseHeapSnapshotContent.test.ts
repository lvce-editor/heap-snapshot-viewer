import { expect, test } from '@jest/globals'
import { analyzeHeapSnapshotWithDependencies } from '../src/parts/AnalyzeHeapSnapshot/AnalyzeHeapSnapshot.ts'
import * as HeapSnapshotState from '../src/parts/HeapSnapshotState/HeapSnapshotState.ts'

const parsedHeapSnapshot = {
  edgeFields: ['type', 'name_or_index', 'to_node'],
  edges: new Uint32Array([2, 3, 7, 2, 4, 14]),
  edgeTypes: ['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak'],
  nodeFields: ['type', 'name', 'id', 'self_size', 'edge_count', 'trace_node_id', 'detachedness'],
  nodes: new Uint32Array([9, 0, 1, 0, 2, 0, 0, 3, 1, 2, 5, 0, 0, 0, 3, 2, 3, 3, 0, 0, 0]),
  nodeTypes: ['hidden', 'array', 'string', 'object', 'code', 'closure', 'regexp', 'number', 'native', 'synthetic'],
  rootNodeIndex: 0,
  snapshotSize: 123,
  strings: ['(GC roots)', 'Widget', 'Controller', 'widget', 'controller'],
}

test('analyzes parsed typed arrays into render-ready data', () => {
  let time = 0
  const parsed = analyzeHeapSnapshotWithDependencies(parsedHeapSnapshot, {
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
    snapshotSize: 123,
    totalShallowSize: 8,
  })
  expect(parsed.timings).toEqual([
    { name: 'parse', time: 1 },
    { name: 'statistics', time: 1 },
    { name: 'aggregates', time: 1 },
  ])
})

test('groups sizes after hidden ownership transfers match constructor aggregates', () => {
  const parsed = analyzeHeapSnapshotWithDependencies(
    {
      edgeFields: ['type', 'name_or_index', 'to_node'],
      edges: new Uint32Array([2, 0, 7, 2, 0, 14]),
      edgeTypes: ['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak'],
      nodeFields: ['type', 'name', 'id', 'self_size', 'edge_count', 'trace_node_id', 'detachedness'],
      nodes: new Uint32Array([9, 0, 1, 0, 1, 0, 0, 3, 1, 2, 10, 1, 0, 0, 1, 2, 3, 20, 0, 0, 0]),
      nodeTypes: ['hidden', 'array', 'string', 'object', 'code', 'closure', 'regexp', 'number', 'native', 'synthetic'],
      rootNodeIndex: 0,
      snapshotSize: 456,
      strings: ['(GC roots)', 'Widget', 'items'],
    },
    { id: 3, now: () => 0 },
  )

  expect(parsed.aggregates).toContainEqual({ count: 1, name: 'Widget', retainedSize: 30, shallowSize: 30, type: 'object' })
  expect(parsed.memoryByType).toEqual([{ name: 'Objects', size: 30 }])
  expect(parsed.summary).toEqual({ edgeCount: 2, nodeCount: 3, snapshotSize: 456, totalShallowSize: 30 })
})

test('cleans up analysis state after each snapshot', () => {
  analyzeHeapSnapshotWithDependencies(parsedHeapSnapshot, { id: 2, now: () => 0 })
  expect(HeapSnapshotState.get(2)).toBeUndefined()
})
