import { createGuard, Logger } from '@episodehunter/kingsguard';
import { NotFound, TheTvDb } from '@episodehunter/thetvdb';
import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import * as sharp from 'sharp';
import { config } from './config';
import { BadRequest } from './custom-error';
import { BAD_REQUEST_RESPONSE, createMoveResponse, NOT_FOUND_RESPONSE, Response } from './response';
import { imageInformation, ImageInformation } from './util';

const globalTheTvDb = new TheTvDb(config.theTvDbApiKey);
const globalS3 = new S3();

interface Box<HasBuffer extends boolean = true> {
  targetImageInfo: ImageInformation;
  logger: Logger;
  buffer: HasBuffer extends true ? Buffer : undefined;
  s3: S3;
  theTvDb: TheTvDb;
}

async function fetchImage(box: Box<false>): Promise<Box> {
  const log = (msg: string) => logger.log(msg);
  const { logger, targetImageInfo, theTvDb } = box;
  let buffer: Buffer;
  if (targetImageInfo.type === 'episode') {
    logger.log(`Fetch episode`);
    buffer = await theTvDb.fetchEpisodeImage(targetImageInfo.id, log);
  } else if (targetImageInfo.type === 'poster') {
    logger.log(`Fetch poster`);
    buffer = await theTvDb.fetchShowPoster(targetImageInfo.id, log);
  } else if (targetImageInfo.type === 'fanart') {
    logger.log(`Fetch fanart`);
    buffer = await theTvDb.fetchShowFanart(targetImageInfo.id, log);
  } else {
    throw new BadRequest();
  }
  return { ...box, buffer };
}

async function resizeImage(box: Box): Promise<Box> {
  const {
    logger,
    targetImageInfo: { width, height },
    buffer,
  } = box;
  if (!width && !height) {
    return box;
  }
  logger.log(`Rezise image to width: ${width}, height: ${height}`);
  const resizedBuffer = await sharp(buffer).resize(width, height).toBuffer();
  return { ...box, buffer: resizedBuffer };
}

async function saveImage(box: Box): Promise<Box> {
  const {
    buffer,
    logger,
    s3,
    targetImageInfo: { key },
  } = box;
  logger.log('Put image to disk: ' + key);
  await s3
    .putObject({
      Bucket: config.bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      CacheControl: 'max-age=86400',
      ACL: 'public-read',
    })
    .promise();
  return box;
}

export async function imageFetcher(event: APIGatewayEvent, logger: Logger): Promise<Response> {
  if (!event || !event.queryStringParameters || !event.queryStringParameters.key) {
    return BAD_REQUEST_RESPONSE;
  }
  const key = event.queryStringParameters.key;
  logger.log('Requesting: ' + key);
  const image = imageInformation(key);

  if (!image) {
    logger.log(`${key} is not a valid key`);
    return BAD_REQUEST_RESPONSE;
  } else if (image.width && (image.width > 2000 || image.width < 100)) {
    logger.log(`${image.width} is not a valid width`);
    return BAD_REQUEST_RESPONSE;
  } else if (image.height && (image.height > 2000 || image.height < 100)) {
    logger.log(`${image.height} is not a valid height`);
    return BAD_REQUEST_RESPONSE;
  }

  const box: Box<false> = {
    logger,
    s3: globalS3,
    targetImageInfo: image,
    theTvDb: globalTheTvDb,
    buffer: undefined,
  };

  return fetchImage(box)
    .then(resizeImage)
    .then(saveImage)
    .then((box) => createMoveResponse(box.targetImageInfo.key))
    .catch((error) => {
      logger.log(error && error.message);
      if (error instanceof NotFound) {
        return NOT_FOUND_RESPONSE;
      } else if (error instanceof BadRequest) {
        return BAD_REQUEST_RESPONSE;
      }
      throw error;
    });
}

const guard = createGuard(config.sentryDsn, config.logdnaKey);

export const handler = guard(imageFetcher);
