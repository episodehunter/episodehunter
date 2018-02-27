import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import * as sharp from 'sharp';
import { guard, assertRequiredConfig, Logger } from '@episodehunter/kingsguard';
import { TheTvDb, NotFound } from '@episodehunter/thetvdb';
import { imageInformation, ImageInformation } from './util';
import { BadRequest } from './custom-error';
import { BAD_REQUEST_RESPONSE, NOT_FOUND_RESPONSE, move } from './response';

assertRequiredConfig('BUCKET_NAME', 'BUCKET_URL', 'THE_TV_DB_API_KEY', 'THE_TV_DB_USER_KEY');

const theTvDb = new TheTvDb(process.env.THE_TV_DB_API_KEY, process.env.THE_TV_DB_USER_KEY);
const s3 = new S3();

const ALLOWED_RESOLUTIONS = new Map([[185, 273], [216, 122]]); // [ width, height ]

function fetchImage(image: ImageInformation) {
  if (image.type === 'episode') {
    return theTvDb.fetchEpisodeImage(image.id);
  } else if (image.type === 'poster') {
    return theTvDb.fetchShowPoster(image.id);
  } else if (image.type === 'fanart') {
    return theTvDb.fetchShowFanart(image.id);
  } else {
    throw new BadRequest();
  }
}

function resizeImage(buffer: Buffer, width?: number, height?: number): Promise<Buffer> {
  if (width && height) {
    return sharp(buffer)
      .resize(width, height)
      .toBuffer();
  }
  return Promise.resolve(buffer);
}

function saveImage(buffer: Buffer, key: string) {
  return s3
    .putObject({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      CacheControl: 'max-age=86400',
      ACL: 'public-read'
    })
    .promise();
}

function resizeAndSaveImage(buffer: Buffer, image: ImageInformation) {
  return resizeImage(buffer, image.width, image.height).then(newBuffer => saveImage(newBuffer, image.key));
}

function fetchAndSave(image: ImageInformation) {
  return fetchImage(image).then(buffer => resizeAndSaveImage(buffer, image));
}

export function imageFetcher(event: APIGatewayEvent, logger: Logger) {
  const key = event.queryStringParameters.key;
  logger.log('Requesting: ' + key);
  const image = imageInformation(key);

  if (!image) {
    logger.log(`${key} is not a valid key`);
    return Promise.resolve(BAD_REQUEST_RESPONSE);
  }

  if (image.width && !ALLOWED_RESOLUTIONS.has(image.width)) {
    logger.log(`${image.width} is not a valid width`);
    return Promise.resolve(BAD_REQUEST_RESPONSE);
  }

  return fetchAndSave(image)
    .then(() => move(image.key))
    .catch(error => {
      if (error instanceof NotFound) {
        return NOT_FOUND_RESPONSE;
      } else if (error instanceof BadRequest) {
        return BAD_REQUEST_RESPONSE;
      }
      throw error;
    });
}

export const handler = guard(imageFetcher);
