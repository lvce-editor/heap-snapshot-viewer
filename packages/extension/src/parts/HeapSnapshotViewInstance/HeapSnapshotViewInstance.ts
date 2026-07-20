import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { readFile, type ViewContext, type ViewEvent, type VirtualDomViewInstance } from '@lvce-editor/api'
import * as CreateHeapSnapshot from '../CreateHeapSnapshot/CreateHeapSnapshot.ts'
import * as DisposeHeapSnapshot from '../DisposeHeapSnapshot/DisposeHeapSnapshot.ts'
import * as FilterAggregates from '../FilterAggregates/FilterAggregates.ts'
import * as GetAggregatesByClassName from '../GetAggregatesByClassName/GetAggregatesByClassName.ts'
import * as ParseHeapSnapshot from '../ParseHeapSnapshot/ParseHeapSnapshot.ts'
import * as PreparseHeapSnapshot from '../PreparseHeapSnapshot/PreparseHeapSnapshot.ts'
import { render } from '../RenderHeapSnapshot/RenderHeapSnapshot.ts'

export interface HeapSnapshotAggregate {
  readonly count: number
  readonly name: string
}

export interface HeapSnapshotTiming {
  readonly name: string
  readonly time: number
}

export interface HeapSnapshotViewState {
  readonly aggregates: readonly HeapSnapshotAggregate[]
  readonly filterValue: string
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
  readonly now: () => number
  readonly readFile: (uri: string) => Promise<string>
}

const defaultDependencies: HeapSnapshotViewDependencies = {
  now: (): number => performance.now(),
  readFile,
}

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

export const createInstanceWithDependencies = async (
  context: HeapSnapshotViewContext | undefined,
  dependencies: HeapSnapshotViewDependencies,
): Promise<HeapSnapshotViewInstance> => {
  const savedState = getSavedState(context)
  const uri = getUri(context, savedState)
  const id = context?.uid ?? 0
  const timings: HeapSnapshotTiming[] = []
  const content = await measure('read-file', () => dependencies.readFile(uri), dependencies.now, timings)

  try {
    await measure('create', () => CreateHeapSnapshot.createHeapSnapshot(id, content), dependencies.now, timings)
    await measure('pre-parse', () => PreparseHeapSnapshot.preparseHeapSnapshot(id), dependencies.now, timings)
    await measure('parse', () => ParseHeapSnapshot.parseHeapSnapshot(id), dependencies.now, timings)
    const aggregates = await measure(
      'aggregates',
      () => GetAggregatesByClassName.getAggregratesByClassName(id),
      dependencies.now,
      timings,
    )
    let state: HeapSnapshotViewState = {
      aggregates,
      filterValue: getFilterValue(savedState),
      timings,
    }

    return {
      dispose(): void {
        DisposeHeapSnapshot.disposeHeapSnapshot(id)
      },
      handleEvent(event: Readonly<ViewEvent>): void {
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
    throw error
  }
}

export const createInstance = (context?: ViewContext): Promise<HeapSnapshotViewInstance> => {
  return createInstanceWithDependencies(context, defaultDependencies)
}
