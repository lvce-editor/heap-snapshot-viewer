import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { getPreference, readFile, type ViewContext, type ViewEvent, type VirtualDomViewInstance } from '@lvce-editor/api'
import * as CreateHeapSnapshot from '../CreateHeapSnapshot/CreateHeapSnapshot.ts'
import * as DisposeHeapSnapshot from '../DisposeHeapSnapshot/DisposeHeapSnapshot.ts'
import * as FilterAggregates from '../FilterAggregates/FilterAggregates.ts'
import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as GetSnapshotSummary from '../GetSnapshotSummary/GetSnapshotSummary.ts'
import * as GetStatistics from '../GetStatistics/GetStatistics.ts'
import { HeapSnapshotValidationError } from '../HeapSnapshotValidationError/HeapSnapshotValidationError.ts'
import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'
import * as PreparseHeapSnapshot from '../PreparseHeapSnapshot/PreparseHeapSnapshot.ts'
import { render, renderError } from '../RenderHeapSnapshot/RenderHeapSnapshot.ts'

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

export interface HeapSnapshotViewState {
  readonly aggregates: readonly HeapSnapshotAggregate[]
  readonly expandedNames: readonly string[]
  readonly filterValue: string
  readonly memoryByType: readonly HeapSnapshotMemoryType[]
  readonly showTimings: boolean
  readonly summary: HeapSnapshotSummary
  readonly timings: readonly HeapSnapshotTiming[]
}

interface HeapSnapshotViewContext extends ViewContext {
  readonly uri?: string
}

interface HeapSnapshotSavedState {
  readonly filterValue?: unknown
  readonly uri?: unknown
}

export interface HeapSnapshotViewInstance extends VirtualDomViewInstance {
  readonly render: () => readonly VirtualDomNode[]
  readonly saveState: () => HeapSnapshotSavedState
}

export interface HeapSnapshotViewDependencies {
  readonly getPreference: (key: string) => Promise<unknown>
  readonly now: () => number
  readonly readFile: (uri: string) => Promise<string>
}

const defaultDependencies: HeapSnapshotViewDependencies = {
  getPreference,
  now: (): number => performance.now(),
  readFile,
}

const ShowTimingsSetting = 'heapSnapshotViewer.showTimings'
const ToggleAggregatePrefix = 'toggle-aggregate:'

const getSavedState = (context: HeapSnapshotViewContext | undefined): HeapSnapshotSavedState => {
  if (!context?.state || typeof context.state !== 'object') {
    return {}
  }
  return context.state
}

const getUri = (context: HeapSnapshotViewContext | undefined, savedState: HeapSnapshotSavedState): string => {
  if (typeof context?.uri === 'string') {
    return context.uri
  }
  return typeof savedState.uri === 'string' ? savedState.uri : ''
}

const getFilterValue = (savedState: HeapSnapshotSavedState): string => {
  return typeof savedState.filterValue === 'string' ? savedState.filterValue : ''
}

const measure = async <T>(
  name: string,
  operation: () => T | Promise<T>,
  now: () => number,
  timings: HeapSnapshotTiming[],
): Promise<T> => {
  const start = now()
  const result = await operation()
  timings.push({
    name,
    time: now() - start,
  })
  return result
}

const createErrorInstance = (id: number, uri: string, error: unknown): HeapSnapshotViewInstance => {
  const message =
    error instanceof HeapSnapshotValidationError
      ? error.message
      : 'The heap snapshot could not be processed because its data is inconsistent.'
  return {
    dispose(): void {
      DisposeHeapSnapshot.disposeHeapSnapshot(id)
    },
    render(): readonly VirtualDomNode[] {
      return renderError(message)
    },
    saveState(): HeapSnapshotSavedState {
      return { uri }
    },
  }
}

export const createInstanceWithDependencies = async (
  context: HeapSnapshotViewContext | undefined,
  dependencies: HeapSnapshotViewDependencies,
): Promise<HeapSnapshotViewInstance> => {
  const savedState = getSavedState(context)
  const uri = getUri(context, savedState)
  const id = context?.uid ?? 0
  const timings: HeapSnapshotTiming[] = []
  const showTimings = (await dependencies.getPreference(ShowTimingsSetting)) === true

  try {
    const content = await measure('read-file', () => dependencies.readFile(uri), dependencies.now, timings)
    await measure('create', () => CreateHeapSnapshot.createHeapSnapshot(id, content), dependencies.now, timings)
    await measure('pre-parse', () => PreparseHeapSnapshot.preparseHeapSnapshot(id), dependencies.now, timings)
    const statistics = await measure('statistics', () => GetStatistics.getStatistics(id), dependencies.now, timings)
    const snapshotSummary = GetSnapshotSummary.getSnapshotSummary(id)
    await measure('parse', () => ParseHeapSnapshot.parseHeapSnapshot(id), dependencies.now, timings)
    const aggregates = await measure(
      'aggregates',
      () => GetAggregatesByClassName.getAggregratesByClassName(id),
      dependencies.now,
      timings,
    )
    let state: HeapSnapshotViewState = {
      aggregates,
      expandedNames: [],
      filterValue: getFilterValue(savedState),
      memoryByType: statistics.memoryByType,
      showTimings,
      summary: {
        ...snapshotSummary,
        totalShallowSize: statistics.totalShallowSize,
      },
      timings,
    }

    return {
      dispose(): void {
        DisposeHeapSnapshot.disposeHeapSnapshot(id)
      },
      handleEvent(event: Readonly<ViewEvent>): void {
        if (event.type === 'click' && event.name?.startsWith(ToggleAggregatePrefix)) {
          const aggregateName = event.name.slice(ToggleAggregatePrefix.length)
          const expandedNames = state.expandedNames.includes(aggregateName)
            ? state.expandedNames.filter((name) => name !== aggregateName)
            : [...state.expandedNames, aggregateName]
          state = {
            ...state,
            expandedNames,
          }
          return
        }
        if (event.type !== 'input' || event.name !== 'filter') {
          return
        }
        const filterValue = typeof event.value === 'string' ? event.value : ''
        state = {
          ...state,
          filterValue,
        }
      },
      render(): readonly VirtualDomNode[] {
        return render({
          ...state,
          aggregates: FilterAggregates.filterAggregates([...state.aggregates], state.filterValue),
        })
      },
      saveState(): HeapSnapshotSavedState {
        return {
          filterValue: state.filterValue,
          uri,
        }
      },
    }
  } catch (error) {
    DisposeHeapSnapshot.disposeHeapSnapshot(id)
    return createErrorInstance(id, uri, error)
  }
}

export const createInstance = (context?: ViewContext): Promise<HeapSnapshotViewInstance> => {
  return createInstanceWithDependencies(context, defaultDependencies)
}
