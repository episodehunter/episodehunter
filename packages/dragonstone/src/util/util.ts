export function safeMap<T, R>(arr: T[] | undefined, mapper: (value: T) => R) {
  if (!arr) {
    return [];
  }
  return arr.map(mapper);
}
