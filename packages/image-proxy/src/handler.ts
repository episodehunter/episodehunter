import { connect, Connection, entities } from '@episodehunter/datastore';
import { SNSEvent, Context, Callback } from 'aws-lambda';
import * as assertRequiredConfig from 'assert-env';

assertRequiredConfig([
  'EH_DB_HOST',
  'EH_DB_PORT',
  'EH_DB_USERNAME',
  'EH_DB_PASSWORD',
  'EH_DB_DATABASE',
  'EH_RAVEN_DSN',
  'EH_RAVEN_PROJECT'
]);

export async function update(event: SNSEvent, context: Context, callback: Callback) {
  const message = event.Records[0].Sns.Message;

  console.log(`Will do something with ${message}`);

  let connection: Connection;

  try {
    connection = await connect({
      database: process.env.EH_DB_DATABASE,
      host: process.env.EH_DB_HOST,
      password: process.env.EH_DB_PASSWORD,
      port: process.env.EH_DB_PORT,
      username: process.env.EH_DB_USERNAME
    });
    callback(null, true);
  } catch (error) {
    callback(error);
  } finally {
    if (connection && connection.close) {
      connection.close();
    }
  }

}
