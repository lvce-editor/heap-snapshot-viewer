import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { render } from '../src/parts/RenderHeapSnapshot/RenderHeapSnapshot.ts'

const state = {
  aggregates: [
    {
      count: 2,
      name: 'Widget',
      retainedSize: 96,
      shallowSize: 64,
      type: 'object',
    },
  ],
  expandedNames: [],
  filterValue: 'wid',
  memoryByType: [
    {
      name: 'Objects',
      size: 64,
    },
  ],
  showTimings: false,
  summary: {
    edgeCount: 4,
    nodeCount: 3,
    snapshotSize: 1536,
    totalShallowSize: 64,
  },
  timings: [
    {
      name: 'parse',
      time: 1.25,
    },
  ],
}

test('renders metadata, memory usage, sizes, and collapsed aggregate rows', () => {
  const dom = render(state)
  const classNames = dom.flatMap((node) => (typeof node.className === 'string' ? [node.className] : []))

  expect(dom[0]).toEqual({
    childCount: 3,
    className: 'HeapSnapshotView',
    type: VirtualDomElements.Div,
  })
  expect(dom).toContainEqual({
    ariaExpanded: 'false',
    ariaLabel: 'Expand Widget',
    childCount: 0,
    className: 'HeapSnapshotDisclosure',
    name: 'toggle-aggregate:Widget',
    onClick: 'handleClick',
    title: 'Expand Widget',
    type: VirtualDomElements.Button,
  })
  expect(dom).toContainEqual({
    ariaLabel: 'Filter heap snapshot constructors',
    autocomplete: 'off',
    childCount: 0,
    className: 'HeapSnapshotFilterInput',
    name: 'filter',
    onInput: 'handleInput',
    placeholder: 'Filter by constructor',
    type: VirtualDomElements.Input,
    value: 'wid',
  })
  expect(dom.some((node) => node.text === '1.5 KB')).toBe(true)
  expect(dom.some((node) => node.text === 'Objects')).toBe(true)
  expect(dom.some((node) => node.text === 'Shallow size')).toBe(true)
  expect(dom.some((node) => node.text === 'Retained size')).toBe(true)
  expect(dom.some((node) => node.text === 'parse')).toBe(false)
  expect(dom.some((node) => node.text === 'Widget')).toBe(true)
  expect(dom.some((node) => node.text === '× 2')).toBe(true)
  expect(classNames.every((className) => className.startsWith('HeapSnapshot'))).toBe(true)
  expect(classNames).toContain('HeapSnapshotTable')
})

test('shows processing timings only when enabled', () => {
  const dom = render({
    ...state,
    showTimings: true,
  })

  expect(dom[0].childCount).toBe(4)
  expect(dom.some((node) => node.text === 'Processing timings')).toBe(true)
  expect(dom.some((node) => node.text === 'parse')).toBe(true)
  expect(dom.some((node) => node.text === '1.25 ms')).toBe(true)
})

test('renders expanded aggregate details and an expanded disclosure', () => {
  const dom = render({
    ...state,
    expandedNames: ['Widget'],
  })

  expect(dom).toContainEqual({
    ariaExpanded: 'true',
    ariaLabel: 'Collapse Widget',
    childCount: 0,
    className: 'HeapSnapshotDisclosure HeapSnapshotDisclosureExpanded',
    name: 'toggle-aggregate:Widget',
    onClick: 'handleClick',
    title: 'Collapse Widget',
    type: VirtualDomElements.Button,
  })
  expect(dom.some((node) => node.text === 'Average shallow')).toBe(true)
  expect(dom.some((node) => node.text === '32 B')).toBe(true)
})
