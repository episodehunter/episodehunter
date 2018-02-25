export interface ImageInformation {
  key: string;
  type: 'episode' | 'fanart' | 'poster';
  width?: number;
  height?: number;
  id: number;
}

export function imageInformation(path: string): ImageInformation {
  const result = path.match(/(poster|fanart|episode)\/((\d+)x(\d+)\/)?(\d+)\..+/);
  if (!result) {
    return null;
  }
  return {
    key: result[0],
    type: result[1] as 'episode' | 'fanart' | 'poster',
    width: result[3] && Number(result[3]),
    height: result[4] && Number(result[4]),
    id: Number(result[5])
  };
}
