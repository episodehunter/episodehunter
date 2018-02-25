// GET series/{id}/images/query?keyType=fanart|poster

export interface TheTvDbShowImage {
  id: number
  keyType: 'fanart' | 'poster'
  subKey: 'text' | 'graphical' | ''
  fileName: string // fanart/original/121361-3.jpg
  resolution: string // 1280x720
  ratingsInfo: {
    average: number
    count: number
  }
  thumbnail: string // _cache/posters/121361-32.jpg
}
