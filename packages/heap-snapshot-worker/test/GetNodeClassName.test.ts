import { expect, test } from '@jest/globals'
import * as GetNodeClassName from '../src/parts/GetNodeClassName/GetNodeClassName.js'
import type { Node } from '../src/parts/Node/Node.ts'

test('hidden node', () => {
  const node: Node = {
    type: 'hidden',
    name: '',
    size: 0,
    id: 0,
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('(system)')
})

test('compiled code node', () => {
  const node: Node = {
    type: 'code',
    name: '',
    size: 0,
    id: 0,
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('(compiled code)')
})

test('regexp node', () => {
  const node = {
    type: 'regexp',
    name: '',

    size: 0,
    id: 0,
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('RegExp')
})

test('closure node', () => {
  const node = {
    type: 'closure',
    name: '',

    size: 0,
    id: 0,
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('Function')
})

test('string node', () => {
  const node = {
    type: 'string',
    name: '',

    size: 0,
    id: 0,
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('(string)')
})

test('object node', () => {
  const node = {
    type: 'object',
    size: 0,
    id: 0,
    name: 'test',
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('test')
})

test('native node', () => {
  const node = {
    type: 'native',
    id: 0,
    name: 'test',
    size: 0,
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('test')
})

test('custom node', () => {
  const node = {
    type: 'other',
    size: 0,
    id: 0,
    name: 'test',
  }
  expect(GetNodeClassName.getNodeClassName(node)).toBe('(other)')
})
