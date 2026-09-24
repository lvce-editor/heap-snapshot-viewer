import type { Aggregate } from '../GetAggregatesByClassNameInternal/GetAggregatesByClassNameInternal.ts'
import type { MemoryByType } from '../GetStatisticsInternal/GetStatisticsInternal.ts'
import * as DisposeHeapSnapshot from '../DisposeHeapSnapshot/DisposeHeapSnapshot.ts'
import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as GetSnapshotSummary from '../GetSnapshotSummary/GetSnapshotSummary.ts'
import * as GetStatistics from '../GetStatistics/GetStatistics.ts'
import * as GetTime from '../GetTime/GetTime.ts'
import * as HeapSnapshotState from '../HeapSnapshotState/HeapSnapshotState.ts'
import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'

export interface ParsedHeapSnapshotData {
  readonly edgeFields: readonly string[]
  readonly edges: Uint32Array
  readonly edgeTypes: readonly string[]
  readonly nodeFields: readonly string[]
  readonly nodes: Uint32Array
  readonly nodeTypes: readonly string[]
  readonly rootNodeIndex: number
  readonly snapshotSize: number
  readonly strings: readonly string[]
}

export interface HeapSnapshotTiming {
  readonly name: string
  readonly time: number
}

export interface AnalyzedHeapSnapshot {
  readonly aggregates: readonly Aggregate[]
  readonly memoryByType: readonly MemoryByType[]
  readonly summary: {
    readonly edgeCount: number
    readonly nodeCount: number
    readonly snapshotSize: number
    readonly totalShallowSize: number
  }
  readonly timings: readonly HeapSnapshotTiming[]
}

interface AnalyzeHeapSnapshotDependencies {
  readonly id: number
  readonly now: () => number
}

const state = { nextHeapSnapshotId: 0 }

const measure = <T>(name: string, operation: () => T, now: () => number, timings: HeapSnapshotTiming[]): T => {
  const start = now()
  const result = operation()
  timings.push({ name, time: now() - start })
  return result
}

export const analyzeHeapSnapshotWithDependencies = (
  parsed: ParsedHeapSnapshotData,
  dependencies: AnalyzeHeapSnapshotDependencies,
): AnalyzedHeapSnapshot => {
  const { id } = dependencies
  const timings: HeapSnapshotTiming[] = []
  HeapSnapshotState.add(id, parsed)
  try {
    measure('parse', () => ParseHeapSnapshot.parseHeapSnapshot(id), dependencies.now, timings)
    const statistics = measure('statistics', () => GetStatistics.getStatistics(id), dependencies.now, timings)
    const snapshotSummary = GetSnapshotSummary.getSnapshotSummary(id)
    const aggregates = measure(
      'aggregates',
      () => GetAggregatesByClassName.getAggregratesByClassName(id),
      dependencies.now,
      timings,
    )
    return {
      aggregates,
      memoryByType: statistics.memoryByType,
      summary: { ...snapshotSummary, totalShallowSize: statistics.totalShallowSize },
      timings,
    }
  } finally {
    DisposeHeapSnapshot.disposeHeapSnapshot(id)
  }
}

export const analyzeHeapSnapshot = (parsed: ParsedHeapSnapshotData): AnalyzedHeapSnapshot => {
  return analyzeHeapSnapshotWithDependencies(parsed, {
    id: state.nextHeapSnapshotId++,
    now: GetTime.getTime,
  })
}
