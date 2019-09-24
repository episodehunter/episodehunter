export const captureException = jest.fn()

export const createGuard = () => {
  return (fn: (event: any, logger: any, context: any) => Promise<any>) => (event: any, context: any) => {
    const logger = {
      log: () => {},
      warn: console.warn,
      captureException
    };
    return fn(event, logger, context).catch(error => {
      captureException(error)
      return Promise.reject(error)
    });
  };
};
