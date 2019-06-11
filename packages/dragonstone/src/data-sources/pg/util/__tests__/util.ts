import { extractEpisodeNumber } from "../util";

describe('Episode extractor', () => {
  test('Extract small season', () => {
    // Arrange
    const season = 8;
    const episode = 2;

    // Act
    const restult = extractEpisodeNumber(season * 10000 + episode);

    // Assert
    expect(restult).toEqual([season, episode]);
  })

  test('Extract large season', () => {
    // Arrange
    const season = 800;
    const episode = 2;

    // Act
    const restult = extractEpisodeNumber(season * 10000 + episode);

    // Assert
    expect(restult).toEqual([season, episode]);
  })

  test('Extract large episode', () => {
    // Arrange
    const season = 8;
    const episode = 200;

    // Act
    const restult = extractEpisodeNumber(season * 10000 + episode);

    // Assert
    expect(restult).toEqual([season, episode]);
  })

  test('Extract large episode and season', () => {
    // Arrange
    const season = 80000;
    const episode = 200;

    // Act
    const restult = extractEpisodeNumber(season * 10000 + episode);

    // Assert
    expect(restult).toEqual([season, episode]);
  })
})