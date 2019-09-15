interface Response {
  statusCode: '200' | '400' | '401' | '404';
  headers: { 'Content-Type': 'application/json' };
  body: string;
}

export const createOkResponse = (message: string): Response => ({
  statusCode: '200',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message })
})

export const createBadRequestResponse = (message: string ): Response => ({
  statusCode: '400',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message })
})

export const createUnauthorizedOkResponse = (message: string ): Response => ({
  statusCode: '401',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message })
})

export const createNotFoundResponse = (): Response => ({
  statusCode: '404',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message:
      'Could not found show. Nor could we add it. Does it realy exist? Is it a tvdb show?'
  })
})
