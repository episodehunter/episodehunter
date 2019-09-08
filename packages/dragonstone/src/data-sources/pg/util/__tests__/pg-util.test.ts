import { update } from '../pg-util';

describe('update', () => {
  test('Update row', () => {
    // Arrange
    const row = {
      name: 'Oskar',
      age: 29
    };

    // Act
    const result = update('users', 5, row);

    // Assert
    expect(result.text).toBe('UPDATE users SET name = $2, age = $3 WHERE id = $1');
    expect(result.values).toEqual([5, 'Oskar', 29]);
  });
});
