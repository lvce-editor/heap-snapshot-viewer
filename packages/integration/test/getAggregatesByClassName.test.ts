import { test, expect } from '@jest/globals'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { testWorker } from '../src/testWorker.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

const findClassCount = (aggregates: any, className: string) => {
  for (const item of aggregates) {
    if (item.name === className) {
      return item.count
    }
  }
  return 0
}

test('getAggregatesByClassName', async () => {
  const execMap = {}
  const worker = await testWorker({
    execMap,
  })
  const heapSnapshotPath = join(__dirname, '..', 'fixtures', 'syntax.heapsnapshot')
  const heapSnapshotId = 1
  const heapSnapshotContent = await readFile(heapSnapshotPath, 'utf8')
  await worker.execute('HeapSnapshot.create', heapSnapshotId, heapSnapshotContent)
  await worker.execute('HeapSnapshot.preparse', heapSnapshotId)
  await worker.execute('HeapSnapshot.parse', heapSnapshotId)
  const aggregates = await worker.execute('HeapSnapshot.getAggregatesByClassName', heapSnapshotId)
  const regexCount = findClassCount(aggregates, 'RegExp')
  const systemCount = findClassCount(aggregates, '(system)')
  const compiledCodeCount = findClassCount(aggregates, '(compiled code)')
  const functionCount = findClassCount(aggregates, 'Function')
  const stringCount = findClassCount(aggregates, '(string)')
  const objectShapeCount = findClassCount(aggregates, '(object shape)')
  const arrayCount = findClassCount(aggregates, '(array)')
  const objectCount = findClassCount(aggregates, 'Object')
  const errorCount = findClassCount(aggregates, 'Error')
  const eventTargetCount = findClassCount(aggregates, 'EventTarget')
  const messagePortCount = findClassCount(aggregates, 'MessagePort')
  const generatorCount = findClassCount(aggregates, 'Generator')
  const promiseCount = findClassCount(aggregates, 'Promise')
  const typedArrayCount = findClassCount(aggregates, 'TypedArray')
  const heapNumberCount = findClassCount(aggregates, 'heap number')
  const numberCount = findClassCount(aggregates, '(number)')
  const vErrorCount = findClassCount(aggregates, 'VError')
  const webAssemblyModuleCount = findClassCount(aggregates, 'WebAssembly.Module')
  const pendingActivitiesCount = findClassCount(aggregates, 'Pending activities')
  const symbolCount = findClassCount(aggregates, '(symbol)')

  // const arrayNodes = parsed.parsedNodes.filter((node) => node.type === 'array')
  // for testing, compare how these numbers are displayed
  // in the chrome devtools heapsnapshot viewer
  expect(regexCount).toBe(39)
  expect(systemCount).toBe(3677) // TODO
  expect(compiledCodeCount).toBe(4098)
  expect(functionCount).toBe(1620)
  expect(stringCount).toBe(3519)
  expect(objectShapeCount).toBe(1379)
  expect(arrayCount).toBe(35)
  expect(objectCount).toBe(77)
  expect(errorCount).toBe(24)
  expect(eventTargetCount).toBe(5)
  expect(messagePortCount).toBe(5)
  expect(generatorCount).toBe(6)
  expect(promiseCount).toBe(4)
  expect(typedArrayCount).toBe(22)
  expect(vErrorCount).toBe(1)
  expect(webAssemblyModuleCount).toBe(2)
  expect(pendingActivitiesCount).toBe(1)
  expect(symbolCount).toBe(15)
  expect(numberCount).toBe(25)
})
