const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

async function runDatabaseSync() {
  console.log('=================================================================');
  console.log('🛡️ AAPNO KHANO — PRODUCTION DATABASE HARMONIZATION & SECURITY MIGRATION');
  console.log('=================================================================\n');

  try {
    // 1. Update Beverage Prices (2L Drinks = ₹100) and descriptions
    console.log('📦 Updating beverage catalog prices in MySQL...');
    const beverageUpdates = [
      { name: 'Coke 2 litres', price: 100.0, desc: 'Chilled packaged soft drink (2 Litres).' },
      { name: 'Sprite 2 litres', price: 100.0, desc: 'Chilled packaged lemon-lime soft drink (2 Litres).' },
      { name: 'Limca 2 litres', price: 100.0, desc: 'Chilled cloudy lemon fizzy soft drink (2 Litres).' },
      { name: 'Coke 1 litre', price: 50.0, desc: 'Chilled packaged soft drink (1 Litre).' },
      { name: 'Sprite 1 litre', price: 50.0, desc: 'Chilled packaged lemon-lime soft drink (1 Litre).' },
      { name: 'Limca 1 litre', price: 50.0, desc: 'Chilled cloudy lemon fizzy soft drink (1 Litre).' },
      { name: 'Coke 750 ml', price: 40.0, desc: 'Chilled packaged soft drink (750 ml).' },
      { name: 'Sprite 750 ml', price: 40.0, desc: 'Chilled packaged lemon-lime soft drink (750 ml).' },
      { name: 'Limca 750 ml', price: 40.0, desc: 'Chilled cloudy lemon fizzy soft drink (750 ml).' },
      { name: 'Coke 500 ml', price: 30.0, desc: 'Chilled packaged soft drink (500 ml).' },
      { name: 'Sprite 500 ml', price: 30.0, desc: 'Chilled packaged lemon-lime soft drink (500 ml).' },
      { name: 'Limca 500 ml', price: 30.0, desc: 'Chilled cloudy lemon fizzy soft drink (500 ml).' },
      { name: 'Coke 250 ml', price: 20.0, desc: 'Chilled packaged soft drink (250 ml).' },
      { name: 'Sprite 250 ml', price: 20.0, desc: 'Chilled packaged lemon-lime soft drink (250 ml).' },
      { name: 'Limca 250 ml', price: 20.0, desc: 'Chilled cloudy lemon fizzy soft drink (250 ml).' },
      { name: 'Coke Can', price: 50.0, desc: 'Chilled 300 ml Coke Aluminum Can.' },
      { name: 'Diet Coke Can', price: 50.0, desc: 'Chilled 300 ml Zero Sugar Diet Coke Can.' },
      { name: 'Hell Can', price: 60.0, desc: 'Chilled 250 ml Hell Energy drink can.' },
      { name: 'Predator Can', price: 60.0, desc: 'Chilled 250 ml Predator Energy drink can.' },
      { name: 'Bisleri Water', price: 20.0, desc: 'Pure packaged mineral water (1 Litre bottle).' },
      { name: 'Vedica Water', price: 60.0, desc: 'Himalayan spring natural mineral water (1 Litre glass bottle).' },
      { name: 'Kinley Soda', price: 20.0, desc: 'Chilled sparkling carbonated soda (750 ml).' },
      { name: 'Bisleri Soda', price: 20.0, desc: 'Chilled sparkling carbonated club soda (750 ml).' },
      { name: 'Ice Cubes', price: 20.0, desc: 'Food-grade crystal clear chilled ice bucket.' },
    ];

    for (const b of beverageUpdates) {
      const updated = await prisma.product.updateMany({
        where: { name: b.name },
        data: {
          basePrice: b.price,
          description: b.desc,
        },
      });
      if (updated.count > 0) {
        console.log(`  ✓ Updated ${b.name} -> ₹${b.price} (${updated.count} record(s))`);
      }
    }

    // 2. Hash any unhashed user passwords in DB
    console.log('\n🔒 Securing user passwords & PINs in MySQL...');
    const users = await prisma.user.findMany();
    for (const u of users) {
      const updates = {};
      if (u.passwordHash && !u.passwordHash.startsWith('scrypt$') && !u.passwordHash.startsWith('hash_')) {
        updates.passwordHash = hashPassword(u.passwordHash);
      }
      if (Object.keys(updates).length > 0) {
        await prisma.user.update({
          where: { id: u.id },
          data: updates,
        });
        console.log(`  ✓ Upgraded password hash for user: ${u.email}`);
      }
    }

    // 3. Ensure Table QR tokens for Tables 01 to 15
    console.log('\n🏛️ Harmonizing Table QR tokens (Table 01 to 15)...');
    const restaurant = await prisma.restaurant.findFirst({ where: { slug: 'aapno-khano' } });
    if (restaurant) {
      for (let t = 1; t <= 15; t++) {
        const numStr = String(t).padStart(2, '0');
        const token = `table-${numStr}`;
        const existingTable = await prisma.table.findFirst({
          where: { restaurantId: restaurant.id, tableNumber: numStr },
        });

        if (!existingTable) {
          await prisma.table.create({
            data: {
              id: `table-aapno-${numStr}`,
              restaurantId: restaurant.id,
              tableNumber: numStr,
              name: `Table ${numStr}`,
              capacity: t <= 4 ? 2 : t <= 10 ? 4 : 6,
              qrCodeToken: token,
              status: 'AVAILABLE',
            },
          });
          console.log(`  ✓ Created Table ${numStr} (token: ${token})`);
        } else {
          await prisma.table.update({
            where: { id: existingTable.id },
            data: {
              qrCodeToken: token,
              isArchived: false,
            },
          });
        }
      }
    }

    console.log('\n✅ Database harmonization completed successfully!');
  } catch (err) {
    console.error('❌ Database sync error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runDatabaseSync();
