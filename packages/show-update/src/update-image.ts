import * as AWS from 'aws-sdk';
import { entities } from '@episodehunter/datastore';
import { logger } from './logger';
import { ImageAction } from './types/image-action';

const sns = new AWS.SNS();

const publishUpdateImages = (obj: ImageAction) => sns
  .publish({
    Message: JSON.stringify(obj),
    TopicArn: ''
  })
  .promise()
  .catch(error => logger.captureException(error));

export function updateImages(show: entities.Show, updateEpisodes: entities.Episode[], removedEpisodes: entities.Episode[]) {
  const actions: ImageAction[] = [];
  if (!show.poster) {
    publishUpdateImages({
      action: 'add',
      id: show.id,
      type: 'showPoster'
    });
  }
  if (!show.fanart) {
    publishUpdateImages({
      action: 'add',
      id: show.id,
      type: 'showFanart'
    });
  }
  updateEpisodes
    .filter(episode => !Boolean(episode.image))
    .forEach(episode => {
      publishUpdateImages({
        action: 'add',
        id: episode.id,
        type: 'episode'
      });
    });
  removedEpisodes
    .filter(episode => !Boolean(episode.image))
    .forEach(episode => {
      publishUpdateImages({
        action: 'remove',
        id: episode.id,
        type: 'episode'
      });
    });
}
