
import { ImageData } from '../types';

export const fileToImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader result is not a string.'));
      }
      // result is "data:mime/type;base64,..."
      const [header, data] = reader.result.split(',');
      if (!header || !data) {
        return reject(new Error('Invalid file format.'));
      }
      const mimeType = header.split(':')[1].split(';')[0];
      resolve({ base64: data, mimeType });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
