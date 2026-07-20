import { expect, test } from '@jest/globals'
import { view, viewId } from '../src/parts/HeapSnapshotView/HeapSnapshotView.ts'

test('contributes an isolated virtual dom preview', () => {
  expect(view.id).toBe(viewId)
  expect(view.kind).toBe('virtualDom')
  expect(view.create).toBeDefined()
})
