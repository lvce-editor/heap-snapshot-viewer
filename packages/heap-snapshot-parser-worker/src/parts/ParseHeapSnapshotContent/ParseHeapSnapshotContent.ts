import type { Aggregate } from '../GetAggregatesByClassNameInternal/GetAggregatesByClassNameInternal.ts'
import type { MemoryByType } from '../GetStatisticsInternal/GetStatisticsInternal.ts'
import * as CreateHeapSnapshot from '../CreateHeapSnapshot/CreateHeapSnapshot.ts'
import * as DisposeHeapSnapshot from '../DisposeHeapSnapshot/DisposeHeapSnapshot.ts'
import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as GetSnapshotSummary from '../GetSnapshotSummary/GetSnapshotSummary.ts'
import * as GetStatistics from '../GetStatistics/GetStatistics.ts'
import * as GetTime from '../GetTime/GetTime.ts'
import { HeapSnapshotValidationError } from '../HeapSnapshotValidationError/HeapSnapshotValidationError.ts'
import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'
import * as PreparseHeapSnapshot from '../PreparseHeapSnapshot/PreparseHeapSnapshot.ts'

export interface HeapSnapshotTiming {
  readonly name: string
  readonly time: number
}

export interface ParsedHeapSnapshot {
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

export type ParseHeapSnapshotResult =
  | {
      readonly type: 'success'
      readonly value: ParsedHeapSnapshot
    }
  | {
      readonly message: string
      readonly type: 'validation-error'
    }

interface ParseHeapSnapshotContentDependencies {
  readonly id: number
  readonly now: () => number
}

const state = {
  nextHeapSnapshotId: 0,
}

const measure = <T>(name: string, operation: () => T, now: () => number, timings: HeapSnapshotTiming[]): T => {
  const start = now()
  const result = operation()
  timings.push({
    name,
    time: now() - start,
  })
  return result
}

export const parseHeapSnapshotContentWithDependencies = (
  content: string,
  dependencies: ParseHeapSnapshotContentDependencies,
): ParsedHeapSnapshot => {
  const { id } = dependencies
  const timings: HeapSnapshotTiming[] = []
  try {
    measure('create', () => CreateHeapSnapshot.createHeapSnapshot(id, content), dependencies.now, timings)
    measure('pre-parse', () => PreparseHeapSnapshot.preparseHeapSnapshot(id), dependencies.now, timings)
    const statistics = measure('statistics', () => GetStatistics.getStatistics(id), dependencies.now, timings)
    const snapshotSummary = GetSnapshotSummary.getSnapshotSummary(id)
    measure('parse', () => ParseHeapSnapshot.parseHeapSnapshot(id), dependencies.now, timings)
    const aggregates = measure(
      'aggregates',
      () => GetAggregatesByClassName.getAggregratesByClassName(id),
      dependencies.now,
      timings,
    )
    return {
      aggregates,
      memoryByType: statistics.memoryByType,
      summary: {
        ...snapshotSummary,
        totalShallowSize: statistics.totalShallowSize,
      },
      timings,
    }
  } finally {
    DisposeHeapSnapshot.disposeHeapSnapshot(id)
  }
}

export const parseHeapSnapshotContent = (content: string): ParsedHeapSnapshot => {
  const id = state.nextHeapSnapshotId++
  return parseHeapSnapshotContentWithDependencies(content, {
    id,
    now: GetTime.getTime,
  })
}

export const parseHeapSnapshotRequest = (content: string): ParseHeapSnapshotResult => {
  try {
    return {
      type: 'success',
      value: parseHeapSnapshotContent(content),
    }
  } catch (error) {
    if (error instanceof HeapSnapshotValidationError) {
      return {
        message: error.message,
        type: 'validation-error',
      }
    }
    throw error
  }
}
