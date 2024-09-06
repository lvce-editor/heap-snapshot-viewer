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
  const heapSnapshotPath = join(__dirname, '..', 'fixtures', 'syntax.heapsnapshot')
  const heapSnapshotContent = await readFile(heapSnapshotPath, 'utf8')
  const heapSnapshotId = 1
  await worker.execute('HeapSnapshot.create', heapSnapshotId, heapSnapshotContent)
  await worker.execute('HeapSnapshot.preparse', heapSnapshotId)
  await worker.execute('HeapSnapshot.parse', heapSnapshotId)
  await worker.execute('HeapSnapshot.get', heapSnapshotId)
  // TODO verify parsed edge index nodes
  // expect(parsed.parsedNodes).toBeDefined()
  // // for testing, compare how these numbers are displayed
  // // in the chrome devtools heapsnapshot viewer
  // expect(parsed.parsedNodes).toHaveLength(18108)
  // expect(parsed.parsedNodes[0]).toEqual({
  //   id: 1,
  //   name: '',
  //   type: 'synthetic',
  //   size: 0,
  // })
  // const edgeCount = getEdgeCount(parsed.graph)
  // expect(edgeCount).toBe(202000)
})
