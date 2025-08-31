'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageFile } from '@/lib/types';

interface DropZoneProps {
  onFilesAdded: (files: ImageFile[]) => void;
}

export default function DropZone({ onFilesAdded }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: ImageFile[] = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: 'idle',
        progress: 0,
      }));
      onFilesAdded(newFiles);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxSize: 30 * 1024 * 1024, // 30MB
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {isDragActive ? (
          <p className="text-blue-500 font-medium">Drop the images here...</p>
        ) : (
          <div className="space-y-2">
            <p className="font-medium">Drag & drop images here, or click to select files</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports PNG, JPG, and WebP (max 30MB each)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}