import { text, VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { HeapSnapshotAggregate, HeapSnapshotMemoryType, HeapSnapshotSummary } from '../HeapSnapshot/HeapSnapshot.ts'
import type { HeapSnapshotViewState } from '../HeapSnapshotViewInstance/HeapSnapshotViewInstance.ts'

interface TreeNode {
  readonly children: readonly TreeNode[]
  readonly node: VirtualDomNode
}

const ToggleAggregatePrefix = 'toggle-aggregate:'
const CountFormatter = new Intl.NumberFormat('en-US')

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

const span = (className: string, value: string, properties: Readonly<Record<string, unknown>> = {}): TreeNode => {
  return node(VirtualDomElements.Span, { ...properties, className }, [textNode(value)])
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  let precision = 2
  if (value >= 100) {
    precision = 0
  } else if (value >= 10) {
    precision = 1
  }
  return `${Number(value.toFixed(precision))} ${units[unitIndex]}`
}

const formatCount = (value: number): string => {
  return CountFormatter.format(value)
}

const renderDetail = (label: string, value: string): TreeNode => {
  return node(VirtualDomElements.Div, { className: 'HeapSnapshotAggregateDetail' }, [
    span('HeapSnapshotAggregateDetailLabel', label),
    span('HeapSnapshotAggregateDetailValue', value),
  ])
}

const renderAggregateDetails = (aggregate: HeapSnapshotAggregate, summary: HeapSnapshotSummary): TreeNode => {
  const retainedShare = summary.totalShallowSize === 0 ? 0 : (aggregate.retainedSize / summary.totalShallowSize) * 100
  const details = [
    renderDetail('Type', aggregate.type),
    renderDetail('Instances', formatCount(aggregate.count)),
    renderDetail('Average shallow', formatBytes(aggregate.shallowSize / aggregate.count)),
    renderDetail('Retained share', `${retainedShare.toFixed(1)}%`),
  ]
  const content = node(VirtualDomElements.Div, { className: 'HeapSnapshotAggregateDetails' }, details)
  const cell = node(VirtualDomElements.Td, { className: 'HeapSnapshotTableDetailCell', colSpan: 3 }, [content])
  return node(VirtualDomElements.Tr, { className: 'HeapSnapshotTableDetailRow' }, [cell])
}

const renderAggregate = (
  aggregate: HeapSnapshotAggregate,
  isExpanded: boolean,
  summary: HeapSnapshotSummary,
): readonly TreeNode[] => {
  const disclosureClassName = isExpanded ? 'HeapSnapshotDisclosure HeapSnapshotDisclosureExpanded' : 'HeapSnapshotDisclosure'
  const disclosure = node(VirtualDomElements.Button, {
    ariaExpanded: isExpanded ? 'true' : 'false',
    ariaLabel: `${isExpanded ? 'Collapse' : 'Expand'} ${aggregate.name}`,
    className: disclosureClassName,
    name: `${ToggleAggregatePrefix}${aggregate.name}`,
    onClick: 'handleClick',
    title: `${isExpanded ? 'Collapse' : 'Expand'} ${aggregate.name}`,
  })
  const constructorCell = node(VirtualDomElements.Td, { className: 'HeapSnapshotTableCell HeapSnapshotConstructorCell' }, [
    disclosure,
    span('HeapSnapshotClassName', aggregate.name),
    span('HeapSnapshotCountLabel', `× ${formatCount(aggregate.count)}`),
  ])
  const shallowSizeCell = node(VirtualDomElements.Td, { className: 'HeapSnapshotTableCell HeapSnapshotNumericCell' }, [
    textNode(formatBytes(aggregate.shallowSize)),
  ])
  const retainedSizeCell = node(VirtualDomElements.Td, { className: 'HeapSnapshotTableCell HeapSnapshotNumericCell' }, [
    textNode(formatBytes(aggregate.retainedSize)),
  ])
  const rowClassName = isExpanded ? 'HeapSnapshotTableBodyRow HeapSnapshotTableBodyRowExpanded' : 'HeapSnapshotTableBodyRow'
  const row = node(VirtualDomElements.Tr, { className: rowClassName }, [constructorCell, shallowSizeCell, retainedSizeCell])
  return isExpanded ? [row, renderAggregateDetails(aggregate, summary)] : [row]
}

const renderTableHeaderCell = (label: string, className = ''): TreeNode => {
  const suffix = className ? ` ${className}` : ''
  return node(VirtualDomElements.Th, { className: `HeapSnapshotTableHeaderCell${suffix}`, scope: 'col' }, [textNode(label)])
}

const renderTableHeader = (): TreeNode => {
  const row = node(VirtualDomElements.Tr, { className: 'HeapSnapshotTableHeaderRow' }, [
    renderTableHeaderCell('Constructor'),
    renderTableHeaderCell('Shallow size', 'HeapSnapshotNumericCell'),
    renderTableHeaderCell('Retained size', 'HeapSnapshotNumericCell'),
  ])
  return node(VirtualDomElements.THead, { className: 'HeapSnapshotTableHeader' }, [row])
}

const renderTable = (
  aggregates: readonly HeapSnapshotAggregate[],
  expandedNames: readonly string[],
  summary: HeapSnapshotSummary,
): TreeNode => {
  const rows = aggregates.flatMap((aggregate) => renderAggregate(aggregate, expandedNames.includes(aggregate.name), summary))
  const body = node(VirtualDomElements.TBody, { className: 'HeapSnapshotTableBody' }, rows)
  return node(VirtualDomElements.Table, { className: 'HeapSnapshotTable' }, [renderTableHeader(), body])
}

const renderMetadataItem = (label: string, value: string): TreeNode => {
  return node(VirtualDomElements.Div, { className: 'HeapSnapshotMetadataItem' }, [
    span('HeapSnapshotMetadataValue', value),
    span('HeapSnapshotMetadataLabel', label),
  ])
}

const renderFilter = (value: string, summary: HeapSnapshotSummary): TreeNode => {
  const input = node(VirtualDomElements.Input, {
    ariaLabel: 'Filter heap snapshot constructors',
    autocomplete: 'off',
    className: 'HeapSnapshotFilterInput',
    name: 'filter',
    onInput: 'handleInput',
    placeholder: 'Filter by constructor',
    value,
  })
  const inputWrapper = node(VirtualDomElements.Div, { className: 'HeapSnapshotFilterInputWrapper' }, [input])
  const metadata = node(VirtualDomElements.Div, { className: 'HeapSnapshotMetadata' }, [
    renderMetadataItem('Snapshot', formatBytes(summary.snapshotSize)),
    renderMetadataItem('Nodes', formatCount(summary.nodeCount)),
    renderMetadataItem('Edges', formatCount(summary.edgeCount)),
  ])
  return node(VirtualDomElements.Header, { className: 'HeapSnapshotHeader' }, [inputWrapper, metadata])
}

const renderMemoryType = (memoryType: HeapSnapshotMemoryType, totalSize: number): TreeNode => {
  const percentage = totalSize === 0 ? 0 : (memoryType.size / totalSize) * 100
  const label = node(VirtualDomElements.Div, { className: 'HeapSnapshotMemoryTypeHeader' }, [
    span('HeapSnapshotMemoryTypeName', memoryType.name),
    span('HeapSnapshotMemoryTypeSize', formatBytes(memoryType.size)),
  ])
  const bar = node(VirtualDomElements.Div, { className: 'HeapSnapshotMemoryBar' }, [
    node(VirtualDomElements.Div, {
      ariaLabel: `${memoryType.name}: ${formatBytes(memoryType.size)}, ${percentage.toFixed(1)}%`,
      className: 'HeapSnapshotMemoryBarValue',
      role: 'meter',
      style: `--HeapSnapshotMemoryPercent: ${percentage}%`,
    }),
  ])
  return node(VirtualDomElements.Div, { className: 'HeapSnapshotMemoryType' }, [label, bar])
}

const renderMemoryByType = (memoryByType: readonly HeapSnapshotMemoryType[], summary: HeapSnapshotSummary): TreeNode => {
  const heading = node(VirtualDomElements.Div, { className: 'HeapSnapshotSectionHeader' }, [
    node(VirtualDomElements.H2, { className: 'HeapSnapshotSectionTitle' }, [textNode('Memory by type')]),
    span('HeapSnapshotSectionTotal', `${formatBytes(summary.totalShallowSize)} shallow`),
  ])
  const list = node(
    VirtualDomElements.Div,
    { className: 'HeapSnapshotMemoryList' },
    memoryByType.map((memoryType) => renderMemoryType(memoryType, summary.totalShallowSize)),
  )
  return node(VirtualDomElements.Section, { ariaLabel: 'Memory by type', className: 'HeapSnapshotMemorySection' }, [
    heading,
    list,
  ])
}

const renderTiming = (timing: Readonly<HeapSnapshotViewState['timings'][number]>): TreeNode => {
  return node(VirtualDomElements.Li, { className: 'HeapSnapshotTiming' }, [
    span('HeapSnapshotTimingName', timing.name),
    span('HeapSnapshotTimingValue', `${timing.time.toFixed(2)} ms`),
  ])
}

const renderTimings = (timings: HeapSnapshotViewState['timings']): TreeNode => {
  const heading = node(VirtualDomElements.H2, { className: 'HeapSnapshotSectionTitle' }, [textNode('Processing timings')])
  const list = node(VirtualDomElements.Ul, { className: 'HeapSnapshotTimings' }, timings.map(renderTiming))
  return node(VirtualDomElements.Section, { className: 'HeapSnapshotTimingsSection' }, [heading, list])
}

export const render = (state: Readonly<HeapSnapshotViewState>): readonly VirtualDomNode[] => {
  const children = [
    renderFilter(state.filterValue, state.summary),
    renderMemoryByType(state.memoryByType, state.summary),
    ...(state.showTimings ? [renderTimings(state.timings)] : []),
    renderTable(state.aggregates, state.expandedNames, state.summary),
  ]
  const root = node(VirtualDomElements.Div, { className: 'HeapSnapshotView' }, children)
  return flatten(root)
}

export const renderError = (message: string): readonly VirtualDomNode[] => {
  const title = node(VirtualDomElements.H2, { className: 'HeapSnapshotErrorTitle' }, [textNode('Unable to open heap snapshot')])
  const detail = node(VirtualDomElements.P, { className: 'HeapSnapshotErrorMessage' }, [textNode(message)])
  const root = node(VirtualDomElements.Div, { className: 'HeapSnapshotView HeapSnapshotViewError', role: 'alert' }, [
    title,
    detail,
  ])
  return flatten(root)
}
