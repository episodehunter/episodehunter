export const putObject = jest.fn(
  (_: { Bucket: string; Key: string; Body: Buffer; ContentType: string; CacheControl: string; ACL: string }) => ({
    promise: () => Promise.resolve(),
  })
);

export class S3 {
  putObject = putObject;
}
