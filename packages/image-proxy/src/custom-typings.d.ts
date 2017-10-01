declare module 'node-fetch' {
  const f: typeof fetch;
  export default f;
}

declare module 'assert-env' {
  const f: (keys: string[]) => void;
  export = f;
}
