import { expect, test } from '@jest/globals'
import * as GetNodeClassName from '../src/parts/GetNodeClassName/GetNodeClassName.js'

test('hidden node', () => {
  const node = {
    type: 'hidden',
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('(system)')
})

test('compiled code node', () => {
  const node = {
    type: 'code',
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('(compiled code)')
})

test('regexp node', () => {
  const node = {
    type: 'regexp',
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('RegExp')
})

test('closure node', () => {
  const node = {
    type: 'closure',
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('Function')
})

test('string node', () => {
  const node = {
    type: 'string',
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('(string)')
})

test('custom node', () => {
  const node = {
    type: 'other',
    name: 'test',
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('test')
})
