export interface ImageAction {
  id: number;
  type: 'showPoster' | 'showFanart' | 'episode';
  action: 'update' | 'add' | 'remove';
}
