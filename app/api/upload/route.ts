import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle Multipart Form Data (Direct file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine extension
      let ext = 'jpg';
      if (file.type.includes('png')) ext = 'png';
      else if (file.type.includes('webp')) ext = 'webp';
      else if (file.type.includes('jpeg') || file.type.includes('jpg')) ext = 'jpg';

      const fileName = `dish-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'menu');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/images/menu/${fileName}`;
      return NextResponse.json({ success: true, url: publicUrl });
    }

    // Handle Base64 Data URL in JSON payload
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { dataUrl, filename: originalName } = body;

      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Invalid image data URL' }, { status: 400 });
      }

      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: 'Malformed image data' }, { status: 400 });
      }

      let ext = matches[1].toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      const fileName = `dish-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'menu');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/images/menu/${fileName}`;
      return NextResponse.json({ success: true, url: publicUrl });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 });
  }
}
