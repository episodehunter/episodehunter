import { connect, Connection, entities } from '@episodehunter/datastore';
import { Image } from './types';

const legacyImageType = {
  fanart: '0',
  episode: '1',
  poster: '2'
};

export function mapImageToDownload(image: Image): { path: string; type: string; media_id: number } {
  const path = image.path;
  const type = legacyImageType[image.type];
  const mediaId = image.type === 'episode' ? image.theTvDbId : image.id;
  return {
    path,
    type,
    media_id: mediaId
  };
}

export async function insertImagesToDownload(images: Image[], connection: Connection) {
  const imageToInsert = images
    .filter(img => img.action !== 'remove')
    .map(img => mapImageToDownload(img))
    .filter(img => Boolean(img.path && img.media_id && img.type));

  if (imageToInsert.length < 1) {
    return;
  }

  return await connection
    .createQueryBuilder()
    .insert()
    .into(entities.ImagesToDownload)
    .values(imageToInsert)
    .execute();
}
