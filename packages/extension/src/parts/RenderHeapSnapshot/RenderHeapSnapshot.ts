import { text, VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { HeapSnapshotAggregate, HeapSnapshotViewState } from '../HeapSnapshotViewInstance/HeapSnapshotViewInstance.ts'

interface TreeNode {
  readonly children: readonly TreeNode[]
  readonly node: VirtualDomNode
}

const textNode = (value: string): TreeNode => ({
  children: [],
  node: text(value),
})

const node = (
  type: number,
  properties: Readonly<Record<string, unknown>> = {},
  children: readonly TreeNode[] = [],
): TreeNode => ({
  children,
  node: {
    ...properties,
    childCount: children.length,
    type,
  },
})

const flatten = (tree: TreeNode): readonly VirtualDomNode[] => {
  return [tree.node, ...tree.children.flatMap(flatten)]
}

const span = (className: string, value: string): TreeNode => {
  const children = [textNode(value)]
  return node(VirtualDomElements.Span, { className }, children)
}

const renderAggregate = (aggregate: HeapSnapshotAggregate): TreeNode => {
  const cellChildren = [span('HeapSnapshotClassName', aggregate.name), span('HeapSnapshotCountLabel', `x ${aggregate.count}`)]
  const cell = node(VirtualDomElements.Td, { className: 'HeapSnapshotTableCell' }, cellChildren)
  return node(VirtualDomElements.Tr, { className: 'HeapSnapshotTableBodyRow' }, [cell])
}

const renderTableHeader = (): TreeNode => {
  const heading = node(VirtualDomElements.Th, { className: 'HeapSnapshotTableHeaderCell' }, [textNode('Constructor')])
  const row = node(VirtualDomElements.Tr, { className: 'HeapSnapshotTableHeaderRow' }, [heading])
  return node(VirtualDomElements.THead, { className: 'HeapSnapshotTableHeader' }, [row])
}

const renderTable = (aggregates: readonly HeapSnapshotAggregate[]): TreeNode => {
  const body = node(VirtualDomElements.TBody, { className: 'HeapSnapshotTableBody' }, aggregates.map(renderAggregate))
  return node(VirtualDomElements.Table, { className: 'HeapSnapshotTable' }, [renderTableHeader(), body])
}

const renderFilter = (value: string): TreeNode => {
  const input = node(VirtualDomElements.Input, {
    ariaLabel: 'Filter heap snapshot constructors',
    autocomplete: 'off',
    className: 'HeapSnapshotFilterInput',
    name: 'filter',
    onInput: 'handleInput',
    placeholder: 'Filter',
    value,
  })
  const inputWrapper = node(VirtualDomElements.Div, { className: 'HeapSnapshotFilterInputWrapper' }, [input])
  return node(VirtualDomElements.Header, { className: 'HeapSnapshotHeader' }, [inputWrapper])
}

const renderTiming = (timing: Readonly<HeapSnapshotViewState['timings'][number]>): TreeNode => {
  const label = textNode(`${timing.name}: ${timing.time.toFixed(2)}`)
  return node(VirtualDomElements.Li, {}, [label])
}

export const render = (state: Readonly<HeapSnapshotViewState>): readonly VirtualDomNode[] => {
  const timings = node(VirtualDomElements.Ul, { className: 'HeapSnapshotTimings' }, state.timings.map(renderTiming))
  const children = [renderFilter(state.filterValue), timings, renderTable(state.aggregates)]
  const root = node(VirtualDomElements.Div, { className: 'HeapSnapshotView' }, children)
  return flatten(root)
}
