import { assertShowInput } from '../validate';

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
