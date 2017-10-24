export interface Image {
  media: 'show' | 'movie';
  type: 'poster' | 'fanart' | 'episode';
  action: 'add' | 'remove' | 'update';
  /**
   * Id of medium in db. eg. show id or episode id
   */
  id: number;
  /**
   * The tv db Id of medium. Still in use for episode image
   */
  theTvDbId?: number;
  /**
   * Path (url) to the image
   */
  path: string;
}
