import type { ViewContext } from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'
import { createInstanceWithDependencies } from '../src/parts/HeapSnapshotViewInstance/HeapSnapshotViewInstance.ts'

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

const context = {
  state: {
    filterValue: '',
  },
  uid: 7,
  uri: '/workspace/test.heapsnapshot',
  viewId: 'builtin.heap-snapshot-viewer',
} as unknown as ViewContext

test('reads and parses the heap snapshot in the extension worker', async () => {
  const readFile = jest.fn(async (_uri: string) => heapSnapshot)
  let time = 0
  const instance = await createInstanceWithDependencies(context, {
    now: () => time++,
    readFile,
  })

  expect(readFile).toHaveBeenCalledWith('/workspace/test.heapsnapshot')
  const dom = instance.render()
  expect(dom.some((node) => node.text === 'Widget')).toBe(true)
  expect(dom.some((node) => node.text === 'Controller')).toBe(true)
  expect(dom.some((node) => node.text === 'aggregates: 1.00')).toBe(true)

  instance.dispose?.()
})

test('filters aggregates and saves lightweight view state', async () => {
  const instance = await createInstanceWithDependencies(context, {
    now: () => 0,
    readFile: async () => heapSnapshot,
  })

  await instance.handleEvent?.({
    name: 'filter',
    type: 'input',
    value: 'widget',
  })

  const dom = instance.render()
  expect(dom.some((node) => node.text === 'Widget')).toBe(true)
  expect(dom.some((node) => node.text === 'Controller')).toBe(false)
  expect(instance.saveState()).toEqual({
    filterValue: 'widget',
    uri: '/workspace/test.heapsnapshot',
  })

  instance.dispose?.()
})
