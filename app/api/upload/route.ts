import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

function detectImageTypeFromMagicBytes(buf: Buffer): 'png' | 'jpg' | 'webp' | null {
  if (buf.length < 12) return null;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'png';
  }
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpg';
  }
  // WEBP: RIFF....WEBP
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'webp';
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // 1. Handle Multipart Form Data (Direct file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      if (!ALLOWED_MIMES.has(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: 'Unsupported file type. Only PNG, JPG, JPEG, and WEBP images are allowed.' },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'File too large. Maximum allowed image size is 5 MB.' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const detectedExt = detectImageTypeFromMagicBytes(buffer);
      if (!detectedExt) {
        return NextResponse.json(
          { error: 'Invalid or corrupted image file. Executable or non-image files are blocked.' },
          { status: 400 }
        );
      }

      const fileName = `img-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${detectedExt}`;
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'menu');

      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        const publicUrl = `/images/menu/${fileName}`;
        return NextResponse.json({ success: true, url: publicUrl });
      } catch (fsErr) {
        console.warn('Filesystem write fallback, returning dataUrl representation:', fsErr);
        const base64 = buffer.toString('base64');
        const mime = detectedExt === 'png' ? 'image/png' : detectedExt === 'webp' ? 'image/webp' : 'image/jpeg';
        return NextResponse.json({ success: true, url: `data:${mime};base64,${base64}` });
      }
    }

    // 2. Handle Base64 Data URL in JSON payload
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { dataUrl } = body;

      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Invalid image data URL' }, { status: 400 });
      }

      const matches = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
      if (!matches) {
        return NextResponse.json(
          { error: 'Unsupported format. Only PNG, JPG, JPEG, and WEBP images are allowed.' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(matches[2], 'base64');
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'Image size exceeds 5 MB limit.' }, { status: 400 });
      }

      const detectedExt = detectImageTypeFromMagicBytes(buffer);
      if (!detectedExt) {
        return NextResponse.json(
          { error: 'Invalid image binary signature. Upload rejected.' },
          { status: 400 }
        );
      }

      const fileName = `img-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${detectedExt}`;
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'menu');

      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        const publicUrl = `/images/menu/${fileName}`;
        return NextResponse.json({ success: true, url: publicUrl });
      } catch (fsErr) {
        console.warn('Filesystem write fallback:', fsErr);
        return NextResponse.json({ success: true, url: dataUrl });
      }
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 });
  }
}
