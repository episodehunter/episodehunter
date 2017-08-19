export interface TheTvDbShowImages {
  id: number;
  keyType: 'fanart' | 'poster';
  subKey: string;
  fileName: string; // fanart/original/121361-3.jpg
  resolution: string; // 1280x720
  ratingsInfo: {
    average: number;
    count: number;
  };
  thumbnail: string;
}
