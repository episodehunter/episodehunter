import * as AWS from 'aws-sdk';
import { Image as ImageMessage } from '@episodehunter/types/sns-message';
import { Logger, entities } from '@episodehunter/kingsguard';

const sns = new AWS.SNS();

const publishUpdateImages = (log: Logger, obj: ImageMessage) =>
  sns
    .publish({
      Message: JSON.stringify(obj),
      TopicArn: ''
    })
    .promise()
    .catch(error => log.captureException(error));

export function updateImages(
  log: Logger,
  show: entities.Show,
  updateEpisodes: entities.Episode[],
  removedEpisodes: entities.Episode[]
) {
  if (!show.poster) {
    publishUpdateImages(log, {
      action: 'add',
      id: show.id,
      theTvDbId: show.tvdb_id,
      media: 'show',
      type: 'poster'
    });
  }
  if (!show.fanart) {
    publishUpdateImages(log, {
      action: 'add',
      id: show.id,
      theTvDbId: show.tvdb_id,
      media: 'show',
      type: 'fanart'
    });
  }
  updateEpisodes.filter(episode => !Boolean(episode.image)).forEach(episode => {
    publishUpdateImages(log, {
      action: 'add',
      id: episode.id,
      theTvDbId: episode.tvdb_id,
      media: 'show',
      type: 'episode'
    });
  });
  removedEpisodes.filter(episode => !Boolean(episode.image)).forEach(episode => {
    publishUpdateImages(log, {
      action: 'remove',
      id: episode.id,
      theTvDbId: episode.tvdb_id,
      media: 'show',
      type: 'episode'
    });
  });
}
