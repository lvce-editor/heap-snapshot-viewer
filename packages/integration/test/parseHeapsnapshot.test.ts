import { test, expect } from '@jest/globals'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { testWorker } from '../src/testWorker.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('parseHeapSnapshot', async () => {
  const execMap = {}
  const worker = await testWorker({
    execMap,
  })
  const heapsnapshotPath = join(__dirname, '..', 'fixtures', 'syntax.heapsnapshot')
  const heapSnapshotContent = await readFile(heapsnapshotPath, 'utf8')
  const parsed = await worker.execute('Heapsnapshot.parse', heapSnapshotContent)
  expect(parsed.parsedNodes).toBeDefined()
  expect(parsed.parsedNodes[0]).toEqual({ id: 1, name: '', type: 'synthetic' })
})
