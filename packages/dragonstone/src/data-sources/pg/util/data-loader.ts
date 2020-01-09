import DataLoader, { BatchLoadFn, Options } from 'dataloader';

export function createDataLoader<K, V>(fn: BatchLoadFn<K, V>, options: Options<K, V, string> = {}): DataLoader<K, V> {
  if ((process.env.NODE_ENV = 'test')) {
    options.cache = false;
  }
  return new DataLoader<K, V, string>(fn, options);
}

export { DataLoader };
