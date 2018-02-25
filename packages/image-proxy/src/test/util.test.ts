import { imageInformation } from '../util';

test('Extract size information', () => {
  // Arrange
  const str = '/poster/20x40/1234.jpg';

  // Act
  const result = imageInformation(str);

  // Assert
  expect(result.width).toBe(20);
  expect(result.height).toBe(40);
});

test('Extract type information', () => {
  // Arrange
  const str = '/poster/20x40/1234.jpg';

  // Act
  const result = imageInformation(str);

  // Assert
  expect(result.type).toBe('poster');
});

test('Extract id when requesting a size', () => {
  // Arrange
  const str = '/poster/20x40/1234.jpg';

  // Act
  const result = imageInformation(str);

  // Assert
  expect(result.id).toBe(1234);
});

test('Extract id when not requesting a size', () => {
  // Arrange
  const str = '/poster/1234.jpg';

  // Act
  const result = imageInformation(str);

  // Assert
  expect(result.id).toBe(1234);
});

describe('Return null when invalid url', () => {
  test('Not valid type', () => {
    // Arrange
    const str = '/cat/1234.jpg';

    // Act
    const result = imageInformation(str);

    // Assert
    expect(result).toBe(null);
  });

  test('Do not include a extension', () => {
    // Arrange
    const str = '/poster/1234.';

    // Act
    const result = imageInformation(str);

    // Assert
    expect(result).toBe(null);
  });
});
