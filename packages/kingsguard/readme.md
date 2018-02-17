# Kingsguard

> Wrap a aws (lambda) function and provide it with a logger. Also capture a timeout error before it happens.

### Usage

```ts
import { guard } from '@episodehunter/kingsguard'

export const handler = guard((event, logger, context) => {
  logger.log(`Event: ${event}`)
  return 1
})
```
