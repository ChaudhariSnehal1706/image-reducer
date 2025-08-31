// This file will be used by the API routes
import sharp from 'sharp';

export async function compressImage(buffer: Buffer, format: string): Promise<Buffer> {
  let processor = sharp(buffer);
  
  // Determine output format based on input
  if (format === 'image/jpeg' || format === 'image/jpg') {
    processor = processor.jpeg({ quality: 20, mozjpeg: true });
  } else if (format === 'image/png') {
    processor = processor.png({ quality: 20, compressionLevel: 9 });
  } else if (format === 'image/webp') {
    processor = processor.webp({ quality: 20 });
  }
  
  return processor.toBuffer();
}