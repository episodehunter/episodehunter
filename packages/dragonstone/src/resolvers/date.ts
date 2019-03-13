import { GraphQLScalarType } from 'graphql';
import { UserInputError } from 'apollo-server-lambda';
import { Kind } from 'graphql/language';

export const dateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.getTime();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new UserInputError('Date value is invalid. Could not parse: ' + ast.value);
      }
      return date;
    }
    throw new UserInputError('Date value must be of type string or int');
  }
});
