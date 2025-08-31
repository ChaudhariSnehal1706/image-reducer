'use client';

import { useState } from 'react';
import DropZone from './components/DropZone';
import ImageCard from './components/ImageCard';
import { ImageFile } from '@/lib/types';

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFilesAdded = (newFiles: ImageFile[]) => {
    setImages((prev) => [...prev, ...newFiles]);
  };

  const handleCompress = async (id: string) => {
    // Find the image to compress
    const imageToCompress = images.find((img) => img.id === id);
    if (!imageToCompress) return;

    // Update status to compressing
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, status: 'compressing', progress: 0 } : img
      )
    );

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', imageToCompress.file);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImages((prev) =>
          prev.map((img) => {
            if (img.id === id && img.status === 'compressing' && img.progress < 90) {
              return { ...img, progress: img.progress + 10 };
            }
            return img;
          })
        );
      }, 300);

      // Send to API
      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compress image');
      }

      const result = await response.json();

      // Update image with compressed data
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
                ...img,
                status: 'compressed',
                progress: 100,
                compressedUrl: result.compressedData,
                originalSize: result.originalSize,
                compressedSize: result.compressedSize,
              }
            : img
        )
      );
    } catch (error) {
      console.error('Compression error:', error);
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
                ...img,
                status: 'error',
                progress: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : img
        )
      );
    }
  };

  const handleCompressAll = async () => {
    if (isCompressing) return;
    setIsCompressing(true);

    const imagesToCompress = images.filter((img) => img.status === 'idle');
    for (const image of imagesToCompress) {
      await handleCompress(image.id);
    }

    setIsCompressing(false);
  };

  const handleDownload = (id: string) => {
    const imageToDownload = images.find((img) => img.id === id);
    if (!imageToDownload || !imageToDownload.compressedUrl) return;

    // Create download link
    const link = document.createElement('a');
    link.href = imageToDownload.compressedUrl;
    link.download = `${imageToDownload.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    const compressedImages = images.filter(
      (img) => img.status === 'compressed' && img.compressedUrl
    );

    if (compressedImages.length === 0) return;

    try {
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: compressedImages.map((img) => ({
            name: `${img.file.name}`,
            data: img.compressedUrl,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ZIP file');
      }

      // Create blob from response
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download ZIP file');
    }
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const newImages = prev.filter((img) => img.id !== id);
      // Clean up object URL to prevent memory leaks
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return newImages;
    });
  };

  const handleRemoveAll = () => {
    // Clean up all object URLs
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview);
    });
    setImages([]);
  };

  const compressedCount = images.filter((img) => img.status === 'compressed').length;
  const hasCompressedImages = compressedCount > 0;
  const hasUncompressedImages = images.some((img) => img.status === 'idle');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Image Reducer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compress your images up to 95% while preserving quality
        </p>
      </header>

      <DropZone onFilesAdded={handleFilesAdded} />

      {images.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Images ({images.length})
              {compressedCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  {compressedCount} compressed
                </span>
              )}
            </h2>
            <div className="flex space-x-2">
              {hasUncompressedImages && (
                <button
                  onClick={handleCompressAll}
                  disabled={isCompressing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  {isCompressing ? 'Compressing...' : 'Compress All'}
                </button>
              )}
              {hasCompressedImages && (
                <button
                  onClick={handleDownloadAll}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  Download All
                </button>
              )}
              <button
                onClick={handleRemoveAll}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onCompress={handleCompress}
                onDownload={handleDownload}
                onRemove={handleRemove}
              />
            ))}  
          </div>
        </div>
      )}
    </div>
  );
}
