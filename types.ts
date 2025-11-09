
export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '9:16',
  LANDSCAPE = '16:9',
  PHOTO = '4:3',
  WIDE = '3:4',
}

export interface ImageData {
  base64: string;
  mimeType: string;
}
