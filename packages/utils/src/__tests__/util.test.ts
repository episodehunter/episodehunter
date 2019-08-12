import { groupArray } from '../arrary';

describe('Group Array', () => {
  test('Create a new group for every 5:th element', () => {
    // Arrange
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    // Act
    const result = Array.from(groupArray(array, 5));

    // Assert
    expect(result.length).toBe(3);
  });
});
