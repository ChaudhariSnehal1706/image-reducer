import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { images } = data;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }
    
    const zip = new JSZip();
    
    // Add each image to the zip file
    for (const image of images) {
      const { name, data } = image;
      
      // Extract base64 data
      const base64Data = data.split(',')[1];
      const binaryData = Buffer.from(base64Data, 'base64');
      
      // Add to zip
      zip.file(name, binaryData);
    }
    
    // Generate zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Return as downloadable file
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=images.zip'
      }
    });
  } catch (error) {
    console.error('ZIP creation error:', error);
    return NextResponse.json({ error: 'Failed to create ZIP file' }, { status: 500 });
  }
}