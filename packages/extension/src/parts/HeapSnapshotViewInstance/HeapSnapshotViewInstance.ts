import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { getPreference, readFile, type ViewContext, type ViewEvent, type VirtualDomViewInstance } from '@lvce-editor/api'
import type {
  HeapSnapshotAggregate,
  HeapSnapshotMemoryType,
  HeapSnapshotSummary,
  HeapSnapshotTiming,
  ParsedHeapSnapshot,
} from '../HeapSnapshot/HeapSnapshot.ts'
import * as FilterAggregates from '../FilterAggregates/FilterAggregates.ts'
import { parseHeapSnapshot } from '../HeapSnapshotParserWorker/HeapSnapshotParserWorker.ts'
import { render } from '../RenderHeapSnapshot/RenderHeapSnapshot.ts'

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
  readonly parseHeapSnapshot: (content: string) => Promise<ParsedHeapSnapshot>
  readonly readFile: (uri: string) => Promise<string>
}

const defaultDependencies: HeapSnapshotViewDependencies = {
  getPreference,
  now: (): number => performance.now(),
  parseHeapSnapshot,
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

export const createInstanceWithDependencies = async (
  context: HeapSnapshotViewContext | undefined,
  dependencies: HeapSnapshotViewDependencies,
): Promise<HeapSnapshotViewInstance> => {
  const savedState = getSavedState(context)
  const uri = getUri(context, savedState)
  const timings: HeapSnapshotTiming[] = []
  const showTimings = (await dependencies.getPreference(ShowTimingsSetting)) === true
  const content = await measure('read-file', () => dependencies.readFile(uri), dependencies.now, timings)
  const parsed = await dependencies.parseHeapSnapshot(content)
  let state: HeapSnapshotViewState = {
    aggregates: parsed.aggregates,
    expandedNames: [],
    filterValue: getFilterValue(savedState),
    memoryByType: parsed.memoryByType,
    showTimings,
    summary: parsed.summary,
    timings: [...timings, ...parsed.timings],
  }

  return {
    dispose(): void {},
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
}

export const createInstance = (context?: ViewContext): Promise<HeapSnapshotViewInstance> => {
  return createInstanceWithDependencies(context, defaultDependencies)
}
