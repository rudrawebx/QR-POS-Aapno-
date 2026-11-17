import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getCurrentSession,
  hashPassword,
  allocateNextQsrNumber,
  signSessionToken,
  normalizeEmail,
  normalizeMobile,
} from '@/lib/auth';
import { MASTER_AAPNO_KHANO_CATEGORIES } from '@/lib/menuData';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access only.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7D'; // TODAY, YESTERDAY, 7D, 30D, MONTH, CUSTOM
    const customFrom = searchParams.get('from');
    const customTo = searchParams.get('to');

    const now = new Date();
    let rangeStart = new Date(now);
    let rangeEnd = new Date(now);
    rangeEnd.setHours(23, 59, 59, 999);

    if (range === 'TODAY') {
      rangeStart.setHours(0, 0, 0, 0);
    } else if (range === 'YESTERDAY') {
      rangeStart.setDate(now.getDate() - 1);
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(rangeStart);
      rangeEnd.setHours(23, 59, 59, 999);
    } else if (range === '30D') {
      rangeStart.setDate(now.getDate() - 29);
      rangeStart.setHours(0, 0, 0, 0);
    } else if (range === 'MONTH') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'CUSTOM' && customFrom) {
      rangeStart = new Date(customFrom);
      if (customTo) {
        rangeEnd = new Date(customTo);
        rangeEnd.setHours(23, 59, 59, 999);
      }
    } else {
      // 7D default
      rangeStart.setDate(now.getDate() - 6);
      rangeStart.setHours(0, 0, 0, 0);
    }

    let restaurants: any[] = [];
    let plans: any[] = [];
    let allOrders: any[] = [];
    let allUsers: any[] = [];
    let products: any[] = [];
    let categories: any[] = [];
    let applications: any[] = [];

    try {
      if (prisma) {
        restaurants = await prisma.restaurant.findMany({
          include: {
            settings: true,
            subscriptions: {
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            branches: true,
            tables: true,
            orders: true,
            invoices: true,
            payments: true,
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        plans = await prisma.subscriptionPlan.findMany({
          orderBy: { monthlyPrice: 'asc' },
        });

        allOrders = await prisma.order.findMany({
          select: { grandTotal: true, status: true, paymentStatus: true, createdAt: true },
        });

        allUsers = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            restaurant: { select: { id: true, name: true, slug: true, qsrNumber: true } },
            branch: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

        products = await prisma.product.findMany({
          where: { isArchived: false },
          include: { category: true },
          orderBy: { displayOrder: 'asc' },
        });

        categories = await prisma.category.findMany({
          orderBy: { displayOrder: 'asc' },
        });

        var auditLogs: any[] = await prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        applications = await prisma.restaurantApplication.findMany({
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            applicationRef: true,
            ownerName: true,
            restaurantName: true,
            email: true,
            mobile: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            logoUrl: true,
            coverUrl: true,
            gstin: true,
            fssaiNumber: true,
            upiId: true,
            status: true,
            rejectionReason: true,
            adminNotes: true,
            assignedQsrNumber: true,
            restaurantId: true,
            reviewedBy: true,
            reviewedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Superadmin DB query warning, using fallback catalogs:', dbErr);
    }

    // Fallbacks if tables are freshly initialized or offline
    if (products.length === 0) {
      const fallbackProds: any[] = [];
      MASTER_AAPNO_KHANO_CATEGORIES.forEach((cat) => {
        (cat.products || []).forEach((p) => {
          fallbackProds.push({
            ...p,
            category: { id: cat.id, name: cat.name },
            categoryId: cat.id,
            displayOrder: 0,
          });
        });
      });
      products = fallbackProds;
    }

    if (categories.length === 0) {
      categories = MASTER_AAPNO_KHANO_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        localName: c.localName,
        displayOrder: c.displayOrder,
      }));
    }

    const filteredOrders = allOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= rangeStart && d <= rangeEnd;
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= todayStart);
    const todaySales = todayOrders
      .filter((o) => o.status === 'COMPLETED' || o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const totalGmv = filteredOrders
      .filter((o) => o.status === 'COMPLETED' || o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    // Build daily sales trend from real orders in selected range
    const salesByDay = new Map<string, { date: string; sales: number; orders: number }>();
    const cursor = new Date(rangeStart);
    while (cursor <= rangeEnd && salesByDay.size < 31) {
      const key = cursor.toISOString().slice(0, 10);
      const label = cursor.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      salesByDay.set(key, { date: label, sales: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    filteredOrders.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const bucket = salesByDay.get(key);
      if (bucket) {
        bucket.orders += 1;
        if (o.status === 'COMPLETED' || o.paymentStatus === 'PAID') {
          bucket.sales += Math.round(o.grandTotal);
        }
      }
    });
    const salesSeries = Array.from(salesByDay.values());

    const activeTenants = restaurants.filter((r) => r.isActive).length;
    const totalTransactions = filteredOrders.length;
    const totalOutlets = restaurants.reduce((sum, r) => sum + (r.branches?.length || 1), 0);

    let monthlyPlatformRevenue = 0;
    let activeSubscriptions = 0;
    let expiringSubscriptions = 0;
    let trialTenants = 0;
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    restaurants.forEach((r) => {
      const activeSub = r.subscriptions?.[0];
      if (activeSub) {
        if (activeSub.status === 'ACTIVE') {
          activeSubscriptions += 1;
          if (activeSub.plan) monthlyPlatformRevenue += activeSub.plan.monthlyPrice;
          if (activeSub.currentPeriodEnd && new Date(activeSub.currentPeriodEnd) <= sevenDaysFromNow) {
            expiringSubscriptions += 1;
          }
        } else if (activeSub.status === 'TRIAL') {
          trialTenants += 1;
        }
      }
    });

    const pendingPayments = allOrders.filter((o) => o.paymentStatus === 'PENDING').length;

    let activeTerminals = 0;
    let openTicketsCount = 0;
    let recentTickets: any[] = [];
    try {
      activeTerminals = await (prisma as any).posTerminal.count({
        where: { isActive: true, status: 'ONLINE' },
      });
    } catch {
      activeTerminals = 0;
    }
    try {
      openTicketsCount = await (prisma as any).supportTicket.count({
        where: { status: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_RESTAURANT'] } },
      });
      recentTickets = await (prisma as any).supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    } catch {
      openTicketsCount = 0;
      recentTickets = [];
    }

    const pendingApprovals = applications.filter((a) => a.status === 'PENDING_APPROVAL').length;
    const underReview = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
    const approvedApps = applications.filter((a) => a.status === 'APPROVED').length;
    const rejectedApplications = applications.filter((a) => a.status === 'REJECTED').length;
    const suspendedRestaurants = restaurants.filter((r) => !r.isActive || r.status === 'SUSPENDED').length;

    return NextResponse.json({
      summary: {
        totalRestaurants: restaurants.length,
        activeTenants,
        activeRestaurants: activeTenants,
        trialTenants,
        newRequests: pendingApprovals + underReview,
        pendingApprovals,
        underReview,
        approvedRestaurants: approvedApps || restaurants.length,
        rejectedApplications,
        suspendedRestaurants,
        totalOutlets,
        activeTerminals,
        totalOrders: filteredOrders.length,
        todayOrdersCount: todayOrders.length,
        todaySales: Math.round(todaySales),
        totalGmv: Math.round(totalGmv),
        activeSubscriptions,
        expiringSubscriptions,
        openTicketsCount,
        pendingPayments,
        monthlyPlatformRevenue: Math.round(monthlyPlatformRevenue),
        totalTransactions,
      },
      salesSeries,
      recentTickets,
      restaurants: restaurants.map((r) => ({
        id: r.id,
        qsrNumber: r.qsrNumber || (r.slug === 'aapno-khano' ? 'QSR01' : r.slug === 'mr-bagri' ? 'QSR02' : 'TENANT'),
        name: r.name,
        ownerName: r.ownerName || 'Owner',
        slug: r.slug,
        uniqueUsername: r.uniqueUsername,
        logoUrl: r.logoUrl,
        address: r.address,
        city: r.city,
        state: r.state,
        postalCode: r.postalCode,
        phone: r.phone,
        email: r.email,
        gstin: r.gstin,
        fssaiNumber: r.fssaiNumber,
        upiId: r.settings?.upiId || null,
        status: r.status || (r.isActive ? 'ACTIVE' : 'SUSPENDED'),
        isActive: r.isActive,
        lastLoginAt: r.lastLoginAt,
        createdAt: r.createdAt,
        tablesCount: r.tables?.length || 0,
        branchesCount: r.branches?.length || 1,
        usersCount: r.users?.length || 0,
        ordersCount: r.orders?.length || 0,
        revenue: Math.round((r.invoices || []).reduce((s: number, inv: any) => s + inv.grandTotal, 0)),
        currentPlan: r.subscriptions?.[0]?.plan?.name || 'Professional Plan',
        subscriptionStatus: r.subscriptions?.[0]?.status || 'ACTIVE',
      })),
      applications,
      users: allUsers,
      plans,
      auditLogs: typeof auditLogs !== 'undefined' ? auditLogs : [],
      products,
      categories,
    });
  } catch (error) {
    console.error('Superadmin fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch superadmin metrics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access only.' }, { status: 403 });
    }

    const data = await request.json();
    const { action } = data;

    // 0. SWITCH ACTIVE RESTAURANT CONTEXT FOR SUPER ADMIN
    if (action === 'SWITCH_RESTAURANT') {
      const { restaurantId } = data;
      const targetRest = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });
      if (!targetRest) {
        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
      }

      const updatedSession = {
        ...session,
        role: 'SUPER_ADMIN' as const,
        restaurantId: targetRest.id,
        restaurantSlug: targetRest.slug,
        restaurantName: targetRest.name,
        qsrNumber: targetRest.qsrNumber,
        logoUrl: targetRest.logoUrl || (targetRest.slug === 'mr-bagri' ? '/images/mr-bagri-logo.jpg' : '/images/aapno-khano-logo.png'),
      };

      const res = NextResponse.json({ success: true, restaurant: targetRest });
      res.cookies.set('auth_session', signSessionToken(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    // 1. CREATE PRODUCT / DISH
    if (action === 'CREATE_PRODUCT') {
      const {
        name,
        localName,
        categoryId,
        basePrice,
        imageUrl,
        isVeg,
        description,
        hasVariations,
        priceSmallHalf,
        priceLargeFull,
        isAvailable = true,
      } = data;

      const slug = (name || 'dish').toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now().toString(36)}`;
      let product: any = {
        id: `prod_${Date.now()}`,
        restaurantId: 'rest_aapno_khano',
        categoryId: categoryId || 'cat_handi',
        name,
        localName: localName || name,
        slug,
        basePrice: parseFloat(basePrice || '199'),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80',
        isVeg: Boolean(isVeg),
        description: description || '',
        hasVariations: Boolean(hasVariations),
        priceSmallHalf: priceSmallHalf ? parseFloat(priceSmallHalf) : null,
        priceLargeFull: priceLargeFull ? parseFloat(priceLargeFull) : null,
        isAvailable: Boolean(isAvailable),
        isArchived: false,
      };

      try {
        if (prisma) {
          // Ensure category exists or fallback
          let cat = await prisma.category.findFirst({ where: { id: categoryId } });
          if (!cat) {
            cat = await prisma.category.findFirst();
          }
          if (cat) {
            product = await prisma.product.create({
              data: {
                restaurantId: 'rest_aapno_khano',
                categoryId: cat.id,
                name,
                localName: localName || name,
                slug,
                basePrice: parseFloat(basePrice || '199'),
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80',
                isVeg: Boolean(isVeg),
                description: description || '',
                hasVariations: Boolean(hasVariations),
                priceSmallHalf: priceSmallHalf ? parseFloat(priceSmallHalf) : null,
                priceLargeFull: priceLargeFull ? parseFloat(priceLargeFull) : null,
                isAvailable: Boolean(isAvailable),
                isArchived: false,
              },
              include: { category: true },
            });
          }
        }
      } catch (dbErr) {
        console.warn('DB create product warning:', dbErr);
      }

      return NextResponse.json({ success: true, product });
    }

    // 2. UPDATE PRODUCT / DISH
    if (action === 'UPDATE_PRODUCT') {
      const {
        productId,
        name,
        localName,
        categoryId,
        basePrice,
        imageUrl,
        isVeg,
        description,
        hasVariations,
        priceSmallHalf,
        priceLargeFull,
        isAvailable,
      } = data;

      let product: any = { id: productId, name, localName, basePrice, imageUrl, isVeg, description };

      try {
        if (prisma) {
          const updateData: any = {};
          if (name !== undefined) updateData.name = name;
          if (localName !== undefined) updateData.localName = localName;
          if (categoryId !== undefined) updateData.categoryId = categoryId;
          if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
          if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
          if (isVeg !== undefined) updateData.isVeg = Boolean(isVeg);
          if (description !== undefined) updateData.description = description;
          if (hasVariations !== undefined) updateData.hasVariations = Boolean(hasVariations);
          if (priceSmallHalf !== undefined) updateData.priceSmallHalf = priceSmallHalf ? parseFloat(priceSmallHalf) : null;
          if (priceLargeFull !== undefined) updateData.priceLargeFull = priceLargeFull ? parseFloat(priceLargeFull) : null;
          if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

          product = await prisma.product.update({
            where: { id: productId },
            data: updateData,
            include: { category: true },
          });
        }
      } catch (dbErr) {
        console.warn('DB update product warning:', dbErr);
      }

      return NextResponse.json({ success: true, product });
    }

    // 3. DELETE PRODUCT / DISH
    if (action === 'DELETE_PRODUCT') {
      const { productId } = data;
      try {
        if (prisma) {
          await prisma.product.update({
            where: { id: productId },
            data: { isArchived: true, isAvailable: false },
          });
        }
      } catch (dbErr) {
        console.warn('DB delete product warning:', dbErr);
      }

      return NextResponse.json({ success: true, message: 'Product archived successfully' });
    }

    // 4. CREATE RESTAURANT (Atomic QSR Allocation)
    if (action === 'CREATE_RESTAURANT') {
      const { name, uniqueUsername, cuisine, phone, email, address, city, state, postalCode, ownerName, ownerPassword } = data;
      const baseSlug = (uniqueUsername || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const normEmail = normalizeEmail(email);

      const existingUser = await prisma.user.findUnique({ where: { email: normEmail } });
      if (existingUser) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const qsrNumber = await allocateNextQsrNumber(tx);
        const slug = `${baseSlug}-${qsrNumber.toLowerCase()}`;

        const restaurant = await tx.restaurant.create({
          data: {
            qsrNumber,
            name: name.trim(),
            displayName: name.trim(),
            ownerName: ownerName || `${name} Owner`,
            slug,
            uniqueUsername: slug,
            cuisine: cuisine || 'Multi-Cuisine',
            phone,
            email: normEmail,
            address: address || 'Main Commercial Road',
            city: city || 'Jaipur',
            state: state || 'Haryana',
            postalCode: postalCode || '125001',
            status: 'ACTIVE',
            isActive: true,
          },
        });

        await tx.restaurantSettings.create({
          data: {
            restaurantId: restaurant.id,
            upiId: '',
            upiMerchantName: name.trim(),
            upiQrEnabled: false,
            defaultReceiptFooter: `Thank you for visiting ${name.trim()}!`,
          },
        });

        const branch = await tx.branch.create({
          data: {
            restaurantId: restaurant.id,
            name: 'Main Dining & Kitchen',
            slug: 'main',
            address: address || 'Main Commercial Road',
            phone,
            isMain: true,
          },
        });

        await tx.user.create({
          data: {
            restaurantId: restaurant.id,
            branchId: branch.id,
            name: ownerName || `${name} Owner`,
            email: normEmail,
            passwordHash: hashPassword(ownerPassword || 'owner123'),
            role: 'OWNER',
            phone,
            pinCode: '1111',
            isActive: true,
          },
        });

        await tx.auditLog.create({
          data: {
            restaurantId: restaurant.id,
            userId: session.userId,
            userName: session.name,
            action: 'RESTAURANT_CREATED',
            entity: 'Restaurant',
            entityId: restaurant.id,
            notes: `Created tenant ${restaurant.name} (${qsrNumber})`,
          },
        });

        return restaurant;
      });

      return NextResponse.json({ success: true, restaurant: result });
    }

    // 4B. APPROVE RESTAURANT APPLICATION (Atomic Transaction + Unique QSR Number)
    if (action === 'APPROVE_APPLICATION') {
      const { applicationId } = data;
      if (!applicationId) {
        return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
      }

      const app = await prisma.restaurantApplication.findUnique({ where: { id: applicationId } });
      if (!app) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      if (app.status === 'APPROVED' && app.restaurantId) {
        return NextResponse.json({ error: `Application already approved as ${app.assignedQsrNumber}` }, { status: 409 });
      }

      const normEmail = normalizeEmail(app.email);
      const existingUser = await prisma.user.findUnique({ where: { email: normEmail } });
      if (existingUser) {
        return NextResponse.json({ error: 'An active user with this email already exists' }, { status: 409 });
      }

      const approvedData = await prisma.$transaction(async (tx) => {
        const qsrNumber = await allocateNextQsrNumber(tx);
        const baseSlug = app.restaurantName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
        const slug = `${baseSlug}-${qsrNumber.toLowerCase()}`;

        const restaurant = await tx.restaurant.create({
          data: {
            qsrNumber,
            name: app.restaurantName,
            displayName: app.restaurantName,
            ownerName: app.ownerName,
            slug,
            uniqueUsername: slug,
            logoUrl: app.logoUrl,
            bannerUrl: app.coverUrl,
            phone: app.mobile,
            email: normEmail,
            address: app.address,
            city: app.city,
            state: app.state,
            postalCode: app.pincode,
            gstRegistered: Boolean(app.gstin),
            gstin: app.gstin,
            fssaiRegistered: Boolean(app.fssaiNumber),
            fssaiNumber: app.fssaiNumber,
            status: 'ACTIVE',
            isActive: true,
          },
        });

        await tx.restaurantSettings.create({
          data: {
            restaurantId: restaurant.id,
            upiId: app.upiId || '',
            upiMerchantName: app.restaurantName,
            upiQrEnabled: Boolean(app.upiId),
            invoicePrefix: `${qsrNumber}-`,
            defaultReceiptFooter: `Thank you for visiting ${app.restaurantName}!`,
          },
        });

        const branch = await tx.branch.create({
          data: {
            restaurantId: restaurant.id,
            name: 'Main Outlet',
            slug: 'main',
            address: app.address,
            phone: app.mobile,
            isMain: true,
          },
        });

        const ownerUser = await tx.user.create({
          data: {
            restaurantId: restaurant.id,
            branchId: branch.id,
            name: app.ownerName,
            email: normEmail,
            phone: app.mobile,
            passwordHash: app.passwordHash, // Use the hashed password from registration
            role: 'OWNER',
            isActive: true,
          },
        });

        // Create 5 default starter tables for the new tenant
        for (let t = 1; t <= 5; t++) {
          await tx.table.create({
            data: {
              restaurantId: restaurant.id,
              branchId: branch.id,
              tableNumber: String(t),
              name: `Table ${t}`,
              capacity: 4,
              qrCodeToken: `${qsrNumber.toLowerCase()}_t${t}_${Date.now().toString(36)}`,
            },
          });
        }

        const updatedApp = await tx.restaurantApplication.update({
          where: { id: app.id },
          data: {
            status: 'APPROVED',
            assignedQsrNumber: qsrNumber,
            restaurantId: restaurant.id,
            reviewedBy: session.email,
            reviewedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            restaurantId: restaurant.id,
            userId: session.userId,
            userName: session.name,
            action: 'APPLICATION_APPROVED',
            entity: 'RestaurantApplication',
            entityId: app.id,
            notes: `Approved ${app.applicationRef} -> Assigned ${qsrNumber} (${app.restaurantName})`,
          },
        });

        return { restaurant, ownerUser, application: updatedApp, qsrNumber };
      });

      return NextResponse.json({
        success: true,
        qsrNumber: approvedData.qsrNumber,
        restaurant: approvedData.restaurant,
        message: `Application approved and assigned ${approvedData.qsrNumber}`,
      });
    }

    // 4C. REJECT OR REQUEST MORE INFO ON APPLICATION
    if (action === 'REJECT_APPLICATION' || action === 'REQUEST_INFO_APPLICATION') {
      const { applicationId, reason, notes } = data;
      const newStatus = action === 'REJECT_APPLICATION' ? 'REJECTED' : 'UNDER_REVIEW';
      const updated = await prisma.restaurantApplication.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
          rejectionReason: reason || null,
          adminNotes: notes || null,
          reviewedBy: session.email,
          reviewedAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          userName: session.name,
          action: action === 'REJECT_APPLICATION' ? 'APPLICATION_REJECTED' : 'APPLICATION_UNDER_REVIEW',
          entity: 'RestaurantApplication',
          entityId: applicationId,
          notes: `${updated.applicationRef} marked ${newStatus}: ${reason || notes || ''}`,
        },
      });

      return NextResponse.json({ success: true, application: updated });
    }

    // 4D. UPDATE RESTAURANT STATUS (ACTIVE / SUSPENDED / INACTIVE)
    if (action === 'UPDATE_RESTAURANT_STATUS') {
      const { restaurantId, status } = data;
      const isActive = status === 'ACTIVE' || status === 'APPROVED';
      const restaurant = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: { status, isActive },
      });

      await prisma.auditLog.create({
        data: {
          restaurantId,
          userId: session.userId,
          userName: session.name,
          action: 'RESTAURANT_STATUS_CHANGED',
          entity: 'Restaurant',
          entityId: restaurantId,
          notes: `${restaurant.qsrNumber || restaurant.name} status updated to ${status}`,
        },
      });

      return NextResponse.json({ success: true, restaurant });
    }

    // 5. CREATE TENANT USER
    if (action === 'CREATE_TENANT_USER') {
      const { restaurantId, name, email, phone, role, password, pinCode } = data;

      if (role === 'SUPER_ADMIN') {
        return NextResponse.json({ error: '403 Forbidden — Cannot create Super Admin account' }, { status: 403 });
      }

      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (existing) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
      }

      const user = await prisma.user.create({
        data: {
          restaurantId: restaurantId || 'rest_aapno_khano',
          name,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          role: role || 'MANAGER',
          passwordHash: hashPassword(password || 'staff123'),
          pinCode: pinCode || '1234',
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, user });
    }

    // 6. TOGGLE STATUS
    if (action === 'TOGGLE_STATUS') {
      const { restaurantId, isActive } = data;
      const restaurant = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: { isActive },
      });
      return NextResponse.json({ success: true, restaurant });
    }

    // 7. TOGGLE USER STATUS
    if (action === 'TOGGLE_USER_STATUS') {
      const { userId, isActive } = data;
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
      });
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Superadmin post error:', error);
    return NextResponse.json({ error: 'Failed to process superadmin request' }, { status: 500 });
  }
}
