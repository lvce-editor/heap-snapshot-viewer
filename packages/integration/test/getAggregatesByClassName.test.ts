import { test } from '@jest/globals'
import { testWorker } from '../src/testWorker.ts'

test.skip('getAggregetsByClassName', async () => {
  const execMap = {}
  const worker = await testWorker({
    execMap,
  })
  const offset = 10
  const textDocument = {
    uri: 'test://test.json',
    text: `{ "type":  }`,
  }
  const parsed = await worker.execute('Heapsnapshot.parse', textDocument, offset)
  console.log({ parsed })
})
