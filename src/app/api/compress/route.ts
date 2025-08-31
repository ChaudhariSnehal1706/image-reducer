import { NextRequest, NextResponse } from 'next/server';
import { compressImage } from '@/lib/imageProcessor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Check file size (30MB limit)
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 30MB)' }, { status: 400 });
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const compressedBuffer = await compressImage(buffer, file.type);
    
    return NextResponse.json({
      originalSize: file.size,
      compressedSize: compressedBuffer.length,
      compressedData: `data:${file.type};base64,${compressedBuffer.toString('base64')}`
    });
  } catch (error) {
    console.error('Compression error:', error);
    return NextResponse.json({ error: 'Failed to compress image' }, { status: 500 });
  }
}