export function unixTimestamp() {
  return (Date.now() / 1000) | 0;
}
