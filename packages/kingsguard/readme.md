# Kingsguard

> Wrap a aws (lambda) function and provide it with a logger and a database connection. Also capture a timeout error before it happens.

### Usage

```ts
import { guard } from '@episodehunter/kingsguard'

export const handler = guard(async (event, logger, connect, context) => {
  logger.log(`Event: ${event}`)
  const connection = await connect() // The connection will close automatically
  return 1
})

```
