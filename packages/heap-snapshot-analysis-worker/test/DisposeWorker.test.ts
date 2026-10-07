import { expect, jest, test } from '@jest/globals'
import { dispose } from '../src/parts/DisposeWorker/DisposeWorker.ts'

test('closes the worker after the shutdown response can be sent', () => {
  jest.useFakeTimers()
  const close = jest.fn()

  dispose(close)

  expect(close).not.toHaveBeenCalled()
  jest.runOnlyPendingTimers()
  expect(close).toHaveBeenCalledTimes(1)
  jest.useRealTimers()
})
