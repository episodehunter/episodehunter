export interface ImageInformation {
  key: string;
  type: 'episode' | 'fanart' | 'poster';
  width?: number;
  height?: number;
  id: number;
}

export function imageInformation(path: string): ImageInformation | null {
  const result = path.match(/(poster|fanart|episode)\/((\d+)x(\d+)\/)?(\d+)\..+/);
  if (!result) {
    return null;
  }
  const obj: ImageInformation = {
    key: result[0],
    type: result[1] as 'episode' | 'fanart' | 'poster',
    id: Number(result[5])
  };
  if (result[3]) {
    obj.width = Number(result[3]);
  }
  if (result[4]) {
    obj.height = Number(result[4]);
  }
  return obj;
}
