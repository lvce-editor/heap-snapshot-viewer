import { expect, test } from '@jest/globals'
import * as GetAggregatesByClassName from '../src/parts/GetAggregatesByClassName/GetAggregatesByClassName.js'

test('exclude zero size node', () => {
  const parsed = {
    parsedNodes: [
      {
        type: 'other',
        size: 0,
      },
    ],
  }
  expect(GetAggregatesByClassName.getAggregratesByClassName(parsed)).toEqual([])
})

test('regexp node', () => {
  const parsed = {
    parsedNodes: [{ type: 'regexp', size: 1, name: '' }],
  }
  expect(GetAggregatesByClassName.getAggregratesByClassName(parsed)).toEqual([
    {
      name: 'RegExp',
      count: 1,
    },
  ])
})
