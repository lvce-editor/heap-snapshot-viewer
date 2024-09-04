import { expect, test } from '@jest/globals'
import * as CamelCase from '../src/parts/CamelCase/CamelCase.js'

test('camelCase', () => {
  const value = 'to_node'
  expect(CamelCase.camelCase(value)).toBe('toNode')
})
