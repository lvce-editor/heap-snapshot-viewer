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
  const cellChildren = [span('ClassName', aggregate.name), span('CountLabel', `x ${aggregate.count}`)]
  const cell = node(VirtualDomElements.Td, { className: 'TableCell' }, cellChildren)
  return node(VirtualDomElements.Tr, { className: 'TableBodyRow' }, [cell])
}

const renderTableHeader = (): TreeNode => {
  const heading = node(VirtualDomElements.Th, { className: 'TableHeaderCell' }, [textNode('Constructor')])
  const row = node(VirtualDomElements.Tr, { className: 'TableHeaderRow' }, [heading])
  return node(VirtualDomElements.THead, { className: 'TableHeader' }, [row])
}

const renderTable = (aggregates: readonly HeapSnapshotAggregate[]): TreeNode => {
  const body = node(VirtualDomElements.TBody, { className: 'TableBody' }, aggregates.map(renderAggregate))
  return node(VirtualDomElements.Table, { className: 'Table' }, [renderTableHeader(), body])
}

const renderFilter = (value: string): TreeNode => {
  const input = node(VirtualDomElements.Input, {
    ariaLabel: 'Filter heap snapshot constructors',
    autocomplete: 'off',
    className: 'FilterInput',
    name: 'filter',
    onInput: 'handleInput',
    placeholder: 'Filter',
    value,
  })
  return node(VirtualDomElements.Header, { className: 'Header' }, [input])
}

const renderTiming = (timing: Readonly<HeapSnapshotViewState['timings'][number]>): TreeNode => {
  const label = textNode(`${timing.name}: ${timing.time.toFixed(2)}`)
  return node(VirtualDomElements.Li, {}, [label])
}

export const render = (state: Readonly<HeapSnapshotViewState>): readonly VirtualDomNode[] => {
  const timings = node(VirtualDomElements.Ul, { className: 'Timings' }, state.timings.map(renderTiming))
  const children = [renderFilter(state.filterValue), timings, renderTable(state.aggregates)]
  const root = node(VirtualDomElements.Div, { className: 'HeapSnapshotView' }, children)
  return flatten(root)
}
