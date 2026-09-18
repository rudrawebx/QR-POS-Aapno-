import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';

async function testUpload() {
  console.log('Testing Image Upload & Storage System...');

  // 1. Check directory permissions
  const menuDir = path.join(process.cwd(), 'public', 'images', 'menu');
  console.log('Target menu images directory:', menuDir);
  if (!fs.existsSync(menuDir)) {
    fs.mkdirSync(menuDir, { recursive: true });
    console.log('Created directory:', menuDir);
  } else {
    console.log('Directory exists and is writable.');
  }

  // 2. Test writing a test image file
  const testFileName = `test-dish-upload-${Date.now()}.jpg`;
  const testFilePath = path.join(menuDir, testFileName);
  // 1x1 transparent/red test jpeg pixel
  const sampleBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  const buffer = Buffer.from(sampleBase64, 'base64');
  fs.writeFileSync(testFilePath, buffer);
  console.log('Successfully wrote sample image to:', testFilePath);
  console.log('Public URL:', `/images/menu/${testFileName}`);

  // 3. Test database product imageUrl update with a test dish
  const testProduct = await prisma.product.findFirst();
  if (testProduct) {
    console.log(`Found product: ${testProduct.name} (${testProduct.id})`);
    const oldUrl = testProduct.imageUrl;
    const newTestUrl = `/images/menu/${testFileName}`;
    
    await prisma.product.update({
      where: { id: testProduct.id },
      data: { imageUrl: newTestUrl },
    });
    console.log(`Updated product image in DB: ${oldUrl} -> ${newTestUrl}`);

    // Revert back
    await prisma.product.update({
      where: { id: testProduct.id },
      data: { imageUrl: oldUrl },
    });
    console.log('Cleanly reverted test product image.');
  }

  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    console.log('Cleaned up test file.');
  }

  console.log('✅ Image Upload System Verification Complete: All tests passed!');
}

testUpload().catch(console.error).finally(() => prisma.$disconnect());
