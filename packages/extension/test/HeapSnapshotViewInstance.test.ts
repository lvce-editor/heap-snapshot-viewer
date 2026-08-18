import type { ViewContext } from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'
import { HeapSnapshotValidationError } from '../src/parts/HeapSnapshotValidationError/HeapSnapshotValidationError.ts'
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

const parsedHeapSnapshot = {
  aggregates: [
    {
      count: 1,
      name: 'Widget',
      retainedSize: 5,
      shallowSize: 5,
      type: 'object',
    },
    {
      count: 1,
      name: 'Controller',
      retainedSize: 3,
      shallowSize: 3,
      type: 'object',
    },
  ],
  memoryByType: [
    {
      name: 'Objects',
      size: 8,
    },
  ],
  summary: {
    edgeCount: 2,
    nodeCount: 3,
    snapshotSize: heapSnapshot.length,
    totalShallowSize: 8,
  },
  timings: [
    {
      name: 'parse',
      time: 1,
    },
  ],
}

const context = {
  state: {
    filterValue: '',
  },
  uid: 7,
  uri: '/workspace/test.heapsnapshot',
  viewId: 'builtin.heap-snapshot-viewer',
} as unknown as ViewContext

test('reads the heap snapshot and delegates parsing to the parser worker', async () => {
  const readFile = jest.fn(async (_uri: string) => heapSnapshot)
  const parseHeapSnapshot = jest.fn(async (_content: string) => parsedHeapSnapshot)
  let time = 0
  const instance = await createInstanceWithDependencies(context, {
    getPreference: async () => false,
    now: () => time++,
    parseHeapSnapshot,
    readFile,
  })

  expect(readFile).toHaveBeenCalledWith('/workspace/test.heapsnapshot')
  expect(parseHeapSnapshot).toHaveBeenCalledWith(heapSnapshot)
  const dom = instance.render()
  expect(dom.some((node) => node.text === 'Widget')).toBe(true)
  expect(dom.some((node) => node.text === 'Controller')).toBe(true)
  expect(dom.some((node) => node.text === 'Nodes')).toBe(true)
  expect(dom.some((node) => node.text === '3')).toBe(true)
  expect(dom.some((node) => node.text === 'Processing timings')).toBe(false)

  instance.dispose?.()
})

test('filters aggregates and saves lightweight view state', async () => {
  const instance = await createInstanceWithDependencies(context, {
    getPreference: async () => false,
    now: () => 0,
    parseHeapSnapshot: async () => parsedHeapSnapshot,
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

test('reads the timing preference and expands aggregate details', async () => {
  const getPreference = jest.fn(async (_key: string) => true)
  const instance = await createInstanceWithDependencies(context, {
    getPreference,
    now: () => 0,
    parseHeapSnapshot: async () => parsedHeapSnapshot,
    readFile: async () => heapSnapshot,
  })

  expect(getPreference).toHaveBeenCalledWith('heapSnapshotViewer.showTimings')
  expect(instance.render().some((node) => node.text === 'Processing timings')).toBe(true)

  await instance.handleEvent?.({
    name: 'toggle-aggregate:Widget',
    type: 'click',
  })

  const dom = instance.render()
  expect(dom.some((node) => node.text === 'Average shallow')).toBe(true)
  instance.dispose?.()
})

test('renders validation errors returned by the parser worker', async () => {
  const instance = await createInstanceWithDependencies(context, {
    getPreference: async () => false,
    now: () => 0,
    parseHeapSnapshot: async () => {
      throw new HeapSnapshotValidationError('The file is not valid JSON.')
    },
    readFile: async () => 'not json',
  })

  expect(instance.render().some((node) => node.text === 'The file is not valid JSON.')).toBe(true)
})
