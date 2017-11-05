module.exports = () => {
  return {
    files: ['tsconfig.json', 'guard.ts'],
    tests: ['test.ts'],
    debug: true,
    env: {
      type: 'node',
      runner: 'node'
    },
    testFramework: 'jest'
  }
}
