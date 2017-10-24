import { spy } from 'simple-spy';
import { mapImageToDownload, insertImagesToDownload } from '../db.util';
import { Image } from '../types/image';

describe('mapImageToDownload', () => {
  test('Use theTvDb Id for episodes', () => {
    const image: Image = {
      action: 'add',
      id: 1,
      media: 'show',
      type: 'episode',
      path: 'some path',
      theTvDbId: 2
    };

    const result = mapImageToDownload(image);

    expect(result.media_id).toBe(2);
  });

  test('Use db Id for shows', () => {
    const image: Image = {
      action: 'add',
      id: 1,
      media: 'show',
      type: 'poster',
      path: 'some path',
      theTvDbId: 2
    };

    const result = mapImageToDownload(image);

    expect(result.media_id).toBe(1);
  });
});

describe('insertImagesToDownload', () => {
  const connection = {
    createQueryBuilder: () => connection,
    insert: () => connection,
    values: spy(() => connection),
    into: () => connection,
    execute: () => connection
  };

  beforeEach(() => {
    connection.values.reset();
  });

  test('Filter out image to remove', () => {
    const images: Image[] = [
      {
        action: 'remove',
        id: 1,
        media: 'show',
        type: 'poster',
        path: 'some path'
      },
      {
        action: 'add',
        id: 2,
        media: 'show',
        type: 'poster',
        path: 'some path'
      }
    ];

    insertImagesToDownload(images, connection as any);
    expect(connection.values.callCount).toBe(1);
    expect(connection.values.args[0][0].length).toBe(1);
    expect(connection.values.args[0][0][0].media_id).toBe(2);
  });

  test('Do not call the datebase if there is nothing to insert', () => {
    const images: Image[] = [];

    insertImagesToDownload(images, connection as any);
    expect(connection.values.callCount).toBe(0);
  });

  test('Do not insert image that have bad type', () => {
    const images: Image[] = [
      {
        action: 'add',
        id: 1,
        media: 'show',
        type: 'this is bad' as any,
        path: 'some path'
      }
    ];

    insertImagesToDownload(images, connection as any);
    expect(connection.values.callCount).toBe(0);
  });
});
