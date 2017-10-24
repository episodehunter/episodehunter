import { connect, Connection, entities } from '@episodehunter/datastore';
import { SNSEvent, Context, Callback } from 'aws-lambda';
import * as assertRequiredConfig from 'assert-env';
import { Image } from './types';
import { logger } from './logger';
import { insertImagesToDownload } from './db.util';

assertRequiredConfig(['EH_DB_HOST', 'EH_DB_PORT', 'EH_DB_USERNAME', 'EH_DB_PASSWORD', 'EH_DB_DATABASE']);

async function handleImages(images: Image[], connection: Connection) {
  await insertImagesToDownload(images, connection);
}

export async function update(event: SNSEvent, context: Context, callback: Callback) {
  const message = event.Records[0].Sns.Message;

  console.log(`Will parse and do something with ${message}`);

  let images: Image[] = [];
  try {
    images = JSON.parse(message);
  } catch (error) {
    logger.captureException(error);
    // This is a failure but there is no reason
    // to try again with the same data
    callback(undefined, false);
    return;
  }

  if (images.length < 1) {
    callback(undefined, 0);
    return;
  }

  let connection: Connection;

  try {
    connection = await connect({
      database: process.env.EH_DB_DATABASE,
      host: process.env.EH_DB_HOST,
      password: process.env.EH_DB_PASSWORD,
      port: process.env.EH_DB_PORT,
      username: process.env.EH_DB_USERNAME
    });
    await handleImages(images, connection);
    callback(undefined, images.length);
  } catch (error) {
    callback(error);
  } finally {
    if (connection && connection.close) {
      connection.close();
    }
  }
}
