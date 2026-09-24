import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { render } from '../src/parts/RenderHeapSnapshot/RenderHeapSnapshot.ts'

const state = {
  aggregatePage: 0,
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
  view: 'constructors' as const,
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
  expect(dom).toContainEqual({
    ariaLabel: 'Heap snapshot view',
    childCount: 2,
    className: 'HeapSnapshotViewSelector',
    role: 'group',
    type: VirtualDomElements.Div,
  })
  expect(dom).toContainEqual({
    ariaPressed: 'false',
    childCount: 1,
    className: 'HeapSnapshotViewTab',
    name: 'view:statistics',
    onClick: 'handleClick',
    type: VirtualDomElements.Button,
  })
  expect(dom).toContainEqual({
    childCount: 3,
    className: 'HeapSnapshotTableColumnGroup',
    type: VirtualDomElements.ColGroup,
  })
  expect(dom.filter((node) => node.type === VirtualDomElements.Col)).toEqual([
    {
      childCount: 0,
      className: 'HeapSnapshotTableColumnConstructor',
      type: VirtualDomElements.Col,
    },
    {
      childCount: 0,
      className: 'HeapSnapshotTableColumnShallowSize',
      type: VirtualDomElements.Col,
    },
    {
      childCount: 0,
      className: 'HeapSnapshotTableColumnRetainedSize',
      type: VirtualDomElements.Col,
    },
  ])
})

test('renders a proportional donut, total, and legend in the statistics view', () => {
  const dom = render({
    ...state,
    memoryByType: [
      { name: 'Objects', size: 48 },
      { name: 'Strings', size: 16 },
    ],
    summary: { ...state.summary, totalShallowSize: 64 },
    view: 'statistics',
  })

  expect(dom.some((node) => node.className === 'HeapSnapshotStatistics')).toBe(true)
  expect(dom.some((node) => node.className === 'HeapSnapshotDonut')).toBe(true)
  expect(dom.some((node) => typeof node.style === 'string' && node.style.includes('conic-gradient'))).toBe(true)
  expect(dom.some((node) => node.text === 'Objects')).toBe(true)
  expect(dom.some((node) => node.text === 'Strings')).toBe(true)
  expect(dom.some((node) => node.text === '64 B')).toBe(true)
  expect(dom.some((node) => node.className === 'HeapSnapshotTable')).toBe(false)
})

test('renders an empty statistics donut without invalid geometry', () => {
  const dom = render({
    ...state,
    memoryByType: [],
    summary: { ...state.summary, totalShallowSize: 0 },
    view: 'statistics',
  })

  const chart = dom.find((node) => node.className === 'HeapSnapshotDonut')
  expect(chart?.style).not.toContain('NaN')
  expect(chart?.style).not.toContain('Infinity')
  expect(dom.some((node) => node.text === '0 B')).toBe(true)
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

test('bounds the number of rendered aggregate rows', () => {
  const aggregates = Array.from({ length: 10_000 }, (_, index) => ({
    count: 1,
    name: `Class${index}`,
    retainedSize: 1,
    shallowSize: 1,
    type: 'object',
  }))

  const dom = render({
    ...state,
    aggregates,
  })

  expect(dom.filter((node) => node.className === 'HeapSnapshotClassName')).toHaveLength(500)
  expect(dom.some((node) => node.text === 'Showing 1–500 of 10,000 constructors')).toBe(true)
  expect(dom.length).toBeLessThan(6000)
})
