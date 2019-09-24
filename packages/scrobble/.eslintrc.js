module.exports =  {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
 parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "graphql/template-strings": ['error', {
      env: 'apollo',
      schemaJson: require('@episodehunter/types/dragonstone-schema.json'),
      tagName: 'gql'
    }]
  },
  plugins: [
    'graphql'
  ]
};
