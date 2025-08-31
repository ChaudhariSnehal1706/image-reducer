export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'compressing' | 'compressed' | 'error';
  progress: number;
  compressedUrl?: string;
  originalSize?: number;
  compressedSize?: number;
  error?: string;
}

export interface CompressionResult {
  id: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
}