## Logger for episodehunter

A simple wrapper for the sentry and logdna clients.

```ts
import { setupLogger } from '@episodehunter/logger';

const createLogger = setupLogger('ravenDns', 'logDnaApiKey');

const handler = (event, context, cb) => {
  const requestStack = ['id2', 'id1', 'id0'];
  const logger = createLogger(context, requestStack);
  logger.log('Hello!');
};
```
