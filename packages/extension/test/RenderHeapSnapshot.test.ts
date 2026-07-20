import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { render } from '../src/parts/RenderHeapSnapshot/RenderHeapSnapshot.ts'

const state = {
  aggregates: [
    {
      count: 2,
      name: 'Widget',
    },
  ],
  filterValue: 'wid',
  timings: [
    {
      name: 'parse',
      time: 1.25,
    },
  ],
}

test('renders filter, timings, and aggregate table', () => {
  const dom = render(state)

  expect(dom[0]).toEqual({
    childCount: 3,
    className: 'HeapSnapshotView',
    type: VirtualDomElements.Div,
  })
  expect(dom).toContainEqual({
    ariaLabel: 'Filter heap snapshot constructors',
    autocomplete: 'off',
    childCount: 0,
    className: 'FilterInput',
    name: 'filter',
    onInput: 'handleInput',
    placeholder: 'Filter',
    type: VirtualDomElements.Input,
    value: 'wid',
  })
  expect(dom.some((node) => node.text === 'parse: 1.25')).toBe(true)
  expect(dom.some((node) => node.text === 'Widget')).toBe(true)
  expect(dom.some((node) => node.text === 'x 2')).toBe(true)
})
