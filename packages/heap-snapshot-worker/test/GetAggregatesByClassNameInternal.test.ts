import { expect, test } from '@jest/globals'
import * as GetAggregatesByClassNameInternal from '../src/parts/GetAggregatesByClassNameInternal/GetAggregatesByClassNameInternal.js'

test('exclude zero size node', () => {
  const parsed = {
    parsedNodes: [
      {
        type: 'other',
        size: 0,
      },
    ],
  }
  expect(GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(parsed)).toEqual([])
})

test('regexp node', () => {
  const parsed = {
    parsedNodes: [{ type: 'regexp', size: 1, name: '' }],
  }
  expect(GetAggregatesByClassNameInternal.getAggregratesByClassNameInternal(parsed)).toEqual([
    {
      name: 'RegExp',
      count: 1,
    },
  ])
})
