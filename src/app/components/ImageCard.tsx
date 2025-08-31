'use client';

import Image from 'next/image';
import { ImageFile } from '@/lib/types';
import ProgressBar from './ProgressBar';

interface ImageCardProps {
  image: ImageFile;
  onCompress: (id: string) => void;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ImageCard({ image, onCompress, onDownload, onRemove }: ImageCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRate = () => {
    if (!image.originalSize || !image.compressedSize) return 0;
    const rate = ((image.originalSize - image.compressedSize) / image.originalSize) * 100;
    return Math.round(rate);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm dark:border-gray-700">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
        <Image
          src={image.preview}
          alt={image.file.name}
          fill
          className="object-contain"
        />
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium truncate" title={image.file.name}>
              {image.file.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(image.file.size)}
            </p>
          </div>
          {image.status === 'compressed' && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900/30 dark:text-green-300">
              {getCompressionRate()}% smaller
            </span>
          )}
        </div>

        {image.status === 'compressing' && (
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Compressing...</p>
            <ProgressBar progress={image.progress} />
          </div>
        )}

        {image.status === 'error' && (
          <p className="text-sm text-red-500">{image.error || 'Error compressing image'}</p>
        )}

        <div className="flex space-x-2">
          {image.status === 'idle' && (
            <button
              onClick={() => onCompress(image.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md text-sm font-medium"
            >
              Compress
            </button>
          )}

          {image.status === 'compressed' && (
            <button
              onClick={() => onDownload(image.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-md text-sm font-medium"
            >
              Download
            </button>
          )}

          {image.status === 'error' && (
            <button
              onClick={() => onCompress(image.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md text-sm font-medium"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}