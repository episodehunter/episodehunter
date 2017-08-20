export function assertRequiredConfig(...keys: string[]) {
  keys.forEach(key => {
    if (!process.env[key]) {
      throw new Error(`Missing config for ${key}!`);
    }
  });
}

export function unixtimestamp() {
  return Date.now() / 1000 | 0;
}
