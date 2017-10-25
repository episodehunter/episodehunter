import * as AWS from 'aws-sdk';
import { entities } from '@episodehunter/datastore';
import { Image as ImageMessage } from '@episodehunter/types/sns-message';
import { logger } from './logger';

const sns = new AWS.SNS();

const publishUpdateImages = (obj: ImageMessage) =>
  sns
    .publish({
      Message: JSON.stringify(obj),
      TopicArn: ''
    })
    .promise()
    .catch(error => logger.captureException(error));

export function updateImages(show: entities.Show, updateEpisodes: entities.Episode[], removedEpisodes: entities.Episode[]) {
  if (!show.poster) {
    publishUpdateImages({
      action: 'add',
      id: show.id,
      theTvDbId: show.tvdb_id,
      media: 'show',
      type: 'poster'
    });
  }
  if (!show.fanart) {
    publishUpdateImages({
      action: 'add',
      id: show.id,
      theTvDbId: show.tvdb_id,
      media: 'show',
      type: 'fanart'
    });
  }
  updateEpisodes.filter(episode => !Boolean(episode.image)).forEach(episode => {
    publishUpdateImages({
      action: 'add',
      id: episode.id,
      theTvDbId: episode.tvdb_id,
      media: 'show',
      type: 'episode'
    });
  });
  removedEpisodes.filter(episode => !Boolean(episode.image)).forEach(episode => {
    publishUpdateImages({
      action: 'remove',
      id: episode.id,
      theTvDbId: episode.tvdb_id,
      media: 'show',
      type: 'episode'
    });
  });
}
