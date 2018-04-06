import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import * as sharp from 'sharp';
import { guard, assertRequiredConfig, Logger } from '@episodehunter/kingsguard';
import { TheTvDb, NotFound } from '@episodehunter/thetvdb';
import { imageInformation, ImageInformation } from './util';
import { BadRequest } from './custom-error';
import { BAD_REQUEST_RESPONSE, NOT_FOUND_RESPONSE, move } from './response';

assertRequiredConfig('BUCKET_NAME', 'BUCKET_URL', 'THE_TV_DB_API_KEY');

const theTvDb = new TheTvDb(process.env.THE_TV_DB_API_KEY);
const s3 = new S3();

const ALLOWED_RESOLUTIONS = new Map([[185, 273], [216, 122]]); // [ width, height ]

function fetchImage(logger: Logger, image: ImageInformation) {
  const log = (msg: string) => logger.log(msg);
  if (image.type === 'episode') {
    logger.log(`Fetch episode`);
    return theTvDb.fetchEpisodeImage(image.id, log);
  } else if (image.type === 'poster') {
    logger.log(`Fetch poster`);
    return theTvDb.fetchShowPoster(image.id, log);
  } else if (image.type === 'fanart') {
    logger.log(`Fetch fanart`);
    return theTvDb.fetchShowFanart(image.id, log);
  } else {
    logger.log(`Unknown type`);
    throw new BadRequest();
  }
}

function resizeImage(logger: Logger, buffer: Buffer, width?: number, height?: number): Promise<Buffer> {
  if (width && height) {
    logger.log('Resize Image');
    return sharp(buffer)
      .resize(width, height)
      .toBuffer();
  }
  logger.log('Will not resize Image');
  return Promise.resolve(buffer);
}

function saveImage(logger: Logger, buffer: Buffer, key: string) {
  logger.captureBreadcrumb({ message: 'Put image to disk', category: 'debug', data: { key } });
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

function resizeAndSaveImage(logger: Logger, buffer: Buffer, image: ImageInformation) {
  return resizeImage(logger, buffer, image.width, image.height).then(newBuffer => saveImage(logger, newBuffer, image.key));
}

function fetchAndSave(logger: Logger, image: ImageInformation) {
  return fetchImage(logger, image).then(buffer => resizeAndSaveImage(logger, buffer, image));
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

  return fetchAndSave(logger, image)
    .then(() => move(image.key))
    .catch(error => {
      logger.log(error && error.message);
      if (error instanceof NotFound) {
        return NOT_FOUND_RESPONSE;
      } else if (error instanceof BadRequest) {
        return BAD_REQUEST_RESPONSE;
      }
      throw error;
    });
}

export const handler = guard(imageFetcher);
