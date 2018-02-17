import { spy } from 'simple-spy'
import { guardImp, assertRequiredConfigImp } from './guard'

jest.useFakeTimers()

const loggerInstallSpy = spy(() => null)
const loggerCaptureExceptionSpy = spy(() => null)

class Logger {
  constructor(public dns, public pro) {}
  install = loggerInstallSpy
  captureException = loggerCaptureExceptionSpy
}

const envVars = {
  EH_RAVEN_DSN: 'DNS',
  EH_RAVEN_PROJECT: 'PRO'
}

const context = {
  functionName: 'test',
  getRemainingTimeInMillis: spy(() => 10000)
}

const callback = (error, result) => {
  if (error) {
    throw error
  }
}

beforeEach(() => {
  context.getRemainingTimeInMillis.reset()
  loggerInstallSpy.reset()
  loggerCaptureExceptionSpy.reset()
})

test('Set up logger', async () => {
  // Arrange
  const guard = guardImp(Logger, envVars)
  const fun = (event, logger, context) => {}
  const awsFun = guard(fun)

  // Act
  await awsFun(null, context as any, callback)

  // Assert
  expect(loggerInstallSpy.callCount).toBe(1)
  expect(loggerInstallSpy.args[0][0]).toBe(context)
})

test('Pass args to lambda', async () => {
  // Arrange
  const guard = guardImp(Logger, envVars)
  const mockEvenet = { id: 1 }
  const fun = (event, logger, cnx) => {
    expect(event).toBe(mockEvenet)
    expect(typeof logger.install).toBe('function')
    expect(cnx).toBe(context)
  }
  const awsFun = guard(fun)

  // Act
  await awsFun(mockEvenet, context as any, callback)
})

test('Pass the result to the callback', async () => {
  // Arrange
  const guard = guardImp(Logger, envVars)
  const mockEvenet = { id: 1 }
  const myResult = { id: 1 }
  const myCallback = (error, result) => {
    expect(result).toBe(myResult)
  }
  const fun = (event, logger, cnx) => {
    return myResult
  }
  const awsFun = guard(fun)

  // Act
  await awsFun(mockEvenet, context as any, myCallback)
})

test('Capture exception on failure', async () => {
  // Arrange
  const guard = guardImp(Logger, envVars)
  const mockEvenet = { id: 1 }
  const myError = new Error('Random error')
  const myCallback = (error, result) => {
    expect(error).toBe(myError)
    expect(result).toBe(undefined)
  }
  const fun = (event, logger, cnx) => {
    throw myError
  }
  const awsFun = guard(fun)

  // Act
  await awsFun(mockEvenet, context as any, myCallback)
  expect(loggerCaptureExceptionSpy.callCount).toBe(1)
  expect(loggerCaptureExceptionSpy.args[0][0]).toBe(myError)
})

test('Capture a timeout error before timeout', async () => {
  // Arrange
  ;(setTimeout as any).mockClear()
  const timeoutTime = 10000
  const myContext = {
    functionName: 'test',
    getRemainingTimeInMillis: spy(() => timeoutTime)
  }
  const guard = guardImp(Logger, envVars)
  const fun = (event, logger, cnx) => {
    return new Promise(resolve => {
      setTimeout(resolve, timeoutTime + 1)
    })
  }
  const awsFun = guard(fun)

  // Act
  const waitForFun = awsFun(null, myContext as any, callback)

  // Assert
  expect((setTimeout as any).mock.calls.length).toBe(2)
  expect((setTimeout as any).mock.calls[0][1]).toBe(timeoutTime - 500)
  expect(loggerCaptureExceptionSpy.callCount).toBe(0)

  jest.runTimersToTime(9500)

  expect(loggerCaptureExceptionSpy.callCount).toBe(1)
  expect(loggerCaptureExceptionSpy.args[0][0].message.includes('Timeout')).toBe(true)
})

test('Throw error for missing env vars', () => {
  // Arrange
  const envVars = {
    key1: 'key1'
  }

  // Arange
  expect(() => assertRequiredConfigImp(envVars)('key1', 'key2')).toThrow()
})

test('Do not throw error if all env exist', () => {
  // Arrange
  const envVars = {
    key1: 'key1',
    key2: 'key2'
  }

  // Arange
  expect(assertRequiredConfigImp(envVars)('key1', 'key2')).toBeUndefined()
})
