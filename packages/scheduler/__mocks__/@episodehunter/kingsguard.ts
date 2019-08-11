export const createGuard = () => {
  return (fn: (event: any, logger: any, context: any) => Promise<any>) => (event: any, context: any, cb: any) => {
    const logger = {
      log: () => {},
      warn: console.warn
    };
    fn(event, logger, context)
      .then(result => cb(null, result))
      .catch(cb);
  };
};
