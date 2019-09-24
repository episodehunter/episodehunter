import DataLoader, { BatchLoadFn, Options } from 'dataloader';

export function createDataLoader<K, V>(fn: BatchLoadFn<K, V>, options: Options<K, V> = {}): DataLoader<K, V> {
  if ((process.env.NODE_ENV = 'test')) {
    options.cache = false;
  }
  return new DataLoader<K, V>(fn, options);
}

export { DataLoader };
