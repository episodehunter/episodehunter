declare module "logdna" {
  interface Options {
    app?: string,
    hostname?: string,
    env?: string,
    index_meta?: boolean,
    ip?: string,
    level?: 'Debug' | 'Trace' | 'Info' | 'Warn' | 'Error' | 'Fatal' | 'YourCustomLevel',
    mac?: string,
    max_length?: boolean,
    timeout?: number,
    with_credentials?: boolean
  }
  interface LogOptions extends Options {
    meta?: Object
  }
  export interface DnaLogger {
    log: (
      line: string,
      options?: LogOptions
    ) => void;
  }

  export function createLogger(key: string, options?: Options): DnaLogger;

  export function flushAll(): void;
}
