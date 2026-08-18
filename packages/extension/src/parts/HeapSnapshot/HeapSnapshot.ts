export interface HeapSnapshotAggregate {
  readonly count: number
  readonly name: string
  readonly retainedSize: number
  readonly shallowSize: number
  readonly type: string
}

export interface HeapSnapshotMemoryType {
  readonly name: string
  readonly size: number
}

export interface HeapSnapshotSummary {
  readonly edgeCount: number
  readonly nodeCount: number
  readonly snapshotSize: number
  readonly totalShallowSize: number
}

export interface HeapSnapshotTiming {
  readonly name: string
  readonly time: number
}

export interface ParsedHeapSnapshot {
  readonly aggregates: readonly HeapSnapshotAggregate[]
  readonly memoryByType: readonly HeapSnapshotMemoryType[]
  readonly summary: HeapSnapshotSummary
  readonly timings: readonly HeapSnapshotTiming[]
}
