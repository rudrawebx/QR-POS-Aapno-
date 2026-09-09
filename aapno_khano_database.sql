-- CreateTable
CREATE TABLE `SubscriptionPlan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `monthlyPrice` DOUBLE NOT NULL,
    `yearlyPrice` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `maxBranches` INTEGER NOT NULL DEFAULT 1,
    `maxTables` INTEGER NOT NULL DEFAULT 15,
    `maxOrdersPerMonth` INTEGER NOT NULL DEFAULT 1000,
    `maxStaffUsers` INTEGER NOT NULL DEFAULT 5,
    `hasKds` BOOLEAN NOT NULL DEFAULT true,
    `hasMultiStation` BOOLEAN NOT NULL DEFAULT true,
    `hasInventory` BOOLEAN NOT NULL DEFAULT true,
    `hasCustomBranding` BOOLEAN NOT NULL DEFAULT true,
    `hasAdvancedReports` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SubscriptionPlan_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Restaurant` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `uniqueUsername` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `bannerUrl` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `cuisine` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'India',
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `currencySymbol` VARCHAR(191) NOT NULL DEFAULT '₹',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
    `gstin` VARCHAR(191) NULL,
    `fssaiNumber` VARCHAR(191) NULL,
    `commissionRate` DOUBLE NOT NULL DEFAULT 0.0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Restaurant_slug_key`(`slug`),
    UNIQUE INDEX `Restaurant_uniqueUsername_key`(`uniqueUsername`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantSettings` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `isRestaurantOpen` BOOLEAN NOT NULL DEFAULT true,
    `openingHoursText` VARCHAR(191) NOT NULL DEFAULT '11:00 AM - 11:30 PM',
    `closureMessage` VARCHAR(191) NOT NULL DEFAULT 'We are currently closed for orders. Please visit during opening hours.',
    `taxRateGst` DOUBLE NOT NULL DEFAULT 5.0,
    `serviceChargeRate` DOUBLE NOT NULL DEFAULT 0.0,
    `packagingCharge` DOUBLE NOT NULL DEFAULT 0.0,
    `isTaxInclusive` BOOLEAN NOT NULL DEFAULT false,
    `autoPrintKot` BOOLEAN NOT NULL DEFAULT true,
    `autoPrintBill` BOOLEAN NOT NULL DEFAULT true,
    `autoAcceptOrders` BOOLEAN NOT NULL DEFAULT true,
    `soundAlertsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `allowGuestCheckout` BOOLEAN NOT NULL DEFAULT true,
    `requireCustomerPhone` BOOLEAN NOT NULL DEFAULT true,
    `requireCarNumber` BOOLEAN NOT NULL DEFAULT true,
    `allowTableReservations` BOOLEAN NOT NULL DEFAULT false,
    `defaultReceiptFooter` VARCHAR(191) NOT NULL DEFAULT 'Thank you for visiting Aapno Khaano! Taste the Royal Heritage.',
    `billTemplateConfig` VARCHAR(191) NOT NULL DEFAULT '{"showLogo":true,"showGstin":true,"showFssai":true,"showCarNumber":true,"showQr":true,"receiptWidth":"80mm"}',
    `kotTemplateConfig` VARCHAR(191) NOT NULL DEFAULT '{"showStation":true,"showNotes":true,"showVehicle":true,"showOrderType":true,"kotWidth":"80mm"}',
    `invoicePrefix` VARCHAR(191) NOT NULL DEFAULT 'AK-2026-',
    `kotPrefix` VARCHAR(191) NOT NULL DEFAULT 'KOT-',
    `upiId` VARCHAR(191) NOT NULL DEFAULT '9996213962m@pnb',
    `upiMerchantName` VARCHAR(191) NOT NULL DEFAULT 'AAPNO KHANO',
    `upiQrImageUrl` VARCHAR(191) NOT NULL DEFAULT '/images/pnb-upi-qr.png',
    `upiQrEnabled` BOOLEAN NOT NULL DEFAULT true,
    `googlePayEnabled` BOOLEAN NOT NULL DEFAULT true,
    `phonePeEnabled` BOOLEAN NOT NULL DEFAULT true,
    `paytmEnabled` BOOLEAN NOT NULL DEFAULT true,
    `bhimEnabled` BOOLEAN NOT NULL DEFAULT true,
    `paymentMode` VARCHAR(191) NOT NULL DEFAULT 'TEST',
    `razorpayKeyId` VARCHAR(191) NOT NULL DEFAULT 'rzp_test_demo123456',
    `razorpayKeySecret` VARCHAR(191) NOT NULL DEFAULT 'demo_secret_key_restaurant',
    `razorpayWebhookSecret` VARCHAR(191) NOT NULL DEFAULT 'demo_webhook_secret_restaurant',
    `supportWhatsappNumber` VARCHAR(191) NOT NULL DEFAULT '+919996213962',
    `instagramUrl` VARCHAR(191) NOT NULL DEFAULT 'https://www.instagram.com/aapnokhano',
    `facebookUrl` VARCHAR(191) NOT NULL DEFAULT 'https://www.facebook.com/aapnokhano',
    `googleMapsUrl` VARCHAR(191) NOT NULL DEFAULT 'https://maps.google.com/?q=Aapno+Khaano',
    `printerIpBill` VARCHAR(191) NULL,
    `printerIpKot` VARCHAR(191) NULL,
    `themePrimaryColor` VARCHAR(191) NOT NULL DEFAULT '#AA1B2A',
    `themeGoldColor` VARCHAR(191) NOT NULL DEFAULT '#E09D3D',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RestaurantSettings_restaurantId_key`(`restaurantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantHours` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `openTime` VARCHAR(191) NOT NULL DEFAULT '11:00',
    `closeTime` VARCHAR(191) NOT NULL DEFAULT '23:30',
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RestaurantHours_restaurantId_dayOfWeek_key`(`restaurantId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'WAITER',
    `restaurantId` VARCHAR(191) NULL,
    `branchId` VARCHAR(191) NULL,
    `pinCode` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `forcePasswordChange` BOOLEAN NOT NULL DEFAULT false,
    `resetPasswordToken` VARCHAR(191) NULL,
    `resetPasswordExpiry` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `billingCycle` VARCHAR(191) NOT NULL DEFAULT 'MONTHLY',
    `currentPeriodStart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `currentPeriodEnd` DATETIME(3) NOT NULL,
    `razorpaySubId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FloorZone` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Table` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `floorZoneId` VARCHAR(191) NULL,
    `tableNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 4,
    `status` VARCHAR(191) NOT NULL DEFAULT 'AVAILABLE',
    `currentOrderId` VARCHAR(191) NULL,
    `assignedWaiterId` VARCHAR(191) NULL,
    `qrCodeToken` VARCHAR(191) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Table_qrCodeToken_key`(`qrCodeToken`),
    UNIQUE INDEX `Table_restaurantId_tableNumber_key`(`restaurantId`, `tableNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QrCode` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `tableId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `qrImageUrl` VARCHAR(191) NULL,
    `scanCount` INTEGER NOT NULL DEFAULT 0,
    `lastScannedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QrCode_tableId_key`(`tableId`),
    UNIQUE INDEX `QrCode_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KitchenStation` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `printerIp` VARCHAR(191) NULL,
    `isAutoPrint` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL DEFAULT 'Utensils',
    `isVegCategory` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_restaurantId_slug_key`(`restaurantId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subcategory` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subcategory_restaurantId_categoryId_slug_key`(`restaurantId`, `categoryId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `subcategoryId` VARCHAR(191) NULL,
    `kitchenStationId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `shortName` VARCHAR(191) NULL,
    `localName` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `basePrice` DOUBLE NOT NULL,
    `discountPrice` DOUBLE NULL,
    `hasVariations` BOOLEAN NOT NULL DEFAULT false,
    `variationType` VARCHAR(191) NULL,
    `priceSmallHalf` DOUBLE NULL,
    `priceMedium` DOUBLE NULL,
    `priceLargeFull` DOUBLE NULL,
    `gstRate` DOUBLE NOT NULL DEFAULT 5.0,
    `taxCategory` VARCHAR(191) NOT NULL DEFAULT 'GST 5%',
    `preparationTimeMinutes` INTEGER NOT NULL DEFAULT 15,
    `isVeg` BOOLEAN NOT NULL DEFAULT true,
    `isVegan` BOOLEAN NOT NULL DEFAULT false,
    `isJain` BOOLEAN NOT NULL DEFAULT false,
    `isGlutenFree` BOOLEAN NOT NULL DEFAULT false,
    `noOnionGarlic` BOOLEAN NOT NULL DEFAULT false,
    `allergens` VARCHAR(191) NULL,
    `spiceLevel` INTEGER NOT NULL DEFAULT 1,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `isBestseller` BOOLEAN NOT NULL DEFAULT false,
    `isRecommended` BOOLEAN NOT NULL DEFAULT false,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModifierGroup` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `minSelect` INTEGER NOT NULL DEFAULT 0,
    `maxSelect` INTEGER NOT NULL DEFAULT 1,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductModifierGroup` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `modifierGroupId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ProductModifierGroup_productId_modifierGroupId_key`(`productId`, `modifierGroupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Modifier` (
    `id` VARCHAR(191) NOT NULL,
    `modifierGroupId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0.0,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `isVeg` BOOLEAN NOT NULL DEFAULT true,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `humanOrderId` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `tableId` VARCHAR(191) NULL,
    `carNumber` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NULL,
    `guestCount` INTEGER NOT NULL DEFAULT 1,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CONFIRMED',
    `orderType` VARCHAR(191) NOT NULL DEFAULT 'CAR_SERVICE',
    `subtotal` DOUBLE NOT NULL DEFAULT 0.0,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `serviceChargeAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `packagingChargeAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `grandTotal` DOUBLE NOT NULL DEFAULT 0.0,
    `cookingInstructions` VARCHAR(191) NULL,
    `specialNotes` VARCHAR(191) NULL,
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PAID',
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'UPI',
    `transactionId` VARCHAR(191) NULL,
    `razorpayOrderId` VARCHAR(191) NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,
    `printJobId` VARCHAR(191) NULL,
    `printCount` INTEGER NOT NULL DEFAULT 0,
    `lastPrintedAt` DATETIME(3) NULL,
    `takenByStaffId` VARCHAR(191) NULL,
    `servedByStaffId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `customerId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productImage` VARCHAR(191) NULL,
    `selectedVariation` VARCHAR(191) NULL,
    `isVeg` BOOLEAN NOT NULL DEFAULT true,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `itemNotes` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PREPARING',
    `kitchenStationId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItemModifier` (
    `id` VARCHAR(191) NOT NULL,
    `orderItemId` VARCHAR(191) NOT NULL,
    `modifierId` VARCHAR(191) NOT NULL,
    `modifierName` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0.0,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kot` (
    `id` VARCHAR(191) NOT NULL,
    `humanKotNumber` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `kitchenStationId` VARCHAR(191) NULL,
    `carNumber` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NULL,
    `orderType` VARCHAR(191) NOT NULL DEFAULT 'CAR_SERVICE',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PREPARING',
    `specialInstructions` VARCHAR(191) NULL,
    `isPrinted` BOOLEAN NOT NULL DEFAULT true,
    `printCount` INTEGER NOT NULL DEFAULT 1,
    `lastPrintedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `printedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KotItem` (
    `id` VARCHAR(191) NOT NULL,
    `kotId` VARCHAR(191) NOT NULL,
    `orderItemId` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `selectedVariation` VARCHAR(191) NULL,
    `isVeg` BOOLEAN NOT NULL DEFAULT true,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `modifierSummary` VARCHAR(191) NULL,
    `itemNotes` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PREPARING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `humanInvoiceNumber` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `tableId` VARCHAR(191) NULL,
    `carNumber` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `orderType` VARCHAR(191) NOT NULL DEFAULT 'CAR_SERVICE',
    `subtotal` DOUBLE NOT NULL,
    `cgstRate` DOUBLE NOT NULL DEFAULT 2.5,
    `cgstAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `sgstRate` DOUBLE NOT NULL DEFAULT 2.5,
    `sgstAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `igstAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `serviceChargeAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `packagingChargeAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `grandTotal` DOUBLE NOT NULL,
    `roundedTotal` DOUBLE NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'UPI',
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PAID',
    `transactionId` VARCHAR(191) NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,
    `isRefunded` BOOLEAN NOT NULL DEFAULT false,
    `refundAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `printCount` INTEGER NOT NULL DEFAULT 1,
    `lastPrintedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_humanInvoiceNumber_key`(`humanInvoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `invoiceId` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `paymentGateway` VARCHAR(191) NOT NULL DEFAULT 'UPI_DIRECT',
    `razorpayOrderId` VARCHAR(191) NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,
    `razorpaySignature` VARCHAR(191) NULL,
    `transactionId` VARCHAR(191) NULL,
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'UPI',
    `status` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    `isSplit` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentSplit` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `customerLabel` VARCHAR(191) NOT NULL,
    `splitType` VARCHAR(191) NOT NULL DEFAULT 'EQUAL',
    `amount` DOUBLE NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'UPI',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PAID',
    `transactionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coupon` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `discountType` VARCHAR(191) NOT NULL DEFAULT 'PERCENTAGE',
    `discountValue` DOUBLE NOT NULL,
    `minOrderAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `maxDiscountAmount` DOUBLE NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,
    `usageLimit` INTEGER NOT NULL DEFAULT 100,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Coupon_restaurantId_code_key`(`restaurantId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `carNumber` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `totalVisits` INTEGER NOT NULL DEFAULT 1,
    `totalSpend` DOUBLE NOT NULL DEFAULT 0.0,
    `avgOrderValue` DOUBLE NOT NULL DEFAULT 0.0,
    `lastVisitAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Customer_restaurantId_phone_key`(`restaurantId`, `phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reservation` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `tableId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NULL,
    `guestCount` INTEGER NOT NULL DEFAULT 2,
    `reservationDate` DATETIME(3) NOT NULL,
    `reservationTime` VARCHAR(191) NOT NULL,
    `specialRequests` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CONFIRMED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ingredient` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'KG',
    `currentStock` DOUBLE NOT NULL DEFAULT 0.0,
    `minStockAlert` DOUBLE NOT NULL DEFAULT 5.0,
    `unitCost` DOUBLE NOT NULL DEFAULT 0.0,
    `supplierId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recipe` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `yieldQuantity` DOUBLE NOT NULL DEFAULT 1.0,
    `preparationSteps` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecipeIngredient` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `ingredientId` VARCHAR(191) NOT NULL,
    `quantityUsed` DOUBLE NOT NULL DEFAULT 0.1,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'KG',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `ingredientId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'USAGE_RECIPE_BOM',
    `quantity` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'KG',
    `costPerUnit` DOUBLE NOT NULL DEFAULT 0.0,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contactPerson` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `gstin` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrder` (
    `id` VARCHAR(191) NOT NULL,
    `poNumber` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `totalAmount` DOUBLE NOT NULL DEFAULT 0.0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'RECEIVED',
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'RAW_MATERIAL',
    `title` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `expenseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'BANK_TRANSFER',
    `notes` VARCHAR(191) NULL,
    `receiptUrl` VARCHAR(191) NULL,
    `createdByStaffId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NULL,
    `customerPhone` VARCHAR(191) NULL,
    `overallRating` INTEGER NOT NULL DEFAULT 5,
    `foodRating` INTEGER NOT NULL DEFAULT 5,
    `serviceRating` INTEGER NOT NULL DEFAULT 5,
    `ambienceRating` INTEGER NOT NULL DEFAULT 5,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `userName` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `oldValue` VARCHAR(191) NULL,
    `newValue` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RestaurantSettings` ADD CONSTRAINT `RestaurantSettings_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantHours` ADD CONSTRAINT `RestaurantHours_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantSubscription` ADD CONSTRAINT `RestaurantSubscription_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantSubscription` ADD CONSTRAINT `RestaurantSubscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FloorZone` ADD CONSTRAINT `FloorZone_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FloorZone` ADD CONSTRAINT `FloorZone_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Table` ADD CONSTRAINT `Table_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Table` ADD CONSTRAINT `Table_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Table` ADD CONSTRAINT `Table_floorZoneId_fkey` FOREIGN KEY (`floorZoneId`) REFERENCES `FloorZone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QrCode` ADD CONSTRAINT `QrCode_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QrCode` ADD CONSTRAINT `QrCode_tableId_fkey` FOREIGN KEY (`tableId`) REFERENCES `Table`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KitchenStation` ADD CONSTRAINT `KitchenStation_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subcategory` ADD CONSTRAINT `Subcategory_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subcategory` ADD CONSTRAINT `Subcategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `Subcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_kitchenStationId_fkey` FOREIGN KEY (`kitchenStationId`) REFERENCES `KitchenStation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModifierGroup` ADD CONSTRAINT `ModifierGroup_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductModifierGroup` ADD CONSTRAINT `ProductModifierGroup_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductModifierGroup` ADD CONSTRAINT `ProductModifierGroup_modifierGroupId_fkey` FOREIGN KEY (`modifierGroupId`) REFERENCES `ModifierGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Modifier` ADD CONSTRAINT `Modifier_modifierGroupId_fkey` FOREIGN KEY (`modifierGroupId`) REFERENCES `ModifierGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_tableId_fkey` FOREIGN KEY (`tableId`) REFERENCES `Table`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_takenByStaffId_fkey` FOREIGN KEY (`takenByStaffId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_servedByStaffId_fkey` FOREIGN KEY (`servedByStaffId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_kitchenStationId_fkey` FOREIGN KEY (`kitchenStationId`) REFERENCES `KitchenStation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemModifier` ADD CONSTRAINT `OrderItemModifier_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemModifier` ADD CONSTRAINT `OrderItemModifier_modifierId_fkey` FOREIGN KEY (`modifierId`) REFERENCES `Modifier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kot` ADD CONSTRAINT `Kot_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kot` ADD CONSTRAINT `Kot_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kot` ADD CONSTRAINT `Kot_kitchenStationId_fkey` FOREIGN KEY (`kitchenStationId`) REFERENCES `KitchenStation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KotItem` ADD CONSTRAINT `KotItem_kotId_fkey` FOREIGN KEY (`kotId`) REFERENCES `Kot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KotItem` ADD CONSTRAINT `KotItem_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_tableId_fkey` FOREIGN KEY (`tableId`) REFERENCES `Table`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentSplit` ADD CONSTRAINT `PaymentSplit_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentSplit` ADD CONSTRAINT `PaymentSplit_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_tableId_fkey` FOREIGN KEY (`tableId`) REFERENCES `Table`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ingredient` ADD CONSTRAINT `Ingredient_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ingredient` ADD CONSTRAINT `Ingredient_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recipe` ADD CONSTRAINT `Recipe_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recipe` ADD CONSTRAINT `Recipe_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeIngredient` ADD CONSTRAINT `RecipeIngredient_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeIngredient` ADD CONSTRAINT `RecipeIngredient_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransaction` ADD CONSTRAINT `StockTransaction_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransaction` ADD CONSTRAINT `StockTransaction_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockTransaction` ADD CONSTRAINT `StockTransaction_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_createdByStaffId_fkey` FOREIGN KEY (`createdByStaffId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;



-- =========================================
-- SEED DATA: RESTAURANT, PLANS & USERS
-- =========================================

INSERT INTO SubscriptionPlan (id, name, slug, monthlyPrice, yearlyPrice, currency, maxBranches, maxTables, maxOrdersPerMonth, maxStaffUsers, hasKds, hasMultiStation, hasInventory, hasCustomBranding, hasAdvancedReports, isActive, createdAt, updatedAt) VALUES
("plan_starter", "QSR Starter Plan", "starter", 999, 9990, "INR", 1, 20, 1000, 5, 1, 0, 0, 1, 0, 1, NOW(3), NOW(3)),
("plan_pro", "QSR Professional Plan", "professional", 2499, 24990, "INR", 3, 50, 5000, 15, 1, 1, 1, 1, 1, 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO Restaurant (id, name, slug, uniqueUsername, logoUrl, bannerUrl, description, cuisine, phone, email, address, city, state, postalCode, country, currency, currencySymbol, timezone, gstin, fssaiNumber, commissionRate, isActive, createdAt, updatedAt) VALUES
("rest_aapno_khano", "आपणो खाणो (Aapno Khaano)", "aapno-khano", "skdahiya1007", "/images/aapno-khano-logo.png", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200", "Authentic Royal Rajasthani & North Indian Handi Specialties", "Rajasthani Handi, Tandoor & Wok Curries", "+91 99962 13962", "contact@aapnokhano.com", "Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053", "Fatehabad", "Haryana", "125053", "India", "INR", "₹", "Asia/Kolkata", "08AABCU9603R1ZM", "12224026000189", 0.0, 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO RestaurantSettings (id, restaurantId, isRestaurantOpen, openingHoursText, closureMessage, taxRateGst, serviceChargeRate, packagingCharge, isTaxInclusive, autoPrintKot, autoAcceptOrders, soundAlertsEnabled, allowGuestCheckout, requireCustomerPhone, requireCarNumber, allowTableReservations, defaultReceiptFooter, invoicePrefix, kotPrefix, upiId, upiMerchantName, upiQrImageUrl, upiQrEnabled, razorpayKeyId, razorpayKeySecret, themePrimaryColor, themeGoldColor, supportWhatsappNumber, createdAt, updatedAt) VALUES
("set_aapno_khano", "rest_aapno_khano", 1, "11:00 AM - 11:30 PM", "We are currently closed for orders.", 5.0, 0.0, 0.0, 0, 1, 1, 1, 1, 1, 1, 0, "Padharo Mhare Desh! Thank you for visiting Aapno Khaano. Taste the Royal Heritage.", "AK-2026-", "KOT-", "9996213962m@pnb", "AAPNO KHANO", "/images/pnb-upi-qr.png", 1, "rzp_test_TWIx6ekD7pnyCY", "Zbn2W1RvnXnWFT2dMxVldrjT", "#AA1B2A", "#E09D3D", "+919996213962", NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE upiId=VALUES(upiId);

INSERT INTO User (id, name, email, passwordHash, role, phone, pinCode, restaurantId, isActive, createdAt, updatedAt) VALUES
("usr_super_admin", "Vinod (SaaS Super Admin)", "vinod@aapnokhano.com", "Khano#Aapno@Sector3", "SUPER_ADMIN", "+91 99962 13962", "0000", "rest_aapno_khano", 1, NOW(3), NOW(3)),
("usr_owner_fatehabad", "Fatehabad Store Owner", "fatehabad@aapnokhano.com", "Fatehabad#Aapno@Sector3", "OWNER", "+91 99962 13962", "1111", "rest_aapno_khano", 1, NOW(3), NOW(3)),
("usr_manager_ftd", "Fatehabad Store Manager", "ftd.mngr@aapnokhano.com", "FTDmngr#Aapno@Sector3", "MANAGER", "+91 99962 13965", "2222", "rest_aapno_khano", 1, NOW(3), NOW(3)),
("usr_cashier_ftd", "Fatehabad Billing Cashier", "ftd.cashier@aapnokhano.com", "FTDcashier#Aapno@Sector3", "CASHIER", "+91 99962 13963", "3333", "rest_aapno_khano", 1, NOW(3), NOW(3)),
("usr_kitchen_ftd", "Fatehabad Head Chef", "ftd.kitchen@aapnokhano.com", "FTDKitchen#Aapno@Sector3", "KITCHEN", "+91 99962 13964", "4444", "rest_aapno_khano", 1, NOW(3), NOW(3)),
("usr_waiter_ftd", "Fatehabad Waiter & Captain", "ftd.waiter@aapnokhano.com", "Ftdwaiter#Aapno@Sector3", "WAITER", "+91 99962 13966", "5555", "rest_aapno_khano", 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE role=VALUES(role);

INSERT INTO Ingredient (id, restaurantId, name, unit, currentStock, minStockAlert, unitCost, createdAt, updatedAt) VALUES
("ing-paneer", "rest_aapno_khano", "Fresh Malai Paneer", "KG", 45.0, 10.0, 320.0, NOW(3), NOW(3)),
("ing-ghee", "rest_aapno_khano", "Vedic Desi Bilona Ghee", "LITER", 30.0, 8.0, 850.0, NOW(3), NOW(3)),
("ing-butter", "rest_aapno_khano", "Amul Table Butter", "KG", 25.0, 5.0, 480.0, NOW(3), NOW(3)),
("ing-rice", "rest_aapno_khano", "Royal Aged Basmati Rice", "KG", 100.0, 20.0, 110.0, NOW(3), NOW(3)),
("ing-cream", "rest_aapno_khano", "Amul Fresh Dairy Cream", "LITER", 20.0, 6.0, 220.0, NOW(3), NOW(3)),
("ing-spices", "rest_aapno_khano", "Shahi Garam Masala Blend", "KG", 12.0, 3.0, 650.0, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name);



-- =========================================


-- =========================================
-- SEED DATA: CATEGORIES, PRODUCTS & TABLES
-- =========================================

INSERT INTO KitchenStation (id, restaurantId, branchId, name, slug, printerIp, isAutoPrint, isActive, createdAt, updatedAt) VALUES
("ks-handi", "rest_aapno_khano", NULL, "Handi & Curry Station", "handi-station", NULL, 1, 1, NOW(3), NOW(3)),
("ks-tandoor", "rest_aapno_khano", NULL, "Tandoor & Kebab Station", "tandoor-station", NULL, 1, 1, NOW(3), NOW(3)),
("ks-pantry", "rest_aapno_khano", NULL, "Pantry, Chaat & Chinese", "pantry-station", NULL, 1, 1, NOW(3), NOW(3)),
("ks-beverage", "rest_aapno_khano", NULL, "Beverages & Desserts", "beverage-station", NULL, 1, 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO `Table` (id, restaurantId, branchId, floorZoneId, tableNumber, name, capacity, status, currentOrderId, assignedWaiterId, qrCodeToken, isArchived, createdAt, updatedAt) VALUES
("tbl-1", "rest_aapno_khano", NULL, NULL, "Table 1", "Table 1", 4, "AVAILABLE", NULL, NULL, "tok-table-1", 0, NOW(3), NOW(3)),
("tbl-2", "rest_aapno_khano", NULL, NULL, "Table 2", "Table 2", 4, "AVAILABLE", NULL, NULL, "tok-table-2", 0, NOW(3), NOW(3)),
("tbl-3", "rest_aapno_khano", NULL, NULL, "Table 3", "Table 3", 4, "AVAILABLE", NULL, NULL, "tok-table-3", 0, NOW(3), NOW(3)),
("tbl-4", "rest_aapno_khano", NULL, NULL, "Table 4", "Table 4", 4, "AVAILABLE", NULL, NULL, "tok-table-4", 0, NOW(3), NOW(3)),
("tbl-5", "rest_aapno_khano", NULL, NULL, "Table 5", "Table 5", 4, "AVAILABLE", NULL, NULL, "tok-table-5", 0, NOW(3), NOW(3)),
("tbl-6", "rest_aapno_khano", NULL, NULL, "Table 6", "Table 6", 4, "AVAILABLE", NULL, NULL, "tok-table-6", 0, NOW(3), NOW(3)),
("tbl-7", "rest_aapno_khano", NULL, NULL, "Table 7", "Table 7", 4, "AVAILABLE", NULL, NULL, "tok-table-7", 0, NOW(3), NOW(3)),
("tbl-8", "rest_aapno_khano", NULL, NULL, "Table 8", "Table 8", 4, "AVAILABLE", NULL, NULL, "tok-table-8", 0, NOW(3), NOW(3)),
("tbl-9", "rest_aapno_khano", NULL, NULL, "Table 9", "Table 9", 4, "AVAILABLE", NULL, NULL, "tok-table-9", 0, NOW(3), NOW(3)),
("tbl-10", "rest_aapno_khano", NULL, NULL, "Table 10", "Table 10", 4, "AVAILABLE", NULL, NULL, "tok-table-10", 0, NOW(3), NOW(3)),
("tbl-11", "rest_aapno_khano", NULL, NULL, "Table 11", "Table 11", 6, "AVAILABLE", NULL, NULL, "tok-table-11", 0, NOW(3), NOW(3)),
("tbl-12", "rest_aapno_khano", NULL, NULL, "Table 12", "Table 12", 6, "AVAILABLE", NULL, NULL, "tok-table-12", 0, NOW(3), NOW(3)),
("tbl-13", "rest_aapno_khano", NULL, NULL, "Table 13", "Table 13", 6, "AVAILABLE", NULL, NULL, "tok-table-13", 0, NOW(3), NOW(3)),
("tbl-14", "rest_aapno_khano", NULL, NULL, "Table 14", "Table 14", 6, "AVAILABLE", NULL, NULL, "tok-table-14", 0, NOW(3), NOW(3)),
("tbl-15", "rest_aapno_khano", NULL, NULL, "Table 15", "Table 15", 6, "AVAILABLE", NULL, NULL, "tok-table-15", 0, NOW(3), NOW(3)),
("tbl-16", "rest_aapno_khano", NULL, NULL, "Table 16", "Table 16", 6, "AVAILABLE", NULL, NULL, "tok-table-16", 0, NOW(3), NOW(3)),
("tbl-17", "rest_aapno_khano", NULL, NULL, "Table 17", "Table 17", 6, "AVAILABLE", NULL, NULL, "tok-table-17", 0, NOW(3), NOW(3)),
("tbl-18", "rest_aapno_khano", NULL, NULL, "Table 18", "Table 18", 6, "AVAILABLE", NULL, NULL, "tok-table-18", 0, NOW(3), NOW(3)),
("tbl-19", "rest_aapno_khano", NULL, NULL, "Table 19", "Table 19", 6, "AVAILABLE", NULL, NULL, "tok-table-19", 0, NOW(3), NOW(3)),
("tbl-20", "rest_aapno_khano", NULL, NULL, "Table 20", "Table 20", 6, "AVAILABLE", NULL, NULL, "tok-table-20", 0, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO Category (id, restaurantId, name, slug, description, imageUrl, icon, isVegCategory, displayOrder, isActive, isArchived, createdAt, updatedAt) VALUES
("cat-to-begin-with-green", "rest_aapno_khano", "To Begin With Green", "to-begin-with-green", "Fresh crispy chats and tangy starters", NULL, "Salad", 1, 1, 1, 0, NOW(3), NOW(3)),
("cat-salad", "rest_aapno_khano", "Salad", "salad", "Garden fresh salads and tandoori roasted greens", NULL, "Utensils", 1, 2, 1, 0, NOW(3), NOW(3)),
("cat-first-course", "rest_aapno_khano", "First Course", "first-course", "Crunchy papads and royal masala baskets", NULL, "Layers", 1, 3, 1, 0, NOW(3), NOW(3)),
("cat-malai-and-crispy", "rest_aapno_khano", "To Begin With Malai and Crispy", "malai-and-crispy", "Golden fried crispy appetizers & cheesy bites", NULL, "Sparkles", 1, 4, 1, 0, NOW(3), NOW(3)),
("cat-veg-tandoor-bites", "rest_aapno_khano", "Veg Bites From the Tandoor", "veg-tandoor-bites", "Clay oven charred tikkas and succulent chaaps", NULL, "Flame", 1, 5, 1, 0, NOW(3), NOW(3)),
("cat-main-course-veg", "rest_aapno_khano", "The Main Affair From the Wok and Handi — Veg", "main-course-veg", "Rich slow-cooked daals, paneer curries and handi biryani", NULL, "Soup", 1, 6, 1, 0, NOW(3), NOW(3)),
("cat-red-and-white-snacks", "rest_aapno_khano", "To Begin With Red and White Snacks (Egg)", "red-and-white-snacks", "Golden fried egg appetizers and spicy snacks", NULL, "Flame", 0, 7, 1, 0, NOW(3), NOW(3)),
("cat-non-veg-tandoor", "rest_aapno_khano", "Non-Veg Bites From the Tandoor", "non-veg-tandoor", "Charcoal-grilled chicken tikkas, seekh kababs and tandoori roasts", NULL, "Flame", 0, 8, 1, 0, NOW(3), NOW(3)),
("cat-main-course-non-veg", "rest_aapno_khano", "The Main Affair From the Wok and Handi — Non-Veg", "main-course-non-veg", "Rich slow-cooked chicken curries, butter chicken and biryanis", NULL, "Soup", 0, 9, 1, 0, NOW(3), NOW(3)),
("cat-indian-breads", "rest_aapno_khano", "Indian Breads &amp; Sides", "indian-breads", "Hot clay oven rotis, butter naans, parathas and rice", NULL, "Utensils", 1, 10, 1, 0, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO Product (id, restaurantId, categoryId, subcategoryId, kitchenStationId, name, shortName, localName, slug, sku, description, imageUrl, basePrice, discountPrice, hasVariations, variationType, priceSmallHalf, priceMedium, priceLargeFull, gstRate, taxCategory, isVeg, isVegan, isJain, isGlutenFree, spiceLevel, preparationTimeMinutes, isAvailable, isBestseller, isRecommended, isFeatured, isArchived, displayOrder, createdAt, updatedAt) VALUES
("p-1", "rest_aapno_khano", "cat-to-begin-with-green", NULL, "ks-handi", "Sweet Corn Chat", "Sweet Corn Chat", NULL, "sweet-corn-chat-p-1", "SKU-AK-p-1", "Steamed sweet corn seasoned with chat masala and lime.", "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=1000&h=1000&fit=crop&q=80", 69, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 1, NOW(3), NOW(3)),
("p-2", "rest_aapno_khano", "cat-to-begin-with-green", NULL, "ks-handi", "Chana Chat", "Chana Chat", NULL, "chana-chat-p-2", "SKU-AK-p-2", "Protein-rich boiled chickpeas tossed with onions, tomatoes and spicy chutney.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 79, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 2, NOW(3), NOW(3)),
("p-3", "rest_aapno_khano", "cat-to-begin-with-green", NULL, "ks-handi", "Sprouts Chat", "Sprouts Chat", NULL, "sprouts-chat-p-3", "SKU-AK-p-3", "Nutritious green gram sprouts with pomegranate, coriander and tangy lemon dressing.", "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&h=1000&fit=crop&q=80", 99, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 3, NOW(3), NOW(3)),
("p-4", "rest_aapno_khano", "cat-to-begin-with-green", NULL, "ks-handi", "Fruit Chat", "Fruit Chat", NULL, "fruit-chat-p-4", "SKU-AK-p-4", "Assorted seasonal fresh fruits tossed with roasted cumin and royal spices.", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1000&h=1000&fit=crop&q=80", 109, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 4, NOW(3), NOW(3)),
("p-5", "rest_aapno_khano", "cat-to-begin-with-green", NULL, "ks-handi", "Pineapple Chat", "Pineapple Chat", NULL, "pineapple-chat-p-5", "SKU-AK-p-5", "Juicy pineapple chunks dusted with mint, black salt and mild chili.", "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=1000&h=1000&fit=crop&q=80", 129, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 5, NOW(3), NOW(3)),
("p-6", "rest_aapno_khano", "cat-to-begin-with-green", NULL, "ks-handi", "Sirka Onion Rings", "Sirka Onion Rings", NULL, "sirka-onion-rings-p-6", "SKU-AK-p-6", "Crispy vinegar-pickled shallots with green chillies and beet essence.", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&h=1000&fit=crop&q=80", 79, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 6, NOW(3), NOW(3)),
("p-7", "rest_aapno_khano", "cat-salad", NULL, "ks-pantry", "Green Salad", "Green Salad", NULL, "green-salad-p-7", "SKU-AK-p-7", "Classic crisp cucumber, tomato, carrot and radish platter.", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&h=1000&fit=crop&q=80", 99, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 7, NOW(3), NOW(3)),
("p-8", "rest_aapno_khano", "cat-salad", NULL, "ks-pantry", "Special Lettuce Salad", "Special Lettuce Salad", NULL, "special-lettuce-salad-p-8", "SKU-AK-p-8", "Fresh iceberg lettuce with black olives, bell peppers and herb olive oil.", "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&h=1000&fit=crop&q=80", 149, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 8, NOW(3), NOW(3)),
("p-9", "rest_aapno_khano", "cat-salad", NULL, "ks-pantry", "Cream Kachumber Salad", "Cream Kachumber Salad", NULL, "cream-kachumber-salad-p-9", "SKU-AK-p-9", "Finely diced vegetables tossed in rich spiced cream dressing.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 149, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 9, NOW(3), NOW(3)),
("p-10", "rest_aapno_khano", "cat-salad", NULL, "ks-pantry", "Tandoori Honey Cauliflower", "Tandoori Honey Cauliflower", NULL, "tandoori-honey-cauliflower-p-10", "SKU-AK-p-10", "Charcoal-glazed florets tossed in organic honey and crushed peppercorns.", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1000&h=1000&fit=crop&q=80", 179, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 10, NOW(3), NOW(3)),
("p-11", "rest_aapno_khano", "cat-salad", NULL, "ks-pantry", "Tandoori Pineapple", "Tandoori Pineapple", NULL, "tandoori-pineapple-p-11", "SKU-AK-p-11", "Spiced pineapple skewers charred to caramelized perfection in clay oven.", "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=1000&h=1000&fit=crop&q=80", 249, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 11, NOW(3), NOW(3)),
("p-12", "rest_aapno_khano", "cat-first-course", NULL, "ks-pantry", "Tandoori Papad (2 Pieces)", "Tandoori Papad (2 Pieces)", NULL, "tandoori-papad-2-pieces--p-12", "SKU-AK-p-12", "Crisp roasted urad dal papads from clay tandoor.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 49, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 12, NOW(3), NOW(3)),
("p-13", "rest_aapno_khano", "cat-first-course", NULL, "ks-pantry", "Fried Papad (2 Pieces)", "Fried Papad (2 Pieces)", NULL, "fried-papad-2-pieces--p-13", "SKU-AK-p-13", "Golden fried crunchy lentil papads.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 69, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 13, NOW(3), NOW(3)),
("p-14", "rest_aapno_khano", "cat-first-course", NULL, "ks-pantry", "Masala Papad", "Masala Papad", NULL, "masala-papad-p-14", "SKU-AK-p-14", "Topped with spicy onion, tomato, coriander and sev.", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&h=1000&fit=crop&q=80", 99, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 14, NOW(3), NOW(3)),
("p-15", "rest_aapno_khano", "cat-first-course", NULL, "ks-pantry", "Papad Basket", "Papad Basket", NULL, "papad-basket-p-15", "SKU-AK-p-15", "Assorted basket of spiced, roasted, fried and masala papads with mint dip.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 189, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 15, NOW(3), NOW(3)),
("p-16", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Malai Sweet Corn", "Malai Sweet Corn", NULL, "malai-sweet-corn-p-16", "SKU-AK-p-16", "Creamy malai tossed butter corn.", "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=1000&h=1000&fit=crop&q=80", 69, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 16, NOW(3), NOW(3)),
("p-17", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "French Fries", "French Fries", NULL, "french-fries-p-17", "SKU-AK-p-17", "Crispy salted potato fries.", "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=1000&h=1000&fit=crop&q=80", 99, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 17, NOW(3), NOW(3)),
("p-18", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Roasted Mix Nuts", "Roasted Mix Nuts", NULL, "roasted-mix-nuts-p-18", "SKU-AK-p-18", "Ghee-roasted cashew, almond and peanut blend.", "https://images.unsplash.com/photo-1536591375315-1b8368903277?w=1000&h=1000&fit=crop&q=80", 109, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 18, NOW(3), NOW(3)),
("p-19", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Crispy Corn", "Crispy Corn", NULL, "crispy-corn-p-19", "SKU-AK-p-19", "Golden fried corn kernels with garlic and bell peppers.", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1000&h=1000&fit=crop&q=80", 189, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 19, NOW(3), NOW(3)),
("p-20", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Mushroom Duplex", "Mushroom Duplex", NULL, "mushroom-duplex-p-20", "SKU-AK-p-20", "Stuffed cheese mushroom caps crumbed and crisp fried.", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=1000&fit=crop&q=80", 199, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 20, NOW(3), NOW(3)),
("p-21", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Cheese Corn Ball", "Cheese Corn Ball", NULL, "cheese-corn-ball-p-21", "SKU-AK-p-21", "Melt-in-mouth mozzarella and sweet corn balls.", "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=1000&h=1000&fit=crop&q=80", 219, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 21, NOW(3), NOW(3)),
("p-22", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Paneer Nuggets", "Paneer Nuggets", NULL, "paneer-nuggets-p-22", "SKU-AK-p-22", "Crispy golden paneer bites with herb seasoning.", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1000&h=1000&fit=crop&q=80", 219, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 22, NOW(3), NOW(3)),
("p-23", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Chilly Paneer Dry", "Chilly Paneer Dry", NULL, "chilly-paneer-dry-p-23", "SKU-AK-p-23", "Wok tossed paneer cubes with peppers and hot garlic soya.", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&h=1000&fit=crop&q=80", 219, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 23, NOW(3), NOW(3)),
("p-24", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Chilly Mushroom Dry", "Chilly Mushroom Dry", NULL, "chilly-mushroom-dry-p-24", "SKU-AK-p-24", "Crispy button mushrooms wok tossed with scallions.", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=1000&fit=crop&q=80", 219, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 24, NOW(3), NOW(3)),
("p-25", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Dahi Ke Solay", "Dahi Ke Solay", NULL, "dahi-ke-solay-p-25", "SKU-AK-p-25", "Hung curd & crushed dry fruit bread rolls fried golden.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 249, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 25, NOW(3), NOW(3)),
("p-26", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Dahi Kabab", "Dahi Kabab", NULL, "dahi-kabab-p-26", "SKU-AK-p-26", "Velvety curd patties infused with green cardamom and saffron.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 269, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 26, NOW(3), NOW(3)),
("p-27", "rest_aapno_khano", "cat-malai-and-crispy", NULL, "ks-handi", "Crispy Platter", "Crispy Platter", NULL, "crispy-platter-p-27", "SKU-AK-p-27", "Grand platter of Mushroom Duplex, Cheese Corn Ball, Paneer Nuggets, Dahi Ke Solay & Dahi Kabab.", "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&h=1000&fit=crop&q=80", 399, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 27, NOW(3), NOW(3)),
("p-28", "rest_aapno_khano", "cat-veg-tandoor-bites", NULL, "ks-tandoor", "Masala Chaap", "Masala Chaap", NULL, "masala-chaap-p-28", "SKU-AK-p-28", "Soya chaap marinated in robust tandoori masala and mustard oil.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 219, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 28, NOW(3), NOW(3)),
("p-29", "rest_aapno_khano", "cat-veg-tandoor-bites", NULL, "ks-tandoor", "Lemon Chaap", "Lemon Chaap", NULL, "lemon-chaap-p-29", "SKU-AK-p-29", "Tangy lemon and black pepper spiced soya skewers.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 229, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 29, NOW(3), NOW(3)),
("p-30", "rest_aapno_khano", "cat-veg-tandoor-bites", NULL, "ks-tandoor", "Malai Chaap", "Malai Chaap", NULL, "malai-chaap-p-30", "SKU-AK-p-30", "Rich cashew and cream marinated soya grilled over live coals.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 239, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 30, NOW(3), NOW(3)),
("p-31", "rest_aapno_khano", "cat-veg-tandoor-bites", NULL, "ks-tandoor", "Afghani Kali Mirch Chaap", "Afghani Kali Mirch Chaap", NULL, "afghani-kali-mirch-chaap-p-31", "SKU-AK-p-31", "Smoky crushed black peppercorn cream chaap.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 249, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 31, NOW(3), NOW(3)),
("p-32", "rest_aapno_khano", "cat-veg-tandoor-bites", NULL, "ks-tandoor", "Veg Seekh Kabab", "Veg Seekh Kabab", NULL, "veg-seekh-kabab-p-32", "SKU-AK-p-32", "Minced spiced vegetable skewers roasted over glowing charcoal.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 249, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 32, NOW(3), NOW(3)),
("p-33", "rest_aapno_khano", "cat-veg-tandoor-bites", NULL, "ks-tandoor", "Paneer Tikka", "Paneer Tikka", NULL, "paneer-tikka-p-33", "SKU-AK-p-33", "Fresh malai paneer cubes in royal tandoori marinade with peppers.", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1000&h=1000&fit=crop&q=80", 249, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 33, NOW(3), NOW(3)),
("p-34", "rest_aapno_khano", "cat-veg-tandoor-bites", NULL, "ks-tandoor", "Paneer Malai Tikka", "Paneer Malai Tikka", NULL, "paneer-malai-tikka-p-34", "SKU-AK-p-34", "Cardamom and cashew cream coated soft cottage cheese.", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1000&h=1000&fit=crop&q=80", 259, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 34, NOW(3), NOW(3)),
("p-35", "rest_aapno_khano", "cat-veg-tandoor-bites", NULL, "ks-tandoor", "Mushroom Tikka", "Mushroom Tikka", NULL, "mushroom-tikka-p-35", "SKU-AK-p-35", "Marinated button mushrooms skewered and roasted.", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=1000&fit=crop&q=80", 259, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 35, NOW(3), NOW(3)),
("p-36", "rest_aapno_khano", "cat-veg-tandoor-bites", NULL, "ks-tandoor", "Tandoori Veg Platter", "Tandoori Veg Platter", NULL, "tandoori-veg-platter-p-36", "SKU-AK-p-36", "Assorted Lemon Chaap, Malai Chaap, Veg Seekh Kabab, Paneer Tikka & Mushroom Tikka.", "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&h=1000&fit=crop&q=80", 599, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 36, NOW(3), NOW(3)),
("p-37", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Dal Tadka", "Dal Tadka", NULL, "dal-tadka-p-37", "SKU-AK-p-37", "Yellow lentils tempered with cumin, garlic, dry red chilies and pure desi ghee.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 199, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 37, NOW(3), NOW(3)),
("p-38", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Dal Makhani", "Dal Makhani", NULL, "dal-makhani-p-38", "SKU-AK-p-38", "Signature black lentils slow-simmered overnight with white butter and rich cream.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 219, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 38, NOW(3), NOW(3)),
("p-39", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Chana Masala", "Chana Masala", NULL, "chana-masala-p-39", "SKU-AK-p-39", "Tender chickpeas cooked in traditional Amritsari pomegranate-spiced gravy.", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&h=1000&fit=crop&q=80", 219, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 39, NOW(3), NOW(3)),
("p-40", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Mix Veg Handi", "Mix Veg Handi", NULL, "mix-veg-handi-p-40", "SKU-AK-p-40", "Seasonal garden vegetables tossed in thick onion-tomato handi masala.", "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&h=1000&fit=crop&q=80", 229, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 40, NOW(3), NOW(3)),
("p-41", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Dum Aloo Kashmiri", "Dum Aloo Kashmiri", NULL, "dum-aloo-kashmiri-p-41", "SKU-AK-p-41", "Baby potatoes stuffed with paneer and simmered in aromatic fennel and ginger gravy.", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&h=1000&fit=crop&q=80", 229, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 41, NOW(3), NOW(3)),
("p-42", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Mushroom Do Pyaza", "Mushroom Do Pyaza", NULL, "mushroom-do-pyaza-p-42", "SKU-AK-p-42", "Fresh button mushrooms cooked with caramelized baby onions and crushed spices.", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=1000&fit=crop&q=80", 249, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 42, NOW(3), NOW(3)),
("p-43", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Matar Paneer", "Matar Paneer", NULL, "matar-paneer-p-43", "SKU-AK-p-43", "Soft paneer and sweet green peas in home-style spiced curry.", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1000&h=1000&fit=crop&q=80", 249, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 43, NOW(3), NOW(3)),
("p-44", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Kadhai Paneer", "Kadhai Paneer", NULL, "kadhai-paneer-p-44", "SKU-AK-p-44", "Cottage cheese wok-tossed with crushed coriander seeds, bell peppers and spicy gravy.", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1000&h=1000&fit=crop&q=80", 269, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 44, NOW(3), NOW(3)),
("p-45", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Paneer Butter Masala", "Paneer Butter Masala", NULL, "paneer-butter-masala-p-45", "SKU-AK-p-45", "Silky smooth tomato and cashew nut makhani gravy enriched with butter.", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1000&h=1000&fit=crop&q=80", 279, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 45, NOW(3), NOW(3)),
("p-46", "rest_aapno_khano", "cat-main-course-veg", NULL, "ks-handi", "Shahi Paneer", "Shahi Paneer", NULL, "shahi-paneer-p-46", "SKU-AK-p-46", "Royal Mughlai preparation of paneer in aromatic white cashew cream sauce.", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1000&h=1000&fit=crop&q=80", 289, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 46, NOW(3), NOW(3)),
("p-47", "rest_aapno_khano", "cat-red-and-white-snacks", NULL, "ks-handi", "Boiled Eggs (2 Eggs)", "Boiled Eggs (2 Eggs)", NULL, "boiled-eggs-2-eggs--p-47", "SKU-AK-p-47", "Farm fresh hard-boiled eggs served with black pepper and chaat masala.", "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=1000&h=1000&fit=crop&q=80", 49, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 47, NOW(3), NOW(3)),
("p-48", "rest_aapno_khano", "cat-red-and-white-snacks", NULL, "ks-handi", "Fried Egg (2 Eggs)", "Fried Egg (2 Eggs)", NULL, "fried-egg-2-eggs--p-48", "SKU-AK-p-48", "Sunny-side up or double-fried farm eggs with butter.", "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1000&h=1000&fit=crop&q=80", 69, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 48, NOW(3), NOW(3)),
("p-49", "rest_aapno_khano", "cat-red-and-white-snacks", NULL, "ks-handi", "Plain Omelette (2 Eggs)", "Plain Omelette (2 Eggs)", NULL, "plain-omelette-2-eggs--p-49", "SKU-AK-p-49", "Fluffy two-egg omelette with light seasoning.", "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=1000&h=1000&fit=crop&q=80", 79, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 49, NOW(3), NOW(3)),
("p-50", "rest_aapno_khano", "cat-red-and-white-snacks", NULL, "ks-handi", "Masala Omelette (2 Eggs)", "Masala Omelette (2 Eggs)", NULL, "masala-omelette-2-eggs--p-50", "SKU-AK-p-50", "Loaded with chopped onions, green chilies, tomatoes and fresh coriander.", "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=1000&h=1000&fit=crop&q=80", 99, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 50, NOW(3), NOW(3)),
("p-51", "rest_aapno_khano", "cat-red-and-white-snacks", NULL, "ks-handi", "Egg Bhurji (3 Eggs)", "Egg Bhurji (3 Eggs)", NULL, "egg-bhurji-3-eggs--p-51", "SKU-AK-p-51", "Spiced scrambled farm eggs with butter, onions and aromatic spices.", "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1000&h=1000&fit=crop&q=80", 119, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 51, NOW(3), NOW(3)),
("p-52", "rest_aapno_khano", "cat-red-and-white-snacks", NULL, "ks-handi", "Cheese Omelette (2 Eggs)", "Cheese Omelette (2 Eggs)", NULL, "cheese-omelette-2-eggs--p-52", "SKU-AK-p-52", "Folded fluffy omelette stuffed with melted mozzarella.", "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=1000&h=1000&fit=crop&q=80", 129, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 52, NOW(3), NOW(3)),
("p-53", "rest_aapno_khano", "cat-red-and-white-snacks", NULL, "ks-handi", "Egg Pakoda (6 Pieces)", "Egg Pakoda (6 Pieces)", NULL, "egg-pakoda-6-pieces--p-53", "SKU-AK-p-53", "Boiled egg halves batter-dipped in spiced gram flour and fried crisp.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 149, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 53, NOW(3), NOW(3)),
("p-54", "rest_aapno_khano", "cat-non-veg-tandoor", NULL, "ks-tandoor", "Tandoori Chicken", "Tandoori Chicken", NULL, "tandoori-chicken-p-54", "SKU-AK-p-54", "Whole bone-in chicken marinated in yogurt, Kashmiri red chili and roasted in clay oven.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 299, NULL, 1, "HALF_FULL", 299, NULL, 499, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 54, NOW(3), NOW(3)),
("p-55", "rest_aapno_khano", "cat-non-veg-tandoor", NULL, "ks-tandoor", "Afghani Chicken", "Afghani Chicken", NULL, "afghani-chicken-p-55", "SKU-AK-p-55", "Rich cashew paste, white pepper and cream glazed charcoal-roasted chicken.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 329, NULL, 1, "HALF_FULL", 329, NULL, 549, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 55, NOW(3), NOW(3)),
("p-56", "rest_aapno_khano", "cat-non-veg-tandoor", NULL, "ks-tandoor", "Chicken Tikka (6 Pieces)", "Chicken Tikka (6 Pieces)", NULL, "chicken-tikka-6-pieces--p-56", "SKU-AK-p-56", "Boneless chicken morsels in classic spicy tandoori marinade with mint chutney.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 299, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 56, NOW(3), NOW(3)),
("p-57", "rest_aapno_khano", "cat-non-veg-tandoor", NULL, "ks-tandoor", "Chicken Malai Tikka (6 Pieces)", "Chicken Malai Tikka (6 Pieces)", NULL, "chicken-malai-tikka-6-pieces--p-57", "SKU-AK-p-57", "Melt-in-mouth chicken chunks in cardamom cream and roasted cheese marinade.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 329, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 57, NOW(3), NOW(3)),
("p-58", "rest_aapno_khano", "cat-non-veg-tandoor", NULL, "ks-tandoor", "Chicken Seekh Kabab", "Chicken Seekh Kabab", NULL, "chicken-seekh-kabab-p-58", "SKU-AK-p-58", "Minced chicken skewers seasoned with herbs, mint, and tandoori spices.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 299, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 58, NOW(3), NOW(3)),
("p-59", "rest_aapno_khano", "cat-non-veg-tandoor", NULL, "ks-tandoor", "Chicken Kali Mirch Tikka", "Chicken Kali Mirch Tikka", NULL, "chicken-kali-mirch-tikka-p-59", "SKU-AK-p-59", "Pungent crushed black peppercorn crusted grilled chicken.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 319, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 59, NOW(3), NOW(3)),
("p-60", "rest_aapno_khano", "cat-non-veg-tandoor", NULL, "ks-tandoor", "Chicken Tangri Kabab (4 Pieces)", "Chicken Tangri Kabab (4 Pieces)", NULL, "chicken-tangri-kabab-4-pieces--p-60", "SKU-AK-p-60", "Stuffed succulent chicken drumsticks roasted in clay tandoor.", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&h=1000&fit=crop&q=80", 349, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 60, NOW(3), NOW(3)),
("p-61", "rest_aapno_khano", "cat-non-veg-tandoor", NULL, "ks-tandoor", "Tandoori Non-Veg Platter", "Tandoori Non-Veg Platter", NULL, "tandoori-non-veg-platter-p-61", "SKU-AK-p-61", "Assorted platter of Tandoori Chicken, Chicken Tikka, Malai Tikka & Chicken Seekh Kabab.", "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&h=1000&fit=crop&q=80", 699, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 61, NOW(3), NOW(3)),
("p-62", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Egg Curry (2 Eggs)", "Egg Curry (2 Eggs)", NULL, "egg-curry-2-eggs--p-62", "SKU-AK-p-62", "Boiled and shallow-fried eggs in spicy dhaba-style onion tomato gravy.", "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=1000&h=1000&fit=crop&q=80", 199, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 62, NOW(3), NOW(3)),
("p-63", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Chicken Curry (Home Style)", "Chicken Curry (Home Style)", NULL, "chicken-curry-home-style--p-63", "SKU-AK-p-63", "Home-style slow cooked country chicken in whole spice gravy.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 319, NULL, 1, "HALF_FULL", 319, NULL, 529, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 63, NOW(3), NOW(3)),
("p-64", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Kadhai Chicken", "Kadhai Chicken", NULL, "kadhai-chicken-p-64", "SKU-AK-p-64", "Tender chicken tossed with capsicum, onion flakes and freshly ground coriander spices.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 339, NULL, 1, "HALF_FULL", 339, NULL, 559, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 64, NOW(3), NOW(3)),
("p-65", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Butter Chicken (Murgh Makhani)", "Butter Chicken (Murgh Makhani)", NULL, "butter-chicken-murgh-makhani--p-65", "SKU-AK-p-65", "Iconic Delhi style tandoori chicken simmered in rich creamy tomato and butter gravy.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 349, NULL, 1, "HALF_FULL", 349, NULL, 579, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 65, NOW(3), NOW(3)),
("p-66", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Chicken Handi (Aapno Special)", "Chicken Handi (Aapno Special)", NULL, "chicken-handi-aapno-special--p-66", "SKU-AK-p-66", "Specialty earthenware pot cooked chicken enriched with desi ghee and secret spices.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 349, NULL, 1, "HALF_FULL", 349, NULL, 579, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 66, NOW(3), NOW(3)),
("p-67", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Chicken Rara", "Chicken Rara", NULL, "chicken-rara-p-67", "SKU-AK-p-67", "Chicken pieces cooked in rich, spicy minced chicken (keema) gravy.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 369, NULL, 1, "HALF_FULL", 369, NULL, 599, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 67, NOW(3), NOW(3)),
("p-68", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Chicken Tikka Masala", "Chicken Tikka Masala", NULL, "chicken-tikka-masala-p-68", "SKU-AK-p-68", "Boneless grilled chicken tikka tossed in spicy and tangy masala gravy.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 349, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 68, NOW(3), NOW(3)),
("p-69", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Chicken Kali Mirch Gravy", "Chicken Kali Mirch Gravy", NULL, "chicken-kali-mirch-gravy-p-69", "SKU-AK-p-69", "Creamy cashew and black pepper gravy with succulent chicken chunks.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 349, NULL, 1, "HALF_FULL", 349, NULL, 579, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 69, NOW(3), NOW(3)),
("p-70", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Chicken Dum Biryani (With Raita)", "Chicken Dum Biryani (With Raita)", NULL, "chicken-dum-biryani-with-raita--p-70", "SKU-AK-p-70", "Aromatic aged Basmati rice layered with spiced chicken and sealed in clay pot.", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000&h=1000&fit=crop&q=80", 299, NULL, 1, "HALF_FULL", 299, NULL, 499, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 70, NOW(3), NOW(3)),
("p-71", "rest_aapno_khano", "cat-main-course-non-veg", NULL, "ks-handi", "Mutton Curry (Seasonal Special)", "Mutton Curry (Seasonal Special)", NULL, "mutton-curry-seasonal-special--p-71", "SKU-AK-p-71", "Slow cooked tender mutton pieces in spicy traditional Rajasthani Laal Maas gravy.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80", 449, NULL, 1, "HALF_FULL", 449, NULL, 799, 5.0, "GST 5%", 0, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 71, NOW(3), NOW(3)),
("p-72", "rest_aapno_khano", "cat-indian-breads", NULL, "ks-handi", "Tandoori Roti Plain", "Tandoori Roti Plain", NULL, "tandoori-roti-plain-p-72", "SKU-AK-p-72", "Whole wheat bread baked in clay tandoor.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 15, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 72, NOW(3), NOW(3)),
("p-73", "rest_aapno_khano", "cat-indian-breads", NULL, "ks-handi", "Tandoori Butter Roti", "Tandoori Butter Roti", NULL, "tandoori-butter-roti-p-73", "SKU-AK-p-73", "Whole wheat roti brushed with pure desi ghee or Amul butter.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 20, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 73, NOW(3), NOW(3)),
("p-74", "rest_aapno_khano", "cat-indian-breads", NULL, "ks-handi", "Plain Naan", "Plain Naan", NULL, "plain-naan-p-74", "SKU-AK-p-74", "Soft leavened refined flour flatbread.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 40, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 74, NOW(3), NOW(3)),
("p-75", "rest_aapno_khano", "cat-indian-breads", NULL, "ks-handi", "Butter Naan", "Butter Naan", NULL, "butter-naan-p-75", "SKU-AK-p-75", "Layered soft naan brushed with salted butter.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 50, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 75, NOW(3), NOW(3)),
("p-76", "rest_aapno_khano", "cat-indian-breads", NULL, "ks-handi", "Garlic Butter Naan", "Garlic Butter Naan", NULL, "garlic-butter-naan-p-76", "SKU-AK-p-76", "Topped with minced garlic and coriander.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 65, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 1, 0, 0, 0, 76, NOW(3), NOW(3)),
("p-77", "rest_aapno_khano", "cat-indian-breads", NULL, "ks-handi", "Lachha Paratha", "Lachha Paratha", NULL, "lachha-paratha-p-77", "SKU-AK-p-77", "Multi-layered crispy whole wheat paratha.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&h=1000&fit=crop&q=80", 55, NULL, 0, "HALF_FULL", NULL, NULL, NULL, 5.0, "GST 5%", 1, 0, 0, 0, 1, 15, 1, 0, 0, 0, 0, 77, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name), basePrice=VALUES(basePrice);


-- --------------------------------------------------------
-- Table structure for table `DaySession`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `DaySession` (
  `id` VARCHAR(191) NOT NULL,
  `restaurantId` VARCHAR(191) NOT NULL,
  `sessionDate` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT "OPEN",
  `openingCash` DOUBLE NOT NULL DEFAULT 0,
  `closingCash` DOUBLE NULL,
  `actualCashCount` DOUBLE NULL,
  `cashVariance` DOUBLE NULL,
  `totalSales` DOUBLE NOT NULL DEFAULT 0,
  `totalCashSales` DOUBLE NOT NULL DEFAULT 0,
  `totalUpiSales` DOUBLE NOT NULL DEFAULT 0,
  `totalCardSales` DOUBLE NOT NULL DEFAULT 0,
  `totalOrders` INT NOT NULL DEFAULT 0,
  `totalKots` INT NOT NULL DEFAULT 0,
  `totalTax` DOUBLE NOT NULL DEFAULT 0,
  `totalDiscounts` DOUBLE NOT NULL DEFAULT 0,
  `totalExpenses` DOUBLE NOT NULL DEFAULT 0,
  `netRevenue` DOUBLE NOT NULL DEFAULT 0,
  `openedByUserId` VARCHAR(191) NULL,
  `openedByName` VARCHAR(191) NULL,
  `closedByUserId` VARCHAR(191) NULL,
  `closedByName` VARCHAR(191) NULL,
  `openedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `closedAt` DATETIME(3) NULL,
  `closingNotes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `DaySession_restaurantId_sessionDate_key` (`restaurantId`, `sessionDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `DaySession` (`id`, `restaurantId`, `sessionDate`, `status`, `openingCash`, `totalSales`, `totalOrders`, `openedByName`)
VALUES ("sess_init_today", "rest_aapno_khano", CURDATE(), "OPEN", 2000, 0, 0, "Fatehabad Store Manager")
ON DUPLICATE KEY UPDATE `status`="OPEN";
