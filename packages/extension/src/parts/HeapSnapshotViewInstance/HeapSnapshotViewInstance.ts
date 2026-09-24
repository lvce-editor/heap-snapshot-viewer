import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import {
  getPreference,
  readFile,
  readFileAsBlob,
  type ViewContext,
  type ViewEvent,
  type VirtualDomViewInstance,
} from '@lvce-editor/api'
import type {
  HeapSnapshotAggregate,
  HeapSnapshotMemoryType,
  HeapSnapshotSummary,
  HeapSnapshotTiming,
  ParsedHeapSnapshot,
} from '../HeapSnapshot/HeapSnapshot.ts'
import * as FilterAggregates from '../FilterAggregates/FilterAggregates.ts'
import { parseHeapSnapshot } from '../HeapSnapshotParserWorker/HeapSnapshotParserWorker.ts'
import { render, renderError } from '../RenderHeapSnapshot/RenderHeapSnapshot.ts'

export interface HeapSnapshotViewState {
  readonly aggregatePage: number
  readonly aggregates: readonly HeapSnapshotAggregate[]
  readonly expandedNames: readonly string[]
  readonly filterValue: string
  readonly memoryByType: readonly HeapSnapshotMemoryType[]
  readonly showTimings: boolean
  readonly summary: HeapSnapshotSummary
  readonly timings: readonly HeapSnapshotTiming[]
  readonly view: 'constructors' | 'statistics'
}

export type HeapSnapshotComponentState = HeapSnapshotViewState | { readonly errorMessage: string }

interface HeapSnapshotViewContext extends ViewContext {
  readonly uri?: string
}

interface HeapSnapshotSavedState {
  readonly filterValue?: unknown
  readonly uri?: unknown
  readonly view?: unknown
}

export interface HeapSnapshotViewInstance extends VirtualDomViewInstance {
  readonly getComponentState: () => HeapSnapshotComponentState
  readonly render: () => readonly VirtualDomNode[]
  readonly saveState: () => HeapSnapshotSavedState
  readonly setComponentState: (state: HeapSnapshotComponentState) => void
}

export interface HeapSnapshotViewDependencies {
  readonly getPreference: (key: string) => Promise<unknown>
  readonly now: () => number
  readonly parseHeapSnapshot: (blob: Blob) => Promise<ParsedHeapSnapshot>
  readonly readFileAsBlob: (uri: string) => Promise<Blob>
}

const defaultDependencies: HeapSnapshotViewDependencies = {
  getPreference,
  now: (): number => performance.now(),
  parseHeapSnapshot,
  readFileAsBlob: async (uri: string): Promise<Blob> => {
    try {
      return await readFileAsBlob(uri)
    } catch {
      return new Blob([await readFile(uri)])
    }
  },
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

const getView = (savedState: HeapSnapshotSavedState): HeapSnapshotViewState['view'] => {
  return savedState.view === 'statistics' ? 'statistics' : 'constructors'
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

const createErrorInstance = (uri: string, error: unknown): HeapSnapshotViewInstance => {
  let message =
    error instanceof Error ? error.message : 'The heap snapshot could not be processed because its data is inconsistent.'
  return {
    dispose(): void {},
    getComponentState(): HeapSnapshotComponentState {
      return { errorMessage: message }
    },
    render(): readonly VirtualDomNode[] {
      return renderError(message)
    },
    saveState(): HeapSnapshotSavedState {
      return { uri }
    },
    setComponentState(state: HeapSnapshotComponentState): void {
      if (!('errorMessage' in state)) {
        throw new Error('Expected heap snapshot error state')
      }
      message = state.errorMessage
    },
  }
}

export const createInstanceWithDependencies = async (
  context: HeapSnapshotViewContext | undefined,
  dependencies: HeapSnapshotViewDependencies,
): Promise<HeapSnapshotViewInstance> => {
  const savedState = getSavedState(context)
  const uri = getUri(context, savedState)
  const timings: HeapSnapshotTiming[] = []
  const showTimings = (await dependencies.getPreference(ShowTimingsSetting)) === true

  try {
    const blob = await measure('read-file', () => dependencies.readFileAsBlob(uri), dependencies.now, timings)
    const parsed = await dependencies.parseHeapSnapshot(blob)
    let state: HeapSnapshotViewState = {
      aggregatePage: 0,
      aggregates: parsed.aggregates,
      expandedNames: [],
      filterValue: getFilterValue(savedState),
      memoryByType: parsed.memoryByType,
      showTimings,
      summary: parsed.summary,
      timings: [...timings, ...parsed.timings],
      view: getView(savedState),
    }

    return {
      dispose(): void {},
      getComponentState(): HeapSnapshotComponentState {
        return state
      },
      handleEvent(event: Readonly<ViewEvent>): void {
        if (event.type === 'click' && (event.name === 'view:constructors' || event.name === 'view:statistics')) {
          state = {
            ...state,
            view: event.name === 'view:statistics' ? 'statistics' : 'constructors',
          }
          return
        }
        if (event.type === 'click' && event.name === 'previous-page') {
          state = {
            ...state,
            aggregatePage: Math.max(0, state.aggregatePage - 1),
          }
          return
        }
        if (event.type === 'click' && event.name === 'next-page') {
          state = {
            ...state,
            aggregatePage: state.aggregatePage + 1,
          }
          return
        }
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
          aggregatePage: 0,
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
          view: state.view,
        }
      },
      setComponentState(newState: HeapSnapshotComponentState): void {
        if ('errorMessage' in newState) {
          throw new Error('Expected heap snapshot state')
        }
        state = newState
      },
    }
  } catch (error) {
    return createErrorInstance(uri, error)
  }
}

export const createInstance = (context?: ViewContext): Promise<HeapSnapshotViewInstance> => {
  return createInstanceWithDependencies(context, defaultDependencies)
}
