import { HeapSnapshotValidationError } from '../HeapSnapshotValidationError/HeapSnapshotValidationError.ts'

export interface ValidatedHeapSnapshot {
  readonly edgeFields: readonly string[]
  readonly edges: readonly number[]
  readonly edgeTypes: readonly string[]
  readonly nodeFields: readonly string[]
  readonly nodes: readonly number[]
  readonly nodeTypes: readonly string[]
  readonly rootNodeIndex: number
  readonly strings: readonly string[]
}

const MaximumUint32 = 0xff_ff_ff_ff

const fail = (message: string): never => {
  throw new HeapSnapshotValidationError(message)
}

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const getRecord = (value: unknown, path: string): Readonly<Record<string, unknown>> => {
  if (!isRecord(value)) {
    fail(`The heap snapshot is missing the required ${path} object.`)
  }
  return value as Readonly<Record<string, unknown>>
}

const getArray = (value: unknown, path: string): readonly unknown[] => {
  if (!Array.isArray(value)) {
    fail(`The heap snapshot is missing the required ${path} array.`)
  }
  return value as readonly unknown[]
}

const getStringArray = (value: unknown, path: string): readonly string[] => {
  const array = getArray(value, path)
  if (array.some((item) => typeof item !== 'string')) {
    fail(`Every value in ${path} must be a string.`)
  }
  return array as readonly string[]
}

const getUint32Array = (value: unknown, path: string): readonly number[] => {
  const array = getArray(value, path)
  if (array.some((item) => typeof item !== 'number' || !Number.isSafeInteger(item) || item < 0 || item > MaximumUint32)) {
    fail(`Every value in ${path} must be a non-negative 32-bit integer.`)
  }
  return array as readonly number[]
}

const requireFields = (fields: readonly string[], requiredFields: readonly string[], path: string): void => {
  for (const field of requiredFields) {
    if (!fields.includes(field)) {
      fail(`${path} is missing the required "${field}" field.`)
    }
  }
}

const validateNodeValues = (
  nodes: readonly number[],
  nodeFields: readonly string[],
  nodeTypes: readonly string[],
  strings: readonly string[],
): number => {
  const nodeFieldCount = nodeFields.length
  if (nodes.length === 0 || nodes.length % nodeFieldCount !== 0) {
    fail('The "nodes" array does not contain complete node records.')
  }
  const typeOffset = nodeFields.indexOf('type')
  const nameOffset = nodeFields.indexOf('name')
  const edgeCountOffset = nodeFields.indexOf('edge_count')
  let declaredEdgeCount = 0
  for (let nodeIndex = 0, nodeOrdinal = 0; nodeIndex < nodes.length; nodeIndex += nodeFieldCount, nodeOrdinal++) {
    if (nodes[nodeIndex + typeOffset] >= nodeTypes.length) {
      fail(`Node ${nodeOrdinal} refers to an unknown node type.`)
    }
    if (nodes[nodeIndex + nameOffset] >= strings.length) {
      fail(`Node ${nodeOrdinal} refers to a missing string.`)
    }
    declaredEdgeCount += nodes[nodeIndex + edgeCountOffset]
    if (!Number.isSafeInteger(declaredEdgeCount)) {
      fail('The node edge counts are too large to process safely.')
    }
  }
  return declaredEdgeCount
}

const validateEdgeValues = (
  edges: readonly number[],
  edgeFields: readonly string[],
  edgeTypes: readonly string[],
  nodeFieldCount: number,
  nodesLength: number,
): void => {
  const edgeFieldCount = edgeFields.length
  if (edges.length % edgeFieldCount !== 0) {
    fail('The "edges" array does not contain complete edge records.')
  }
  const typeOffset = edgeFields.indexOf('type')
  const toNodeOffset = edgeFields.indexOf('to_node')
  for (let edgeIndex = 0, edgeOrdinal = 0; edgeIndex < edges.length; edgeIndex += edgeFieldCount, edgeOrdinal++) {
    if (edges[edgeIndex + typeOffset] >= edgeTypes.length) {
      fail(`Edge ${edgeOrdinal} refers to an unknown edge type.`)
    }
    const toNode = edges[edgeIndex + toNodeOffset]
    if (toNode >= nodesLength || toNode % nodeFieldCount !== 0) {
      fail(`Edge ${edgeOrdinal} points to an invalid node index.`)
    }
  }
}

const getRootNodeIndex = (value: unknown, nodesLength: number, nodeFieldCount: number): number => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value >= nodesLength ||
    value % nodeFieldCount !== 0
  ) {
    throw new HeapSnapshotValidationError('The snapshot root index does not point to a valid node.')
  }
  return value
}

export const validateHeapSnapshot = (content: string): ValidatedHeapSnapshot => {
  if (content.trim() === '') {
    fail('The file is empty. Select a non-empty .heapsnapshot file and try again.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    fail('The file is not valid JSON. Check the file contents and try again.')
  }

  if (!isRecord(parsed)) {
    fail('Expected a JSON object with snapshot, nodes, edges, and strings.')
  }
  const heapSnapshot = parsed as Readonly<Record<string, unknown>>

  const snapshot = getRecord(heapSnapshot.snapshot, '"snapshot"')
  const meta = getRecord(snapshot.meta, '"snapshot.meta"')
  const nodeFields = getStringArray(meta.node_fields, '"snapshot.meta.node_fields"')
  const edgeFields = getStringArray(meta.edge_fields, '"snapshot.meta.edge_fields"')
  if (nodeFields.length === 0 || edgeFields.length === 0) {
    fail('The heap snapshot metadata must define node and edge fields.')
  }
  requireFields(nodeFields, ['type', 'name', 'self_size', 'edge_count'], '"snapshot.meta.node_fields"')
  requireFields(edgeFields, ['type', 'to_node'], '"snapshot.meta.edge_fields"')

  const nodeTypeLists = getArray(meta.node_types, '"snapshot.meta.node_types"')
  const edgeTypeLists = getArray(meta.edge_types, '"snapshot.meta.edge_types"')
  const nodeTypes = getStringArray(nodeTypeLists[0], '"snapshot.meta.node_types[0]"')
  const edgeTypes = getStringArray(edgeTypeLists[0], '"snapshot.meta.edge_types[0]"')
  if (nodeTypes.length === 0 || edgeTypes.length === 0) {
    fail('The heap snapshot metadata must define node and edge types.')
  }

  const strings = getStringArray(heapSnapshot.strings, '"strings"')
  const nodes = getUint32Array(heapSnapshot.nodes, '"nodes"')
  const edges = getUint32Array(heapSnapshot.edges, '"edges"')
  const declaredEdgeCount = validateNodeValues(nodes, nodeFields, nodeTypes, strings)
  validateEdgeValues(edges, edgeFields, edgeTypes, nodeFields.length, nodes.length)
  const actualEdgeCount = edges.length / edgeFields.length
  if (declaredEdgeCount !== actualEdgeCount) {
    const declaredEdgeLabel = declaredEdgeCount === 1 ? 'edge' : 'edges'
    fail(`The nodes declare ${declaredEdgeCount} ${declaredEdgeLabel}, but the snapshot contains ${actualEdgeCount}.`)
  }

  const rootNodeIndex = getRootNodeIndex(
    snapshot.root_index === undefined ? 0 : snapshot.root_index,
    nodes.length,
    nodeFields.length,
  )

  return {
    edgeFields,
    edges,
    edgeTypes,
    nodeFields,
    nodes,
    nodeTypes,
    rootNodeIndex,
    strings,
  }
}
