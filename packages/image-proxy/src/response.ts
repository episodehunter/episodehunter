export const BAD_REQUEST_RESPONSE = {
  statusCode: '403',
  headers: {},
  body: ''
};

export const NOT_FOUND_RESPONSE = {
  statusCode: '404',
  headers: {},
  body: ''
};

export function move(key: string) {
  return {
    statusCode: '301',
    headers: { location: `${process.env.BUCKET_URL}/${key}` },
    body: ''
  };
}
