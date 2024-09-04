import { expect, test } from '@jest/globals'
import * as GetNodeClassName from '../src/parts/GetNodeClassName/GetNodeClassName.js'
import * as NodeType from '../src/parts/NodeType/NodeType.js'

test.skip('add size to array', () => {
  // @ts-ignore
  const node1 = {
    type: NodeType.Array,
    id: 1,
  }
  // @ts-ignore
  const graph = {
    1: [],
  }
  const node = {
    type: 'hidden',
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('(system)')
})
