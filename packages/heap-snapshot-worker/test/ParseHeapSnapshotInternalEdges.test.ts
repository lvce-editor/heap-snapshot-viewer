import { expect, test } from '@jest/globals'
import * as ParseHeapSnapshotInternalEdges from '../src/parts/ParseHeapSnapshotInternalEdges/ParseHeapSnapshotInternalEdges.js'

test('parseHeapSnapshotInternalEdges', () => {
  const nodes = new Uint32Array(
    [
      [0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0],
    ].flat(1),
  )
  const edgeCountOffset = 3
  const nodeFieldCount = 7
  const edgeFieldCount = 3
  expect(
    ParseHeapSnapshotInternalEdges.parseHeapSnapshotInternalEdges(nodes, edgeCountOffset, nodeFieldCount, edgeFieldCount),
  ).toEqual(new Uint32Array([0, 6]))
})
