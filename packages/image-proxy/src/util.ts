export interface ImageInformation {
  key: string;
  type: 'episode' | 'fanart' | 'poster';
  width?: number;
  height?: number;
  id: number;
}

export function imageInformation(path: string): ImageInformation | null {
  const result = path.match(/(poster|fanart|episode)\/((\d+|_)x(\d+|_)\/)?(\d+)\..+/);
  if (!result) {
    return null;
  }
  const obj: ImageInformation = {
    key: result[0],
    type: result[1] as 'episode' | 'fanart' | 'poster',
    id: Number(result[5])
  };
  if (result[3] && result[3] !== '_') {
    obj.width = Number(result[3]);
  }
  if (result[4] && result[4] !== '_') {
    obj.height = Number(result[4]);
  }
  return obj;
}
