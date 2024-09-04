import { expect, test } from '@jest/globals'
import * as AddAccurateSizes from '../src/parts/AddAccurateSizes/AddAccurateSizes.ts'
import type { Node } from '../src/parts/Node/Node.ts'
import * as NodeType from '../src/parts/NodeType/NodeType.ts'
import type { Graph } from '../src/parts/Graph/Graph.ts'

test.only('add size to array owner', () => {
  // @ts-ignore
  const nodes: readonly Node[] = [
    {
      type: NodeType.Object,
      id: 1,
      name: '',
      size: 1,
    },
    {
      type: NodeType.Array,
      id: 2,
      name: '',
      size: 2,
    },
  ]
  const graph: Graph = {
    1: [
      {
        type: 'edge',
        nodeIndex: 1,
      },
    ],
  }
  AddAccurateSizes.addAccurateSizes(graph, nodes)
  expect(nodes[0].size).toBe(3)
  expect(nodes[1].size).toBe(0)
})
