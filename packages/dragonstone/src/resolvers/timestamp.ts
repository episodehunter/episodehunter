import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

const validOrNull = (value?: number) => {
  if (typeof value !== 'number') {
    return null;
  }
  const n = Math.abs(value) | 0;
  if (String(n).length !== 10) {
    return null
  }
  return n;
}

export const unixTimestampType = new GraphQLScalarType({
  name: 'Timestamp',
  description: 'Unix timestamp (10 digits)',
  parseValue: validOrNull,
  serialize(value: number): number {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return validOrNull(Number(ast.value));
    }
    return null;
  }
});
