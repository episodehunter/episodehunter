# 🏯Dragonstone

The layer between the data store and the consumer.

## Develop

### Run localy

You need to run your own instance of Postgres.

1. Run `docker run -p 54320:5432 -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test postgres`
2. Set following env: `export PG_CONNECTION_URI=postgres://test:test@localhost:54320/test`
3. Set up some example data. Take a look in `__intergration_test__/setup-db.ts`
4. Start the server by `npm run start`

You should now be able to run querys against your started node server with insomnia/postman or some other client.

See `__intergration_test__/test.ts` for examples.

### Build

Run `npm run build` for buildning and type test the application

### Test

- Run `npm run test` to run unit tests.
- Run `npm run test:intergration` to run intergration tests (needs docker to be installed)
- Run `npm run test:all` to run all tests

### Deploy

See the `Makefile`.

Run `make deploy` to deploy everything into production.
