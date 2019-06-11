import { inserts } from "../pg-util";

describe('Inserts', () => {
  test('Insert multi rows', () => {
    // Arrange
    const rows = [{
      name: 'Oskar',
      age: 29
    }, {
      age: 27,
      name: 'Carl'
    }, {
      age: 25,
      name: 'Stina'
    }]

    // Act
    const result = inserts('users', rows);

    // Assert
    expect(result.text).toBe('INSERT INTO users (name, age) VALUES ($1, $2), ($3, $4), ($5, $6)');
    expect(result.values).toEqual(['Oskar', 29, 'Carl', 27, 'Stina', 25]);
  })

})