import { spy } from 'simple-spy'
import { createGuard } from '../guard'

jest.useFakeTimers()

const context = {
  functionName: 'test',
  getRemainingTimeInMillis: spy(() => 10000)
}

beforeEach(() => {
  context.getRemainingTimeInMillis.reset()
})

test('Set up logger', async () => {
  // Arrange
  const setupLogger = spy((logdnaKey: string, sentry: string) => () => ({ flush: () => {} }))
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const fun = (event: any, logger: any, context: any) => Promise.resolve(null)
  const awsFun = guard(fun)

  // Act
  await awsFun(null, context as any)

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
    captureException: () => {},
    flush: () => {}
  }))
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const mockEvenet = { id: 1 }
  const fun = (event: any, logger: any, cnx: any) => {
    expect(event).toBe(mockEvenet)
    expect(typeof logger.log).toBe('function')
    expect(cnx).toBe(context)
    return Promise.resolve(null)
  }
  const awsFun = guard(fun)

  // Act
  await awsFun(mockEvenet, context as any)
})

test('Pass the result to the callback', async () => {
  // Arrange
  expect.assertions(1)
  const setupLogger = spy(() => () => ({
    log: () => {},
    flush: () => {}
  }))
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const mockEvenet = { id: 1 }
  const myResult = { id: 1 }
  const fun = (event: any, logger: any, cnx: any) => {
    return Promise.resolve(myResult)
  }
  const awsFun = guard(fun)

  // Act
  const result = await awsFun(mockEvenet, context as any)
  expect(result).toBe(myResult)
})

test('Capture exception on failure', async () => {
  // Arrange
  const captureException = spy((error: Error) => null)
  const setupLogger = () => () => ({
    captureException,
    flush: () => {}
  })
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const mockEvenet = { id: 1 }
  const myError = new Error('Random error')
  const fun = (event: any, logger: any, cnx: any) => {
    throw myError
  }
  const awsFun = guard(fun)

  // Act
  await expect(awsFun(mockEvenet, context as any)).rejects.toBe(myError)
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
  const captureException = spy((error: Error) => null)
  const setupLogger = () => () => ({
    captureException,
    flush: () => {}
  })
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const fun = (event: any, logger: any, cnx: any) => {
    return new Promise(resolve => {
      setTimeout(resolve, timeoutTime + 1)
    })
  }
  const awsFun = guard(fun)

  // Act
  const p = awsFun(null, myContext as any)

  // Assert
  expect((setTimeout as any).mock.calls.length).toBe(2)
  expect((setTimeout as any).mock.calls[0][1]).toBe(timeoutTime - 500)
  expect(captureException.callCount).toBe(0)

  jest.advanceTimersByTime(9501)

  expect(captureException.callCount).toBe(1)
  expect(captureException.args[0][0].message.includes('Timeout')).toBe(true)
  jest.advanceTimersByTime(10001)
  await p;
})

test('Extract request stack from header', async () => {
  // Arrange
  const createLogger = spy((logdnaKey: string, sentry: string) => ({
    flush: () => {}
  }))
  const setupLogger = spy(() => createLogger)
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const fun = (event: any, logger: any, context: any) => Promise.resolve()
  const awsFun = guard(fun)
  const event = {
    headers: {
      'x-request-stack': 'id1,id2,id3'
    }
  }

  // Act
  await awsFun(event, context as any)

  // Assert
  expect(createLogger.callCount).toBe(1)
  expect(createLogger.args[0][0]).toBe(context)
  expect(createLogger.args[0][1]).toEqual(['id1', 'id2', 'id3'])
})

test('Extract request stack from event', async () => {
  // Arrange
  const createLogger = spy((logdnaKey: string, sentry: string) => ({
    flush: () => {}
  }))
  const setupLogger = spy(() => createLogger)
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const fun = (event: any, logger: any, context: any) => Promise.resolve()
  const awsFun = guard(fun)
  const event = {
    requestStack: ['id1', 'id2']
  }

  // Act
  await awsFun(event, context as any)

  // Assert
  expect(createLogger.callCount).toBe(1)
  expect(createLogger.args[0][0]).toBe(context)
  expect(createLogger.args[0][1]).toEqual(event.requestStack)
})

test('Parse JSON event', async () => {
  // Arrange
  const setupLogger = () => () => ({
    flush: () => {}
  })
  const guard = createGuard('logdnaKey', 'dns', setupLogger as any)
  const fun = spy((event: any, logger: any, context: any) => {})
  const awsFun = guard(fun as any)
  const event = JSON.stringify({
    data: 5
  })

  // Act
  await awsFun(event, context as any)

  // Assert
  expect(fun.callCount).toBe(1)
  expect(fun.args[0][0]).toEqual({ data: 5 })
})
