import { sortEpisode } from '../util';

describe('Sort episodes', () => {
  test('Sort episodes', () => {
    // Arrange
    const episodes = [
      {season: 5, episode: 5},
      {season: 2, episode: 2},
      {season: 5, episode: 2},
      {season: 5, episode: 6},
      {season: 1, episode: 7},
      {season: 1, episode: 6},
      {season: 1, episode: 5},
      {season: 1, episode: 4},
      {season: 5, episode: 1}
    ]

    // Act
    sortEpisode(episodes)

    // Assert
    expect(episodes).toEqual([
      {season: 1, episode: 4},
      {season: 1, episode: 5},
      {season: 1, episode: 6},
      {season: 1, episode: 7},
      {season: 2, episode: 2},
      {season: 5, episode: 1},
      {season: 5, episode: 2},
      {season: 5, episode: 5},
      {season: 5, episode: 6}
    ])
  })
})