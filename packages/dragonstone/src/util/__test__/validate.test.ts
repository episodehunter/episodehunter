import fc from 'fast-check';
import { assertShowInput, assertEpisodes, assertShowId, assertEpisodeNumber } from '../validate';

describe('Validate show', () => {
  test('Valid show', () => {
    // Arrange
    const showInput = {
      tvdbId: 123,
      imdbId: 'tt123',
      name: 'Some show',
      // airsDayOfWeek: undefind
      airsTime: '2018-02-01',
      firstAired: '',
      genre: ['action', 'drama'],
      language: 'sv',
      // network: ,
      overview: 'some overview',
      runtime: 12,
      ended: true,
      lastupdate: 12
    };

    // Act and assert
    expect(() => assertShowInput(showInput)).not.toThrow();
  });

  test('Show without name is not valid', () => {
    // Arrange
    const showInput = {
      tvdbId: 123,
      imdbId: 'tt123',
      // name: 'Some show',
      // airsDayOfWeek: undefind
      airsTime: '2018-02-01',
      firstAired: '',
      genre: ['action', 'drama'],
      language: 'sv',
      // network: ,
      overview: 'some overview',
      runtime: 12,
      ended: true,
      lastupdate: 12
    };

    // Act and assert
    expect(() => assertShowInput(showInput as any)).toThrow('Expected type string for name but got undefined');
  });

  test('Show with airs is not valid', () => {
    // Arrange
    const showInput = {
      tvdbId: 123,
      imdbId: 'tt123',
      name: 'Some show',
      // airsDayOfWeek: undefind
      airsTime: '2018-02-01',
      firstAired: '',
      genre: ['action', 'drama'],
      language: 'sv',
      airs: 'hej',
      network: '',
      overview: 'some overview',
      runtime: 12,
      ended: true,
      lastupdate: 12
    };

    // Act and assert
    expect(() => assertShowInput(showInput as any)).toThrow('airs is not a valid key for a show');
  });

  test('Show with long airs time time is not valid', () => {
    // Arrange
    const showInput = {
      tvdbId: 123,
      imdbId: 'tt123',
      name: 'Some show',
      airsTime: '2018-02-011',
      firstAired: '',
      genre: ['action', 'drama'],
      language: 'sv',
      network: '',
      overview: 'some overview',
      runtime: 12,
      ended: true,
      lastupdate: 12
    };

    // Act and assert
    expect(() => assertShowInput(showInput as any)).toThrow('airsTime must have a lengt of max 10 but it is 11 (2018-02-011)');
  });

  test('Show with NaN value is not valid', () => {
    // Arrange
    const showInput = {
      tvdbId: 123,
      imdbId: 'tt123',
      name: 'Some show',
      airsTime: '2018-02-01',
      firstAired: '',
      genre: ['action', 'drama'],
      language: 'sv',
      network: '',
      overview: 'some overview',
      runtime: NaN,
      ended: true,
      lastupdate: 12
    };

    // Act and assert
    expect(() => assertShowInput(showInput as any)).toThrow('runtime is NaN but must be a value');
  });

  test('Show with long imdb id is not valid', () => {
    // Arrange
    const showInput = {
      tvdbId: 123,
      imdbId: 'tt123456789',
      name: 'Some show',
      airsTime: '2018-02-01',
      firstAired: '',
      genre: ['action', 'drama'],
      language: 'sv',
      network: '',
      overview: 'some overview',
      runtime: 4,
      ended: true,
      lastupdate: 12
    };

    // Act and assert
    expect(() => assertShowInput(showInput as any)).toThrow('imdbId must have a lengt of max 10 but it is 11 (tt123456789)');
  });
});

describe('Validate episode', () => {
  test('Valid episode', () => {
    // Arrange
    const episodeInput = {
      name: 'Some name',
      episodenumber: 10001,
      firstAired: '2019-01-01',
      overview: 'some text',
      lastupdated: 10000000,
      tvdbId: 123
    };

    // Act and assert
    expect(() => assertEpisodes([episodeInput])).not.toThrow();
  });

  test('Episode without name is not valid', () => {
    // Arrange
    const episodeInput = {
      // name: 'Some name',
      episodenumber: 10001,
      firstAired: '2019-01-01',
      overview: 'some text',
      lastupdated: 10000000,
      tvdbId: 123
    };

    // Act and assert
    expect(() => assertEpisodes([episodeInput] as any)).toThrow('Expected type string for name but got undefined');
  });

  test('Show without firstAired is not valid', () => {
    // Arrange
    // Arrange
    const episodeInput = {
      name: 'Some name',
      episodenumber: 10001,
      // firstAired: '2019-01-01',
      overview: 'some text',
      lastupdated: 10000000,
      tvdbId: 123
    };

    // Act and assert
    expect(() => assertEpisodes([episodeInput] as any)).toThrow('Expected type string for firstAired but got undefined');
  });
});

describe('Validate show id', () => {
  test('A int is a valid show id', () => {
    return fc.assert(fc.property(fc.integer(1, 10000000), i => {
      assertShowId(i)
    }));
  });

  test('A float is a valid show id', () => {
    return expect(() => assertShowId(1.1)).toThrow();
  });
});

describe('Assert episode number', () => {
  test('A valid episodenumber is between 10001 and 999999', () => {
    return fc.assert(fc.property(fc.integer(10001, 999999), i => {
      assertEpisodeNumber(i)
    }));
  });

  test('Smaller than 10001 is invalid', () => {
    return expect(() => assertEpisodeNumber(10000)).toThrow();
  });

  test('Larger than 99999999 is invalid', () => {
    return expect(() => assertEpisodeNumber(100_000_000)).toThrow();
  });
})
