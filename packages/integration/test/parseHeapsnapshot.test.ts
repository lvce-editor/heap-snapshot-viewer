import { test, expect } from '@jest/globals'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { testWorker } from '../src/testWorker.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

const getEdgeCount = (graph) => {
  console.log(graph)
  let count = 0
  for (const [key, value] of Object.entries(graph)) {
    // @ts-ignore
    count += value.length
  }
  return count
}

test('parseHeapSnapshot', async () => {
  const execMap = {}
  const worker = await testWorker({
    execMap,
  })
  const heapsnapshotPath = join(__dirname, '..', 'fixtures', 'syntax.heapsnapshot')
  const heapSnapshotContent = await readFile(heapsnapshotPath, 'utf8')
  const parsed = await worker.execute('Heapsnapshot.parse', heapSnapshotContent)
  expect(parsed.parsedNodes).toBeDefined()
  // for testing, compare how these numbers are displayed
  // in the chrome devtools heapsnapshot viewer
  expect(parsed.parsedNodes).toHaveLength(18108)
  expect(parsed.parsedNodes[0]).toEqual({
    id: 1,
    name: '',
    type: 'synthetic',
    size: 0,
  })
  // const edgeCount = getEdgeCount(parsed.graph)
  // expect(edgeCount).toBe(202000)
})
