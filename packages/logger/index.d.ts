export interface Logger {
  captureMessage(message: string): void;
  captureException(message: any): void;
}

export declare function createLogger(dsn: string, projectId: string): Logger;
