export interface Image {
  media: 'show' | 'movie';
  type: 'poster' | 'fanart' | 'episode';
  action: 'add' | 'remove' | 'update';
  id: number;
  path: string;
}
