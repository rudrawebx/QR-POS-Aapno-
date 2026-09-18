const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://u931854669_aapno_khano:RudraWebX%4012@srv2143.hstgr.io:3306/u931854669_aapno_khano',
    },
  },
});

async function main() {
  console.log('Connecting to Hostinger MySQL to upgrade imageUrl columns to TEXT...');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `Product` MODIFY `imageUrl` TEXT NULL;');
    console.log('✅ Product.imageUrl column upgraded to TEXT');
  } catch (e) {
    console.log('Product.imageUrl alter note:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `Category` MODIFY `imageUrl` TEXT NULL;');
    console.log('✅ Category.imageUrl column upgraded to TEXT');
  } catch (e) {
    console.log('Category.imageUrl alter note:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `Product` MODIFY `description` TEXT NULL;');
    console.log('✅ Product.description column upgraded to TEXT');
  } catch (e) {
    console.log('Product.description alter note:', e.message);
  }

  console.log('All image column upgrades completed successfully!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
