import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

async function main() {
  console.log('🌱 Starting Aapno Khaano QSR database seeding with complete authentic menu, recipe BOMs and inventory...');

  // 1. Subscription Plans
  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      name: 'QSR Starter Plan',
      slug: 'starter',
      monthlyPrice: 999,
      yearlyPrice: 9990,
      currency: 'INR',
      maxBranches: 1,
      maxTables: 20,
      maxOrdersPerMonth: 1000,
      maxStaffUsers: 5,
      hasKds: true,
      hasMultiStation: false,
      hasInventory: false,
      hasCustomBranding: true,
      hasAdvancedReports: false,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: 'professional' },
    update: {},
    create: {
      name: 'QSR Professional Plan',
      slug: 'professional',
      monthlyPrice: 2499,
      yearlyPrice: 24990,
      currency: 'INR',
      maxBranches: 3,
      maxTables: 50,
      maxOrdersPerMonth: 5000,
      maxStaffUsers: 15,
      hasKds: true,
      hasMultiStation: true,
      hasInventory: true,
      hasCustomBranding: true,
      hasAdvancedReports: true,
    },
  });

  // 2. Super Admin User
  await prisma.user.upsert({
    where: { email: 'admin@restro.com' },
    update: {},
    create: {
      name: 'Aapno Khaano Platform Admin',
      email: 'admin@restro.com',
      passwordHash: hashPassword('admin123'),
      role: 'SUPER_ADMIN',
      phone: '+91 99962 13962',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 3. Restaurant: "Aapno Khaano"
  const aapnoKhano = await prisma.restaurant.upsert({
    where: { slug: 'aapno-khano' },
    update: {
      name: 'आपणो खाणो (Aapno Khaano)',
      logoUrl: '/images/aapno-khano-logo.png',
      phone: '+91 99962 13962',
      email: 'contact@aapnokhano.com',
      address: 'Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053',
      city: 'Fatehabad',
      state: 'Haryana',
      postalCode: '125053',
      gstin: '08AABCU9603R1ZM',
      fssaiNumber: '12224026000189',
    },
    create: {
      name: 'आपणो खाणो (Aapno Khaano)',
      slug: 'aapno-khano',
      uniqueUsername: 'skdahiya1007',
      logoUrl: '/images/aapno-khano-logo.png',
      bannerUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop&q=80',
      description: 'Authentic Royal Rajasthani & North Indian Handi Specialties • Car Service • QSR Drive-In',
      cuisine: 'Rajasthani Handi, Tandoor & Wok Curries',
      phone: '+91 99962 13962',
      email: 'contact@aapnokhano.com',
      address: 'Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053',
      city: 'Fatehabad',
      state: 'Haryana',
      postalCode: '125053',
      country: 'India',
      currency: 'INR',
      currencySymbol: '₹',
      timezone: 'Asia/Kolkata',
      gstin: '08AABCU9603R1ZM',
      fssaiNumber: '12224026000189',
      commissionRate: 0.0,
    },
  });

  // Restaurant Settings with exact PNB UPI details and brand palette
  await prisma.restaurantSettings.upsert({
    where: { restaurantId: aapnoKhano.id },
    update: {
      isRestaurantOpen: true,
      openingHoursText: '11:00 AM - 11:30 PM',
      closureMessage: 'We are currently closed for orders. Please visit during regular hours.',
      upiId: '9996213962m@pnb',
      upiMerchantName: 'AAPNO KHANO',
      upiQrImageUrl: '/images/pnb-upi-qr.png',
      razorpayKeyId: 'rzp_test_TWIx6ekD7pnyCY',
      razorpayKeySecret: 'Zbn2W1RvnXnWFT2dMxVldrjT',
      taxRateGst: 5.0,
      serviceChargeRate: 0.0,
      autoPrintKot: true,
      autoAcceptOrders: true,
      soundAlertsEnabled: true,
      defaultReceiptFooter: 'Padharo Mhare Desh! Thank you for visiting Aapno Khaano. Taste the Royal Heritage.',
      invoicePrefix: 'AK-2026-',
      kotPrefix: 'KOT-',
      themePrimaryColor: '#AA1B2A',
      themeGoldColor: '#E09D3D',
      supportWhatsappNumber: '+919996213962',
      instagramUrl: 'https://www.instagram.com/aapnokhano',
      facebookUrl: 'https://www.facebook.com/aapnokhano',
      googleMapsUrl: 'https://maps.google.com/?q=Aapno+Khaano',
    },
    create: {
      restaurantId: aapnoKhano.id,
      isRestaurantOpen: true,
      openingHoursText: '11:00 AM - 11:30 PM',
      closureMessage: 'We are currently closed for orders. Please visit during regular hours.',
      taxRateGst: 5.0,
      serviceChargeRate: 0.0,
      packagingCharge: 0.0,
      isTaxInclusive: false,
      autoPrintKot: true,
      autoAcceptOrders: true,
      soundAlertsEnabled: true,
      allowGuestCheckout: true,
      requireCustomerPhone: true,
      requireCarNumber: true,
      allowTableReservations: false,
      defaultReceiptFooter: 'Padharo Mhare Desh! Thank you for visiting Aapno Khaano. Taste the Royal Heritage.',
      invoicePrefix: 'AK-2026-',
      kotPrefix: 'KOT-',
      upiId: '9996213962m@pnb',
      upiMerchantName: 'AAPNO KHANO',
      upiQrImageUrl: '/images/pnb-upi-qr.png',
      upiQrEnabled: true,
      razorpayKeyId: 'rzp_test_TWIx6ekD7pnyCY',
      razorpayKeySecret: 'Zbn2W1RvnXnWFT2dMxVldrjT',
      themePrimaryColor: '#AA1B2A',
      themeGoldColor: '#E09D3D',
      supportWhatsappNumber: '+919996213962',
    },
  });

  // Hours
  for (let day = 0; day < 7; day++) {
    await prisma.restaurantHours.upsert({
      where: {
        restaurantId_dayOfWeek: {
          restaurantId: aapnoKhano.id,
          dayOfWeek: day,
        },
      },
      update: {},
      create: {
        restaurantId: aapnoKhano.id,
        dayOfWeek: day,
        openTime: '11:00',
        closeTime: '23:45',
        isClosed: false,
      },
    });
  }

  // Branch
  const mainBranch = await prisma.branch.upsert({
    where: { id: 'branch-aapno-main' },
    update: {},
    create: {
      id: 'branch-aapno-main',
      restaurantId: aapnoKhano.id,
      name: 'Main Highway Drive-In & Kitchen',
      slug: 'main',
      address: 'Main Highway Plaza, Jaipur',
      phone: '+91 99962 13962',
      isMain: true,
      isActive: true,
    },
  });

  // Kitchen Stations
  const mainKitchen = await prisma.kitchenStation.upsert({
    where: { id: 'station-main-kitchen' },
    update: {},
    create: {
      id: 'station-main-kitchen',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      name: 'Wok & Handi Station',
      slug: 'main-kitchen',
      isAutoPrint: true,
    },
  });

  const tandoorStation = await prisma.kitchenStation.upsert({
    where: { id: 'station-tandoor' },
    update: {},
    create: {
      id: 'station-tandoor',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      name: 'Tandoor & Charcoal Grill',
      slug: 'tandoor-station',
      isAutoPrint: true,
    },
  });

  const snacksStation = await prisma.kitchenStation.upsert({
    where: { id: 'station-snacks' },
    update: {},
    create: {
      id: 'station-snacks',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      name: 'Crispy Snacks & Chaat Counter',
      slug: 'snacks-station',
      isAutoPrint: true,
    },
  });

  // Tables with QR Code Tokens
  for (let t = 1; t <= 15; t++) {
    const tableNum = String(t).padStart(2, '0');
    const tableId = `table-aapno-${tableNum}`;
    const token = `table-${tableNum}`;
    await prisma.table.upsert({
      where: { id: tableId },
      update: {},
      create: {
        id: tableId,
        restaurantId: aapnoKhano.id,
        branchId: mainBranch.id,
        tableNumber: tableNum,
        name: `Table ${tableNum}`,
        capacity: t <= 4 ? 2 : t <= 10 ? 4 : 6,
        qrCodeToken: token,
      },
    });
  }

  // Staff Users
  await prisma.user.upsert({
    where: { email: 'vinod@aapnokhano.com' },
    update: {},
    create: {
      name: 'Vinod (SaaS Super Admin)',
      email: 'vinod@aapnokhano.com',
      passwordHash: hashPassword('Khano#Aapno@Sector3'),
      role: 'SUPER_ADMIN',
      phone: '+91 99962 13962',
      pinCode: '0000',
    },
  });

  await prisma.user.upsert({
    where: { email: 'fatehabad@aapnokhano.com' },
    update: {},
    create: {
      name: 'Fatehabad Store Owner',
      email: 'fatehabad@aapnokhano.com',
      passwordHash: hashPassword('Fatehabad#Aapno@Sector3'),
      role: 'OWNER',
      phone: '+91 99962 13962',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      pinCode: '1111',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ftd.mngr@aapnokhano.com' },
    update: {},
    create: {
      name: 'Fatehabad Store Manager',
      email: 'ftd.mngr@aapnokhano.com',
      passwordHash: hashPassword('FTDmngr#Aapno@Sector3'),
      role: 'MANAGER',
      phone: '+91 99962 13965',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      pinCode: '2222',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ftd.cashier@aapnokhano.com' },
    update: {},
    create: {
      name: 'Fatehabad Billing Cashier',
      email: 'ftd.cashier@aapnokhano.com',
      passwordHash: hashPassword('FTDcashier#Aapno@Sector3'),
      role: 'CASHIER',
      phone: '+91 99962 13963',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      pinCode: '3333',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ftd.kitchen@aapnokhano.com' },
    update: {},
    create: {
      name: 'Fatehabad Head Chef',
      email: 'ftd.kitchen@aapnokhano.com',
      passwordHash: hashPassword('FTDKitchen#Aapno@Sector3'),
      role: 'KITCHEN',
      phone: '+91 99962 13964',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      pinCode: '4444',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ftd.waiter@aapnokhano.com' },
    update: {},
    create: {
      name: 'Fatehabad Waiter & Captain',
      email: 'ftd.waiter@aapnokhano.com',
      passwordHash: hashPassword('Ftdwaiter#Aapno@Sector3'),
      role: 'WAITER',
      phone: '+91 99962 13966',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      pinCode: '5555',
    },
  });

  // 4. Raw Ingredients & Supplier
  const primarySupplier = await prisma.supplier.upsert({
    where: { id: 'sup-raj-dairy' },
    update: {},
    create: {
      id: 'sup-raj-dairy',
      restaurantId: aapnoKhano.id,
      name: 'Rajasthan Royal Dairy & Farm Supplies',
      contactPerson: 'Kailash Choudhary',
      phone: '+91 98290 12345',
      address: 'Dairy Zone, Jaipur Highway',
    },
  });

  const ingredientsData = [
    { id: 'ing-paneer', name: 'Fresh Malai Paneer', unit: 'KG', stock: 45.0, min: 10.0, cost: 320 },
    { id: 'ing-butter', name: 'Amul Desi Butter', unit: 'KG', stock: 30.0, min: 8.0, cost: 480 },
    { id: 'ing-cream', name: 'Rich Dairy Fresh Cream', unit: 'KG', stock: 25.0, min: 5.0, cost: 220 },
    { id: 'ing-ghee', name: 'Pure Vedic Desi Ghee', unit: 'KG', stock: 50.0, min: 10.0, cost: 650 },
    { id: 'ing-rice', name: 'Royal Aged Basmati Rice', unit: 'KG', stock: 100.0, min: 20.0, cost: 110 },
    { id: 'ing-flour', name: 'MP Sharbati Wheat Flour', unit: 'KG', stock: 120.0, min: 30.0, cost: 42 },
    { id: 'ing-urad', name: 'Black Urad Dal (Makhani)', unit: 'KG', stock: 60.0, min: 15.0, cost: 135 },
    { id: 'ing-chicken', name: 'Fresh Grade-A Chicken', unit: 'KG', stock: 35.0, min: 10.0, cost: 210 },
    { id: 'ing-spices', name: 'Aapno Shahi Garam Masala Blend', unit: 'KG', stock: 15.0, min: 3.0, cost: 580 },
  ];

  const createdIngredients: Record<string, any> = {};
  for (const ing of ingredientsData) {
    const createdIng = await prisma.ingredient.upsert({
      where: { id: ing.id },
      update: { currentStock: ing.stock, minStockAlert: ing.min, unitCost: ing.cost },
      create: {
        id: ing.id,
        restaurantId: aapnoKhano.id,
        name: ing.name,
        unit: ing.unit,
        currentStock: ing.stock,
        minStockAlert: ing.min,
        unitCost: ing.cost,
        supplierId: primarySupplier.id,
      },
    });
    createdIngredients[ing.id] = createdIng;
  }

  // 5. Clean & Seed 10 Exact Categories
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.kotItem.deleteMany();
  await prisma.orderItemModifier.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.kot.deleteMany();
  await prisma.paymentSplit.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productModifierGroup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany({ where: { restaurantId: aapnoKhano.id } });

  const categoriesData = [
    { name: 'To Begin With Green', slug: 'to-begin-with-green', desc: 'Fresh crispy chats and tangy starters', icon: 'Salad', isVeg: true },
    { name: 'Salad', slug: 'salad', desc: 'Garden fresh salads and tandoori roasted greens', icon: 'Utensils', isVeg: true },
    { name: 'First Course', slug: 'first-course', desc: 'Crunchy papads and royal masala baskets', icon: 'Layers', isVeg: true },
    { name: 'To Begin With Malai and Crispy', slug: 'malai-and-crispy', desc: 'Golden fried crispy appetizers & cheesy bites', icon: 'Sparkles', isVeg: true },
    { name: 'Veg Bites From the Tandoor', slug: 'veg-tandoor-bites', desc: 'Clay oven charred tikkas and succulent chaaps', icon: 'Flame', isVeg: true },
    { name: 'The Main Affair From the Wok and Handi — Veg', slug: 'main-course-veg', desc: 'Rich slow-cooked daals, paneer curries and handi biryani', icon: 'Soup', isVeg: true },
    { name: "Let's Try Red and White Snacks", slug: 'red-white-snacks', desc: 'Egg delicacies, desi ghee omelettes and golden chicken bites', icon: 'Egg', isVeg: false },
    { name: 'Non-Veg Bites From the Tandoor', slug: 'non-veg-tandoor-bites', desc: 'Smoky chicken tikkas, seekh kebabs and royal non-veg platters', icon: 'Flame', isVeg: false },
    { name: 'The Main Affair From the Wok and Handi — Non-Veg', slug: 'main-course-non-veg', desc: 'Home style chicken handi, butter chicken & mutton specials', icon: 'CookingPot', isVeg: false },
    { name: 'Indian Breads and Sides', slug: 'indian-breads-sides', desc: 'Fresh tandoor rotis, missi rotis and pure desi ghee churma', icon: 'Cookie', isVeg: true },
  ];

  const createdCategories: Record<string, any> = {};

  for (let i = 0; i < categoriesData.length; i++) {
    const cat = categoriesData[i];
    const created = await prisma.category.create({
      data: {
        restaurantId: aapnoKhano.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.desc,
        icon: cat.icon,
        isVegCategory: cat.isVeg,
        displayOrder: i + 1,
      },
    });
    createdCategories[cat.slug] = created;
  }

  // 6. Complete 60+ Products with exact prices and selectable Half/Full & Small/Large variations
  const menuItems = [
    // 1. To Begin With Green
    { cat: 'to-begin-with-green', station: snacksStation.id, name: 'Sweet Corn Chat', localName: 'स्वीट कॉर्न चाट', price: 69, isVeg: true, img: '/images/menu/p-1-sweet-corn-chat.png' },
    { cat: 'to-begin-with-green', station: snacksStation.id, name: 'Chana Chat', localName: 'चना चाट', price: 79, isVeg: true, img: '/images/menu/p-2-chana-chat.png' },
    { cat: 'to-begin-with-green', station: snacksStation.id, name: 'Sprouts Chat', localName: 'स्प्राउट्स चाट', price: 99, isVeg: true, img: '/images/menu/p-3-sprouts-chat.png' },
    { cat: 'to-begin-with-green', station: snacksStation.id, name: 'Fruit Chat', localName: 'फ्रूट चाट', price: 109, isVeg: true, img: '/images/menu/p-4-fruit-chat.png' },
    { cat: 'to-begin-with-green', station: snacksStation.id, name: 'Pineapple Chat', localName: 'पाइनएप्पल चाट', price: 129, isVeg: true, img: '/images/menu/p-5-pineapple-chat.png' },
    { cat: 'to-begin-with-green', station: snacksStation.id, name: 'Sirka Onion Rings', localName: 'सिरका अनियन', price: 79, isVeg: true, img: '/images/menu/p-6-sirka-onion-rings.png' },

    // 2. Salad
    { cat: 'salad', station: snacksStation.id, name: 'Green Salad', localName: 'ग्रीन सलाद', price: 99, isVeg: true, img: '/images/menu/p-7-green-salad.png' },
    { cat: 'salad', station: snacksStation.id, name: 'Special Lettuce Salad', localName: 'स्पेशल लेटस सलाद', price: 149, isVeg: true, img: '/images/menu/p-8-special-lettuce-salad.png' },
    { cat: 'salad', station: snacksStation.id, name: 'Cream Kachumber Salad', localName: 'क्रीम कचुम्बर', price: 149, isVeg: true, img: '/images/menu/p-9-cream-kachumber-salad.jpg' },
    { cat: 'salad', station: tandoorStation.id, name: 'Tandoori Honey Cauliflower', localName: 'तंदूरी हनी गोभी', price: 179, isVeg: true, img: '/images/menu/p-10-tandoori-honey-cauliflower.png' },
    { cat: 'salad', station: tandoorStation.id, name: 'Tandoori Pineapple', localName: 'तंदूरी पाइनएप्पल', price: 249, isVeg: true, img: '/images/menu/p-11-tandoori-pineapple.png' },

    // 3. First Course
    { cat: 'first-course', station: snacksStation.id, name: 'Tandoori Papad (2 Pieces)', localName: 'तंदूरी पापड़', price: 49, isVeg: true, img: '/images/menu/p-12-tandoori-papad-2-pieces.png' },
    { cat: 'first-course', station: snacksStation.id, name: 'Fried Papad (2 Pieces)', localName: 'फ्राइड पापड़', price: 69, isVeg: true, img: '/images/menu/p-13-fried-papad-2-pieces.png' },
    { cat: 'first-course', station: snacksStation.id, name: 'Masala Papad', localName: 'मसाला पापड़', price: 99, isVeg: true, img: '/images/menu/p-14-masala-papad.png' },
    { cat: 'first-course', station: snacksStation.id, name: 'Papad Basket', localName: 'पापड़ बास्केट', price: 189, isVeg: true, img: '/images/menu/p-15-papad-basket.png' },

    // 4. To Begin With Malai and Crispy
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Malai Sweet Corn', localName: 'मलाई स्वीट कॉर्न', price: 69, isVeg: true, img: '/images/menu/p-16-malai-sweet-corn.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'French Fries', localName: 'फ्रेंच फ्राइज', price: 99, isVeg: true, img: '/images/menu/p-17-french-fries.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Roasted Mix Nuts', localName: 'रोस्टेड मिक्स्ड नट्स', price: 109, isVeg: true, img: '/images/menu/p-18-roasted-mix-nuts.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Crispy Corn', localName: 'क्रिस्पी कॉर्न', price: 189, isVeg: true, img: '/images/menu/p-19-crispy-corn.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Mushroom Duplex', localName: 'मशरूम डुप्लेक्स', price: 199, isVeg: true, img: '/images/menu/p-20-mushroom-duplex.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Cheese Corn Ball', localName: 'चीज कॉर्न बॉल', price: 219, isVeg: true, img: '/images/menu/p-21-cheese-corn-ball.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Paneer Nuggets', localName: 'पनीर नगेट्स', price: 219, isVeg: true, img: '/images/menu/p-22-paneer-nuggets.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Chilly Paneer Dry', localName: 'चिली पनीर ड्राई', price: 219, isVeg: true, img: '/images/menu/p-23-chilly-paneer-dry.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Chilly Mushroom Dry', localName: 'चिली मशरूम ड्राई', price: 219, isVeg: true, img: '/images/menu/p-24-chilly-mushroom-dry.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Dahi Ke Solay', localName: 'दही के शोले', price: 249, isVeg: true, img: '/images/menu/p-25-dahi-ke-solay.jpg' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Dahi Kabab', localName: 'दही कबाब', price: 269, isVeg: true, img: '/images/menu/p-26-dahi-kabab.png' },
    { cat: 'malai-and-crispy', station: snacksStation.id, name: 'Crispy Platter', localName: 'शाही क्रिस्पी प्लेटर', price: 399, isVeg: true, desc: 'Includes Mushroom Duplex, Cheese Corn Ball, Paneer Nuggets, Dahi Ke Solay, and Dahi Kabab.', img: '/images/menu/p-27-crispy-platter.png', bestseller: true },

    // 5. Veg Bites From the Tandoor
    { cat: 'veg-tandoor-bites', station: tandoorStation.id, name: 'Masala Chaap', localName: 'मसाला चाप', price: 219, isVeg: true, img: '/images/menu/p-28-masala-chaap.png' },
    { cat: 'veg-tandoor-bites', station: tandoorStation.id, name: 'Lemon Chaap', localName: 'लेमन चाप', price: 229, isVeg: true, img: '/images/menu/p-29-lemon-chaap.png' },
    { cat: 'veg-tandoor-bites', station: tandoorStation.id, name: 'Malai Chaap', localName: 'मलाई चाप', price: 239, isVeg: true, img: '/images/menu/p-30-malai-chaap.png' },
    { cat: 'veg-tandoor-bites', station: tandoorStation.id, name: 'Afghani Kali Mirch Chaap', localName: 'अफगानी चाप', price: 249, isVeg: true, img: '/images/menu/p-31-afghani-kali-mirch-chaap.png' },
    { cat: 'veg-tandoor-bites', station: tandoorStation.id, name: 'Veg Seekh Kabab', localName: 'वेज सीख कबाब', price: 249, isVeg: true, img: '/images/menu/p-32-veg-seekh-kabab.png' },
    { cat: 'veg-tandoor-bites', station: tandoorStation.id, name: 'Paneer Tikka', localName: 'शाही पनीर टिक्का', price: 249, isVeg: true, hasBOM: true, img: '/images/menu/p-33-paneer-tikka.png', bestseller: true },
    { cat: 'veg-tandoor-bites', station: tandoorStation.id, name: 'Paneer Malai Tikka', localName: 'पनीर मलाई टिक्का', price: 259, isVeg: true, img: '/images/menu/p-34-paneer-malai-tikka.png' },
    { cat: 'veg-tandoor-bites', station: tandoorStation.id, name: 'Mushroom Tikka', localName: 'मशरूम टिक्का', price: 259, isVeg: true, img: '/images/menu/p-35-mushroom-tikka.png' },
    { cat: 'veg-tandoor-bites', station: tandoorStation.id, name: 'Tandoori Veg Platter', localName: 'शाही तंदूरी प्लेटर', price: 599, isVeg: true, desc: 'Includes Lemon Chaap, Malai Chaap, Veg Seekh Kabab, Paneer Tikka, and Mushroom Tikka.', img: '/images/menu/p-36-tandoori-veg-platter.png', bestseller: true },

    // 6. The Main Affair From the Wok and Handi — Veg
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Dal Tadka Handi', localName: 'दाल तड़का हांड़ी', price: 179, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/The Main Affair From the Wok & Handi/Dal Tadka Handi.png' },
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Dal Makhani Handi', localName: 'शाही दाल मखनी हांड़ी', price: 199, isVeg: true, hasBOM: true, img: '/images/dishes/Aapno Khano (Veg)/The Main Affair From the Wok & Handi/Dal Makhani Handi.png', bestseller: true },
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Mix Veg', localName: 'मिक्स वेज', price: 219, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/The Main Affair From the Wok & Handi/Mix Veg.png' },
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Matar Mushroom', localName: 'मटर मशरूम', price: 239, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/The Main Affair From the Wok & Handi/Matar Mushroom.png' },
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Hare Chhole Mushroom (Seasonal)', localName: 'हरे छोले मशरूम', price: 239, isVeg: true, img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600' },
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Kadhai Paneer', localName: 'कढ़ाई पनीर', price: 269, isVeg: true, hasBOM: true, img: '/images/menu/p-44-kadhai-paneer.png', bestseller: true },
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Rajshahi Paneer Handi', localName: 'राजशाही पनीर हांड़ी', price: 279, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/The Main Affair From the Wok & Handi/Rajshahi Paneer Handi.png' },
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Paneer Bhurji', localName: 'पनीर भुर्जी', price: 279, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/The Main Affair From the Wok & Handi/Paneer Bhurji.png' },
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Kair Sangri Handi', localName: 'शाही कैर सांगरी', price: 289, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/The Main Affair From the Wok & Handi/Kair Sangri.png', bestseller: true },
    { cat: 'main-course-veg', station: mainKitchen.id, name: 'Veg Biryani Handi', localName: 'दम वेज बिरयानी', price: 349, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/The Main Affair From the Wok & Handi/Veg Biryani.png' },

    // 7. Let's Try Red and White Snacks (Non-Veg 🔴)
    { cat: 'red-white-snacks', station: snacksStation.id, name: 'Boiled Egg', localName: 'उबले अंडे', price: 49, isVeg: false, img: '/images/dishes/Aapno Khano (Non-Veg)/Lets Try Red & White Snacks/Boiled Egg.png' },
    { cat: 'red-white-snacks', station: snacksStation.id, name: 'Egg Bhurji (Desi Ghee)', localName: 'अंडा भुर्जी देशी घी', price: 99, isVeg: false, img: '/images/dishes/Aapno Khano (Non-Veg)/Lets Try Red & White Snacks/Egg Bhurji (Desi Ghee).png' },
    { cat: 'red-white-snacks', station: snacksStation.id, name: 'Boiled Egg Bhurji (Desi Ghee)', localName: 'उबले अंडे की भुर्जी', price: 119, isVeg: false, img: '/images/dishes/Aapno Khano (Non-Veg)/Lets Try Red & White Snacks/Boiled Egg Bhurji (Desi Ghee).png' },
    { cat: 'red-white-snacks', station: snacksStation.id, name: 'Omelette (Desi Ghee)', localName: 'आमलेट देशी घी', price: 99, isVeg: false, img: '/images/dishes/Aapno Khano (Non-Veg)/Lets Try Red & White Snacks/Omelette (Desi Ghee).png' },
    { cat: 'red-white-snacks', station: snacksStation.id, name: 'Omelette with Multigrain Bread (Desi Ghee)', localName: 'मल्टीग्रेन ब्रेड आमलेट', price: 129, isVeg: false, img: '/images/dishes/Aapno Khano (Non-Veg)/Lets Try Red & White Snacks/Omelette with Multigrain Bread (Desi Ghee).png' },
    { cat: 'red-white-snacks', station: snacksStation.id, name: 'Chicken Nuggets', localName: 'चिकन नगेट्स', price: 219, isVeg: false, img: '/images/dishes/Aapno Khano (Non-Veg)/Lets Try Red & White Snacks/Chicken Nuggets.png' },
    { cat: 'red-white-snacks', station: snacksStation.id, name: 'Golden Leg/Chest', localName: 'गोल्डन चिकन लेग/चेस्ट', price: 279, isVeg: false, hasVar: true, varType: 'SMALL_LARGE', pSmall: 279, pLarge: 529, img: '/images/dishes/Aapno Khano (Non-Veg)/Lets Try Red & White Snacks/Golden Leg_Chest.png', bestseller: true },

    // 8. Non-Veg Bites From the Tandoor (🔴)
    { cat: 'non-veg-tandoor-bites', station: tandoorStation.id, name: 'Tandoori Leg/Chest', localName: 'तंदूरी लेग/चेस्ट', price: 299, isVeg: false, hasVar: true, varType: 'SMALL_LARGE', pSmall: 299, pLarge: 549, img: '/images/dishes/Aapno Khano (Non-Veg)/Non Veg Bites From the Tandoor/Tandoori Leg Chest.png', bestseller: true },
    { cat: 'non-veg-tandoor-bites', station: tandoorStation.id, name: 'Tandoori Lemon Leg/Chest', localName: 'तंदूरी लेमन लेग', price: 319, isVeg: false, hasVar: true, varType: 'SMALL_LARGE', pSmall: 319, pLarge: 579, img: '/images/dishes/Aapno Khano (Non-Veg)/Non Veg Bites From the Tandoor/Tandoori Lemon Leg Chest.png' },
    { cat: 'non-veg-tandoor-bites', station: tandoorStation.id, name: 'Afghani Leg/Chest', localName: 'अफगानी चिकन', price: 329, isVeg: false, hasVar: true, varType: 'SMALL_LARGE', pSmall: 329, pLarge: 589, img: '/images/dishes/Aapno Khano (Non-Veg)/Non Veg Bites From the Tandoor/Afghani Leg Chest.png' },
    { cat: 'non-veg-tandoor-bites', station: tandoorStation.id, name: 'Seekh Kabab', localName: 'चिकन सीख कबाब', price: 349, isVeg: false, img: '/images/dishes/Aapno Khano (Non-Veg)/Non Veg Bites From the Tandoor/Seekh Kabab.png', bestseller: true },
    { cat: 'non-veg-tandoor-bites', station: tandoorStation.id, name: 'Chicken Tikka', localName: 'चिकन टिक्का', price: 299, isVeg: false, hasVar: true, varType: 'SMALL_LARGE', pSmall: 299, pLarge: 549, img: '/images/dishes/Aapno Khano (Non-Veg)/Non Veg Bites From the Tandoor/Chicken Tikka.png' },
    { cat: 'non-veg-tandoor-bites', station: tandoorStation.id, name: 'Chicken Malai Tikka', localName: 'चिकन मलाई टिक्का', price: 319, isVeg: false, hasVar: true, varType: 'SMALL_LARGE', pSmall: 319, pLarge: 569, img: '/images/dishes/Aapno Khano (Non-Veg)/Non Veg Bites From the Tandoor/Chicken Malai Tikka.png' },
    { cat: 'non-veg-tandoor-bites', station: tandoorStation.id, name: 'Tandoori Stuffed Leg', localName: 'स्टफ्ड़ तंदूरी लेग', price: 349, isVeg: false, hasVar: true, varType: 'SMALL_LARGE', pSmall: 349, pLarge: 599, img: '/images/dishes/Aapno Khano (Non-Veg)/Non Veg Bites From the Tandoor/Tandoori Stuffed Leg.png' },
    { cat: 'non-veg-tandoor-bites', station: tandoorStation.id, name: 'Non-Veg Platter', localName: 'शाही नॉन-वेज प्लेटर', price: 699, isVeg: false, desc: 'Includes Chicken Tikka, Tandoori Leg, Afghani Kali Mirch Chest, Seekh Kabab, and Tandoori Stuffed Leg.', img: '/images/dishes/Aapno Khano (Non-Veg)/Non Veg Bites From the Tandoor/Non Veg Platter.png', bestseller: true },

    // 9. The Main Affair From the Wok and Handi — Non-Veg (🔴)
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Kadhai Chicken', localName: 'कढ़ाई चिकन', price: 319, isVeg: false, hasVar: true, varType: 'HALF_FULL', pSmall: 319, pLarge: 589, img: '/images/menu/p-64-kadhai-chicken.png' },
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Butter Chicken', localName: 'शाही बटर चिकन', price: 329, isVeg: false, hasVar: true, varType: 'HALF_FULL', pSmall: 329, pLarge: 599, hasBOM: true, img: '/images/dishes/Aapno Khano (Non-Veg)/The Main Affair from the Wok & Handi/Butter Chicken.png', bestseller: true },
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Chilly Chicken', localName: 'चिली चिकन', price: 339, isVeg: false, hasVar: true, varType: 'HALF_FULL', pSmall: 339, pLarge: 609, img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600' },
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Chilly Chicken Boneless', localName: 'चिली चिकन बोनलेस', price: 349, isVeg: false, hasVar: true, varType: 'HALF_FULL', pSmall: 349, pLarge: 649, img: '/images/dishes/Aapno Khano (Non-Veg)/The Main Affair from the Wok & Handi/Aapno Special Chicken (Boneless).png' },
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Home Style Chicken Handi', localName: 'देसी चिकन हांड़ी', price: 359, isVeg: false, hasVar: true, varType: 'HALF_FULL', pSmall: 359, pLarge: 659, img: '/images/dishes/Aapno Khano (Non-Veg)/The Main Affair from the Wok & Handi/Home Style Chicken Handi.png' },
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Aapno Special Chicken Handi', localName: 'आपणो स्पेशल चिकन हांड़ी', price: 379, isVeg: false, hasVar: true, varType: 'HALF_FULL', pSmall: 379, pLarge: 679, img: '/images/dishes/Aapno Khano (Non-Veg)/The Main Affair from the Wok & Handi/Aapno Special Chicken.png', bestseller: true },
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Aapno Special Chicken Handi Boneless', localName: 'आपणो चिकन हांड़ी बोनलेस', price: 399, isVeg: false, hasVar: true, varType: 'HALF_FULL', pSmall: 399, pLarge: 699, img: '/images/dishes/Aapno Khano (Non-Veg)/The Main Affair from the Wok & Handi/Aapno Special Chicken.png' },
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Chicken Biryani Handi', localName: 'दम चिकन बिरयानी', price: 649, isVeg: false, img: '/images/dishes/Aapno Khano (Non-Veg)/The Main Affair from the Wok & Handi/Chicken Biryani Handi.png', bestseller: true },
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Mutton Handi (Weekend Special)', localName: 'शाही मटन हांड़ी', price: 899, isVeg: false, desc: 'Special Rajasthani spiced tender mutton slow cooked in clay handi.', img: '/images/dishes/Aapno Khano (Non-Veg)/The Main Affair from the Wok & Handi/Mutton Handi (Weekend Special).png', bestseller: true },
    { cat: 'main-course-non-veg', station: mainKitchen.id, name: 'Mutton Handi Desi Ghee (Weekend Special)', localName: 'मटन हांड़ी देसी घी', price: 999, isVeg: false, desc: 'Pure Vedic Bilona A2 Desi Ghee preparation for connoisseurs of royal taste.', img: '/images/dishes/Aapno Khano (Non-Veg)/The Main Affair from the Wok & Handi/Desi Ghee Mutton Handi (Weekend Special).png', bestseller: true },

    // 10. Indian Breads and Sides
    { cat: 'indian-breads-sides', station: tandoorStation.id, name: 'Simple Roti', localName: 'सादा रोटी', price: 15, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/Breads/Simple Roti.png' },
    { cat: 'indian-breads-sides', station: tandoorStation.id, name: 'Butter Roti', localName: 'बटर रोटी', price: 22, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/Breads/Butter Roti.png' },
    { cat: 'indian-breads-sides', station: tandoorStation.id, name: 'Missi Roti', localName: 'मिस्सी रोटी', price: 35, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/Breads/Missi Roti.png' },
    { cat: 'indian-breads-sides', station: tandoorStation.id, name: 'Onion Missi Roti', localName: 'प्याज मिस्सी रोटी', price: 45, isVeg: true, img: '/images/dishes/Aapno Khano (Veg)/Breads/Onion Missi Roti.png' },
    { cat: 'indian-breads-sides', station: tandoorStation.id, name: 'Lachha Parantha', localName: 'लच्छा पराठा', price: 49, isVeg: true, img: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600' },
    { cat: 'indian-breads-sides', station: mainKitchen.id, name: 'Churma (Desi Ghee)', localName: 'शाही चूरमा (देसी घी)', price: 149, isVeg: true, desc: 'Traditional sweet Rajasthani churma made with crushed baatis and rich ghee.', img: '/images/dishes/Aapno Khano (Veg)/Breads/Churma (Desi Ghee).png', bestseller: true },
  ];

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    const category = createdCategories[item.cat];
    if (!category) continue;

    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = `SKU-AK-${String(i + 1).padStart(3, '0')}`;

    const createdProd = await prisma.product.create({
      data: {
        restaurantId: aapnoKhano.id,
        categoryId: category.id,
        kitchenStationId: item.station,
        name: item.name,
        localName: item.localName || item.name,
        slug: `${slug}-${i + 1}`,
        sku,
        description: item.desc || (item.isVeg ? 'Authentic preparation with freshly ground spices.' : 'Rich North Indian flavors prepared fresh to order.'),
        imageUrl: item.img,
        basePrice: item.price,
        hasVariations: Boolean(item.hasVar),
        variationType: item.varType || 'NONE',
        priceSmallHalf: item.pSmall || null,
        priceLargeFull: item.pLarge || null,
        gstRate: 5.0,
        preparationTimeMinutes: 15,
        isVeg: item.isVeg,
        spiceLevel: item.isVeg ? 1 : 2,
        isBestseller: Boolean(item.bestseller),
        isAvailable: true,
        displayOrder: i + 1,
      },
    });

    // Create Recipe BOM for dishes
    if (item.hasBOM) {
      const recipe = await prisma.recipe.create({
        data: {
          restaurantId: aapnoKhano.id,
          productId: createdProd.id,
          yieldQuantity: 1.0,
          preparationSteps: `Cook in traditional clay handi with fresh spices and simmer on low heat.`,
        },
      });

      if (item.name.includes('Paneer')) {
        await prisma.recipeIngredient.createMany({
          data: [
            { recipeId: recipe.id, ingredientId: 'ing-paneer', quantityUsed: 0.25, unit: 'KG' },
            { recipeId: recipe.id, ingredientId: 'ing-butter', quantityUsed: 0.05, unit: 'KG' },
            { recipeId: recipe.id, ingredientId: 'ing-spices', quantityUsed: 0.02, unit: 'KG' },
          ],
        });
      } else if (item.name.includes('Dal Makhani')) {
        await prisma.recipeIngredient.createMany({
          data: [
            { recipeId: recipe.id, ingredientId: 'ing-urad', quantityUsed: 0.15, unit: 'KG' },
            { recipeId: recipe.id, ingredientId: 'ing-butter', quantityUsed: 0.06, unit: 'KG' },
            { recipeId: recipe.id, ingredientId: 'ing-cream', quantityUsed: 0.04, unit: 'KG' },
          ],
        });
      } else if (item.name.includes('Chicken')) {
        await prisma.recipeIngredient.createMany({
          data: [
            { recipeId: recipe.id, ingredientId: 'ing-chicken', quantityUsed: 0.35, unit: 'KG' },
            { recipeId: recipe.id, ingredientId: 'ing-butter', quantityUsed: 0.05, unit: 'KG' },
            { recipeId: recipe.id, ingredientId: 'ing-spices', quantityUsed: 0.03, unit: 'KG' },
          ],
        });
      }
    }
  }

  // 7. Sample Verified QSR Car Service Order
  const firstProduct = await prisma.product.findFirst({ where: { slug: { startsWith: 'golden-leg-chest' } } });
  const breadProduct = await prisma.product.findFirst({ where: { slug: { startsWith: 'butter-roti' } } });

  const sampleOrder = await prisma.order.create({
    data: {
      humanOrderId: 'AK-2026-1001',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      carNumber: 'RJ 14 CA 9999',
      customerName: 'Vikramaditya Singh',
      customerPhone: '9996213962',
      orderType: 'CAR_SERVICE',
      guestCount: 2,
      status: 'PREPARING',
      subtotal: 573.0,
      taxAmount: 28.65,
      serviceChargeAmount: 0.0,
      discountAmount: 0.0,
      grandTotal: 601.65,
      cookingInstructions: 'Please deliver hot to car in parking lot bay 4. Extra mint chutney.',
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      transactionId: 'UPI9996213962_DEMO',
      items: {
        create: [
          {
            productId: firstProduct ? firstProduct.id : (await prisma.product.findFirst())!.id,
            productName: 'Golden Leg/Chest',
            selectedVariation: 'Large',
            isVeg: false,
            quantity: 1,
            unitPrice: 529.0,
            totalPrice: 529.0,
            itemNotes: 'Crispy preparation',
            status: 'PREPARING',
            kitchenStationId: snacksStation.id,
          },
          {
            productId: breadProduct ? breadProduct.id : (await prisma.product.findFirst())!.id,
            productName: 'Butter Roti',
            selectedVariation: null,
            isVeg: true,
            quantity: 2,
            unitPrice: 22.0,
            totalPrice: 44.0,
            status: 'PREPARING',
            kitchenStationId: tandoorStation.id,
          },
        ],
      },
    },
  });

  // Sample KOT
  await prisma.kot.create({
    data: {
      humanKotNumber: 'KOT-1001',
      restaurantId: aapnoKhano.id,
      orderId: sampleOrder.id,
      kitchenStationId: snacksStation.id,
      carNumber: 'RJ 14 CA 9999',
      customerName: 'Vikramaditya Singh',
      orderType: 'CAR_SERVICE',
      status: 'PREPARING',
      specialInstructions: 'Deliver to Bay 4',
      isPrinted: true,
      kotItems: {
        create: [
          {
            orderItemId: (await prisma.orderItem.findFirst({ where: { orderId: sampleOrder.id } }))!.id,
            productName: 'Golden Leg/Chest (Large)',
            selectedVariation: 'Large',
            isVeg: false,
            quantity: 1,
            itemNotes: 'Crispy',
          },
        ],
      },
    },
  });

  // Sample Invoice
  await prisma.invoice.create({
    data: {
      humanInvoiceNumber: 'AK-INV-2026-0001001',
      restaurantId: aapnoKhano.id,
      branchId: mainBranch.id,
      orderId: sampleOrder.id,
      carNumber: 'RJ 14 CA 9999',
      customerName: 'Vikramaditya Singh',
      customerPhone: '9996213962',
      orderType: 'CAR_SERVICE',
      subtotal: 573.0,
      cgstRate: 2.5,
      cgstAmount: 14.33,
      sgstRate: 2.5,
      sgstAmount: 14.33,
      grandTotal: 601.65,
      roundedTotal: 602.0,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      transactionId: 'UPI9996213962_DEMO',
    },
  });

  console.log('✅ Aapno Khaano QSR Database seeded with 60+ authentic dishes, Recipe BOMs, raw inventory, and variations!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
