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
    { name: 'statistics', time: 1 },
    { name: 'parse', time: 1 },
    { name: 'aggregates', time: 1 },
  ])
})

test('cleans up analysis state after each snapshot', () => {
  analyzeHeapSnapshotWithDependencies(parsedHeapSnapshot, { id: 2, now: () => 0 })
  expect(HeapSnapshotState.get(2)).toBeUndefined()
})
