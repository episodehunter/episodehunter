import { sortEpisode, groupArray } from '../util';

describe('Sort episodes', () => {
  test('Sort episodes', () => {
    // Arrange
    const episodes = [
      { season: 5, episode: 5 },
      { season: 2, episode: 2 },
      { season: 5, episode: 2 },
      { season: 5, episode: 6 },
      { season: 1, episode: 7 },
      { season: 1, episode: 6 },
      { season: 1, episode: 5 },
      { season: 1, episode: 4 },
      { season: 5, episode: 1 }
    ];

    // Act
    sortEpisode(episodes);

    // Assert
    expect(episodes).toEqual([
      { season: 1, episode: 4 },
      { season: 1, episode: 5 },
      { season: 1, episode: 6 },
      { season: 1, episode: 7 },
      { season: 2, episode: 2 },
      { season: 5, episode: 1 },
      { season: 5, episode: 2 },
      { season: 5, episode: 5 },
      { season: 5, episode: 6 }
    ]);
  });
});

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
