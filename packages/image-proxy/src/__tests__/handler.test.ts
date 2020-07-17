import { toMatchImageSnapshot } from 'jest-image-snapshot';
import * as sharp from 'sharp';
import { imageFetcher } from '../handler';
import { config } from '../config';
import { files, fetchEpisodeImage, fetchShowFanart } from '../../__mocks__/@episodehunter/thetvdb';
import { putObject } from '../../__mocks__/aws-sdk';

expect.extend({ toMatchImageSnapshot });

config.bucketName = 'bucket-name';
config.bucketUrl = 'https://bucket_url.net';

const logger = {
  log: () => void 0,
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('Return bad request for invalid image path', async () => {
  // Arrange
  const event = {
    queryStringParameters: {
      key: 'cat/123.jpg',
    },
  };

  // Act
  const result = await imageFetcher(event as any, logger as any);

  // Assert
  expect(result).toEqual({ statusCode: '400', headers: {}, body: '' });
});

test('Return bad request for not supported width', async () => {
  // Arrange
  const event = {
    queryStringParameters: {
      key: 'poster/20x273/1234.jpg',
    },
  };

  // Act
  const result = await imageFetcher(event as any, logger as any);

  // Assert
  expect(result).toEqual({ statusCode: '400', headers: {}, body: '' });
});

test('Return bad request for not supported height', async () => {
  // Arrange
  const event = {
    queryStringParameters: {
      key: 'poster/185x20/1234.jpg',
    },
  };

  // Act
  const result = await imageFetcher(event as any, logger as any);

  // Assert
  expect(result).toEqual({ statusCode: '400', headers: {}, body: '' });
});

test('Get episode image', async () => {
  // Arrange
  const event = {
    queryStringParameters: {
      key: 'episode/1234.jpg',
    },
  };
  fetchEpisodeImage.mockResolvedValueOnce(files.episode);

  // Act
  const result = await imageFetcher(event as any, logger as any);

  // Assert
  const { ACL, Key, ContentType, CacheControl, Bucket, Body } = putObject.mock.calls[0][0];
  expect(ACL).toBe('public-read');
  expect(Key).toBe('episode/1234.jpg');
  expect(ContentType).toBe('image/jpeg');
  expect(CacheControl).toBe('max-age=86400');
  expect(Bucket).toBe('bucket-name');
  // Convert the image to a png to support `toMatchImageSnapshot`
  const buffer = await sharp(Body).png().toBuffer();
  expect(buffer).toMatchImageSnapshot();
  expect(result).toEqual({ statusCode: '301', headers: { location: 'https://bucket_url.net/episode/1234.jpg' }, body: '' });
});

test('Generate a small fanart image', async () => {
  // Arrange
  const event = {
    queryStringParameters: {
      key: 'fanart/842x472/1234.jpg',
    },
  };
  fetchShowFanart.mockResolvedValueOnce(files.fanart);

  // Act
  const result = await imageFetcher(event as any, logger as any);

  // Assert
  expect(result).toEqual({ statusCode: '301', headers: { location: 'https://bucket_url.net/fanart/842x472/1234.jpg' }, body: '' });
  const { ACL, Key, ContentType, CacheControl, Bucket, Body } = putObject.mock.calls[0][0];
  expect(ACL).toBe('public-read');
  expect(Key).toBe('fanart/842x472/1234.jpg');
  expect(ContentType).toBe('image/jpeg');
  expect(CacheControl).toBe('max-age=86400');
  expect(Bucket).toBe('bucket-name');
  // Convert the image to a png to support `toMatchImageSnapshot`
  const buffer = await sharp(Body).png().toBuffer();
  expect(buffer).toMatchImageSnapshot();
});
