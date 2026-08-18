import { expect, test } from '@jest/globals'
import * as GetNodeClassName from '../src/parts/GetNodeClassName/GetNodeClassName.js'

test('hidden node', () => {
  const nodeType = 'hidden'
  const nodeName = ''
  expect(GetNodeClassName.getNodeClassName(nodeType, nodeName)).toBe('(system)')
})

test('compiled code node', () => {
  const nodeType = 'code'
  const nodeName = ''
  expect(GetNodeClassName.getNodeClassName(nodeType, nodeName)).toBe('(compiled code)')
})

test('regexp node', () => {
  const nodeType = 'regexp'
  const nodeName = ''
  expect(GetNodeClassName.getNodeClassName(nodeType, nodeName)).toBe('RegExp')
})

test('closure node', () => {
  const nodeType = 'closure'
  const nodeName = ''
  expect(GetNodeClassName.getNodeClassName(nodeType, nodeName)).toBe('Function')
})

test('string node', () => {
  const nodeType = 'string'
  const nodeName = 'string'
  expect(GetNodeClassName.getNodeClassName(nodeType, nodeName)).toBe('(string)')
})

test('object node', () => {
  const nodeType = 'object'
  const nodeName = 'test'
  expect(GetNodeClassName.getNodeClassName(nodeType, nodeName)).toBe('test')
})

test('native node', () => {
  const nodeType = 'native'
  const nodeName = 'test'
  expect(GetNodeClassName.getNodeClassName(nodeType, nodeName)).toBe('test')
})

test('custom node', () => {
  const nodeType = 'other'
  const nodeName = 'test'
  expect(GetNodeClassName.getNodeClassName(nodeType, nodeName)).toBe('(other)')
})
