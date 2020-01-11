import { readFileSync, writeFileSync } from 'fs';
import { buildSchema, GraphQLSchema, graphqlSync, introspectionQuery } from 'graphql';
import gql from 'graphql-tag';

const rawSchema = readFileSync('./dragonstone-schema.graphql').toString();

function createImportableSchema() {
  const content = 'module.exports = `' + rawSchema + '`;';
  writeFileSync('./dragonstone-schema.js', content);
}

function createSchema() {
  const schema: GraphQLSchema = buildSchema(rawSchema);
  const result = graphqlSync(schema, introspectionQuery).data;
  writeFileSync('./dragonstone-schema.json', JSON.stringify(result));
}

function compileSchema() {
  const result = gql(rawSchema);
  const content = `module.exports = ${JSON.stringify(result)};`;
  writeFileSync('./dragonstone-aot-schema.js', content);
}

createImportableSchema();
createSchema();
compileSchema();
