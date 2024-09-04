import { expect, test } from '@jest/globals'
import * as AddAccurateSizes from '../src/parts/AddAccurateSizes/AddAccurateSizes.ts'
import type { Node } from '../src/parts/Node/Node.ts'
import * as NodeType from '../src/parts/NodeType/NodeType.ts'

test.skip('add size to array', () => {
  // @ts-ignore
  const nodes: readonly Node[] = [
    {
      type: NodeType.Array,
      id: 1,
      name: '',
    },
  ]
  // @ts-ignore
  const graph = {
    1: [],
  }
  expect(AddAccurateSizes.addAccurateSizes(graph, nodes)).toBe('(system)')
})
