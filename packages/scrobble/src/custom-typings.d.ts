declare module 'aws-lambda-multipart-parser' {
  const parse: <T = any>(event: any, spotText: boolean) => T
  export { parse }
}
