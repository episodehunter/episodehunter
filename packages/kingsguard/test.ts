import { spy } from 'simple-spy'
import { createGuard } from './guard'

jest.useFakeTimers()

const context = {
  functionName: 'test',
  getRemainingTimeInMillis: spy(() => 10000)
}

const callback = (error: any, result: any) => {
  if (error) {
    throw error
  }
}

beforeEach(() => {
  context.getRemainingTimeInMillis.reset()
})

test('Set up logger', async () => {
  // Arrange
  const setupLogger = spy(() => () => {})
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const fun = (event: any, logger: any, context: any) => {}
  const awsFun = guard(fun)

  // Act
  await awsFun(null, context as any, callback)

  // Assert
  expect(setupLogger.callCount).toBe(1)
  expect(setupLogger.args[0][0]).toBe('logdnaKey')
  expect(setupLogger.args[0][1]).toBe('dns')
})

test('Pass args to lambda', async () => {
  // Arrange
  expect.assertions(3)
  const setupLogger = spy(() => () => ({
    log: () => {},
    captureException: () => {}
  }))
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const mockEvenet = { id: 1 }
  const fun = (event: any, logger: any, cnx: any) => {
    expect(event).toBe(mockEvenet)
    expect(typeof logger.log).toBe('function')
    expect(cnx).toBe(context)
  }
  const awsFun = guard(fun)

  // Act
  await awsFun(mockEvenet, context as any, callback)
})

test('Pass the result to the callback', async () => {
  // Arrange
  expect.assertions(1)
  const setupLogger = spy(() => () => {
    log: () => {}
  })
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const mockEvenet = { id: 1 }
  const myResult = { id: 1 }
  const myCallback = (error: any, result: any) => {
    expect(result).toBe(myResult)
  }
  const fun = (event: any, logger: any, cnx: any) => {
    return myResult
  }
  const awsFun = guard(fun)

  // Act
  await awsFun(mockEvenet, context as any, myCallback)
})

test('Capture exception on failure', async () => {
  // Arrange
  expect.assertions(4)
  const captureException = spy(() => null)
  const setupLogger = () => () => ({
    captureException
  })
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const mockEvenet = { id: 1 }
  const myError = new Error('Random error')
  const myCallback = (error: any, result: any) => {
    expect(error).toBe(myError)
    expect(result).toBe(undefined)
  }
  const fun = (event: any, logger: any, cnx: any) => {
    throw myError
  }
  const awsFun = guard(fun)

  // Act
  await awsFun(mockEvenet, context as any, myCallback)
  expect(captureException.callCount).toBe(1)
  expect(captureException.args[0][0]).toBe(myError)
})

test('Capture a timeout error before timeout', async () => {
  // Arrange
  ;(setTimeout as any).mockClear()
  const timeoutTime = 10000
  const myContext = {
    functionName: 'test',
    getRemainingTimeInMillis: spy(() => timeoutTime)
  }
  const captureException = spy(() => null)
  const setupLogger = () => () => ({
    captureException
  })
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const fun = (event: any, logger: any, cnx: any) => {
    return new Promise(resolve => {
      setTimeout(resolve, timeoutTime + 1)
    })
  }
  const awsFun = guard(fun)

  // Act
  awsFun(null, myContext as any, callback)

  // Assert
  expect((setTimeout as any).mock.calls.length).toBe(2)
  expect((setTimeout as any).mock.calls[0][1]).toBe(timeoutTime - 500)
  expect(captureException.callCount).toBe(0)

  jest.runTimersToTime(9500)

  expect(captureException.callCount).toBe(1)
  expect(captureException.args[0][0].message.includes('Timeout')).toBe(true)
})

test('Extract request stack from header', async () => {
  // Arrange
  const createLogger = spy(() => {})
  const setupLogger = spy(() => createLogger)
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const fun = (event: any, logger: any, context: any) => {}
  const awsFun = guard(fun)
  const event = {
    headers: {
      'x-request-stack': 'id1,id2,id3'
    }
  }

  // Act
  await awsFun(event, context as any, callback)

  // Assert
  expect(createLogger.callCount).toBe(1)
  expect(createLogger.args[0][0]).toBe(context)
  expect(createLogger.args[0][1]).toEqual(['id1', 'id2', 'id3'])
})

test('Extract request stack from event', async () => {
  // Arrange
  const createLogger = spy(() => {})
  const setupLogger = spy(() => createLogger)
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const fun = (event: any, logger: any, context: any) => {}
  const awsFun = guard(fun)
  const event = {
    requestStack: ['id1', 'id2']
  }

  // Act
  await awsFun(event, context as any, callback)

  // Assert
  expect(createLogger.callCount).toBe(1)
  expect(createLogger.args[0][0]).toBe(context)
  expect(createLogger.args[0][1]).toEqual(event.requestStack)
})
