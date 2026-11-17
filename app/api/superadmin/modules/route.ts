import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access only.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const mod = searchParams.get('module') || 'ALL';
    const restaurantId = searchParams.get('restaurantId') || '';
    const statusFilter = searchParams.get('status') || '';
    const search = (searchParams.get('search') || '').trim();
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const dateWhere: any = {};
    if (dateFrom || dateTo) {
      dateWhere.createdAt = {};
      if (dateFrom) dateWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateWhere.createdAt.lte = end;
      }
    }

    // 1. OUTLETS (Branches)
    if (mod === 'OUTLETS') {
      const outlets = await prisma.branch.findMany({
        where: restaurantId ? { restaurantId } : undefined,
        include: {
          restaurant: { select: { id: true, name: true, qsrNumber: true, city: true } },
          _count: { select: { tables: true, users: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, outlets });
    }

    // 2. POS TERMINALS
    if (mod === 'TERMINALS') {
      let terminals: any[] = [];
      try {
        terminals = await (prisma as any).posTerminal.findMany({
          where: restaurantId ? { restaurantId } : undefined,
          orderBy: { updatedAt: 'desc' },
        });
      } catch {
        terminals = [];
      }
      return NextResponse.json({ success: true, terminals });
    }

    // 3. ORDERS & BILLING (Read-only Platform Monitoring)
    if (mod === 'ORDERS') {
      const orders = await prisma.order.findMany({
        where: {
          ...(restaurantId ? { restaurantId } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(search ? { humanOrderId: { contains: search } } : {}),
          ...dateWhere,
        },
        include: {
          restaurant: { select: { id: true, name: true, qsrNumber: true } },
          branch: { select: { id: true, name: true } },
          invoices: { select: { id: true, humanInvoiceNumber: true, grandTotal: true, cgstAmount: true, sgstAmount: true, paymentStatus: true, paymentMethod: true } },
          items: { select: { id: true, productName: true, quantity: true, unitPrice: true, totalPrice: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return NextResponse.json({ success: true, orders });
    }

    // 4. MENU INSPECTOR (Read-only across tenants)
    if (mod === 'MENU') {
      const targetRestId = restaurantId || 'rest_aapno_khano';
      const categories = await prisma.category.findMany({
        where: { restaurantId: targetRestId, isArchived: false },
        include: {
          products: {
            where: { isArchived: false },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { displayOrder: 'asc' },
      });
      return NextResponse.json({ success: true, categories });
    }

    // 5. INVENTORY VISIBILITY (Read-only across tenants)
    if (mod === 'INVENTORY') {
      const targetRestId = restaurantId || undefined;
      const [ingredients, suppliers, purchaseOrders, stockTransactions] = await Promise.all([
        prisma.ingredient.findMany({
          where: targetRestId ? { restaurantId: targetRestId } : undefined,
          include: { restaurant: { select: { id: true, name: true, qsrNumber: true } } },
          orderBy: { currentStock: 'asc' },
          take: 100,
        }),
        prisma.supplier.findMany({
          where: targetRestId ? { restaurantId: targetRestId } : undefined,
          include: { restaurant: { select: { id: true, name: true, qsrNumber: true } } },
          take: 50,
        }),
        prisma.purchaseOrder.findMany({
          where: targetRestId ? { restaurantId: targetRestId } : undefined,
          include: {
            restaurant: { select: { id: true, name: true, qsrNumber: true } },
            supplier: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.stockTransaction.findMany({
          where: targetRestId ? { restaurantId: targetRestId } : undefined,
          include: {
            restaurant: { select: { id: true, name: true, qsrNumber: true } },
            ingredient: { select: { name: true, unit: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      ]);
      return NextResponse.json({ success: true, ingredients, suppliers, purchaseOrders, stockTransactions });
    }

    // 6. PAYMENTS
    if (mod === 'PAYMENTS') {
      const payments = await prisma.payment.findMany({
        where: {
          ...(restaurantId ? { restaurantId } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...dateWhere,
        },
        include: {
          restaurant: { select: { id: true, name: true, qsrNumber: true } },
          order: { select: { humanOrderId: true, customerName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return NextResponse.json({ success: true, payments });
    }

    // 7. SUPPORT TICKETS
    if (mod === 'TICKETS') {
      let tickets: any[] = [];
      try {
        tickets = await (prisma as any).supportTicket.findMany({
          where: {
            ...(restaurantId ? { restaurantId } : {}),
            ...(statusFilter ? { status: statusFilter } : {}),
          },
          include: { replies: { orderBy: { createdAt: 'asc' } } },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
      } catch {
        tickets = [];
      }
      return NextResponse.json({ success: true, tickets });
    }

    // 8. HELP & TRAINING
    if (mod === 'HELP') {
      let articles: any[] = [];
      try {
        articles = await (prisma as any).helpArticle.findMany({
          orderBy: { displayOrder: 'asc' },
        });
      } catch {
        articles = [];
      }
      return NextResponse.json({ success: true, articles });
    }

    // 9. ANNOUNCEMENTS & NOTIFICATIONS
    if (mod === 'ANNOUNCEMENTS') {
      let announcements: any[] = [];
      try {
        announcements = await (prisma as any).announcement.findMany({
          include: { _count: { select: { logs: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
      } catch {
        announcements = [];
      }
      return NextResponse.json({ success: true, announcements });
    }

    // 10. SYSTEM MONITORING & PLATFORM SETTINGS
    if (mod === 'MONITORING') {
      const start = Date.now();
      let dbStatus = 'HEALTHY';
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch {
        dbStatus = 'ERROR';
      }
      const dbLatencyMs = Date.now() - start;

      const [failedLogins24h, totalLogs, activeSessions] = await Promise.all([
        prisma.auditLog.count({
          where: {
            action: 'FAILED_LOGIN_ATTEMPT',
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }).catch(() => 0),
        prisma.auditLog.count().catch(() => 0),
        prisma.session.count({ where: { isRevoked: false, expiresAt: { gt: new Date() } } }).catch(() => 0),
      ]);

      let platformSettings: any = null;
      try {
        platformSettings = await (prisma as any).platformSettings.findUnique({
          where: { id: 'PLATFORM_DEFAULT' },
        });
      } catch {
        platformSettings = null;
      }

      return NextResponse.json({
        success: true,
        monitoring: {
          apiStatus: 'OPERATIONAL',
          dbStatus,
          dbLatencyMs,
          uptimeSeconds: Math.round(process.uptime()),
          memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
          failedLogins24h,
          totalAuditLogs: totalLogs,
          activeSessions,
          lastCheckedAt: new Date().toISOString(),
        },
        platformSettings: platformSettings || {
          platformName: 'Aapno Khano POS',
          logoUrl: '/images/aapno-khano-login-logo.png',
          supportEmail: 'support@aapnokhano.com',
          supportPhone: '+91 70820 40809',
          defaultTaxRate: 5.0,
          defaultTrialDays: 14,
          maintenanceMode: false,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid module' }, { status: 400 });
  } catch (error) {
    console.error('Superadmin modules GET error:', error);
    return NextResponse.json({ error: 'Failed to load module data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access only.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // OUTLET CREATE / TOGGLE
    if (action === 'CREATE_OUTLET') {
      const { restaurantId, name, address, phone, email } = body;
      const slug = `${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now().toString(36)}`;
      const outlet = await prisma.branch.create({
        data: { restaurantId, name, slug, address, phone, email: email || null, isMain: false, isActive: true },
      });
      await prisma.auditLog.create({
        data: { restaurantId, userId: session.userId, userName: session.name, action: 'OUTLET_CREATED', entity: 'Branch', entityId: outlet.id, notes: `Created outlet ${name}` },
      }).catch(() => {});
      return NextResponse.json({ success: true, outlet });
    }

    if (action === 'TOGGLE_OUTLET') {
      const { outletId, isActive } = body;
      const outlet = await prisma.branch.update({ where: { id: outletId }, data: { isActive } });
      return NextResponse.json({ success: true, outlet });
    }

    // POS TERMINAL REGISTER / TOGGLE
    if (action === 'CREATE_TERMINAL') {
      const { restaurantId, branchId, deviceName, deviceType, ipAddress } = body;
      const terminalCode = `TERM-${Date.now().toString(36).toUpperCase()}`;
      const terminal = await (prisma as any).posTerminal.create({
        data: { restaurantId, branchId: branchId || null, terminalCode, deviceName, deviceType: deviceType || 'POS_TERMINAL', ipAddress: ipAddress || null, status: 'OFFLINE', isActive: true },
      });
      return NextResponse.json({ success: true, terminal });
    }

    if (action === 'TOGGLE_TERMINAL') {
      const { terminalId, isActive } = body;
      const terminal = await (prisma as any).posTerminal.update({
        where: { id: terminalId },
        data: { isActive, status: isActive ? 'OFFLINE' : 'INACTIVE' },
      });
      return NextResponse.json({ success: true, terminal });
    }

    // SUPPORT TICKET ACTIONS
    if (action === 'CREATE_TICKET') {
      const { restaurantId, category, priority, subject, description } = body;
      const count = await (prisma as any).supportTicket.count().catch(() => 0);
      const ticketNumber = `AKT-${4588 + count}`;
      const ticket = await (prisma as any).supportTicket.create({
        data: { ticketNumber, restaurantId, userId: session.userId, category: category || 'TECHNICAL', priority: priority || 'MEDIUM', status: 'NEW', subject, description },
      });
      return NextResponse.json({ success: true, ticket });
    }

    if (action === 'REPLY_TICKET') {
      const { ticketId, message, isInternal = false, newStatus } = body;
      const reply = await (prisma as any).supportTicketReply.create({
        data: { ticketId, senderId: session.userId, senderName: session.name, senderRole: session.role, message, isInternal },
      });
      if (newStatus) {
        await (prisma as any).supportTicket.update({
          where: { id: ticketId },
          data: { status: newStatus, ...(newStatus === 'RESOLVED' ? { resolvedAt: new Date() } : {}) },
        });
      }
      return NextResponse.json({ success: true, reply });
    }

    if (action === 'UPDATE_TICKET_STATUS') {
      const { ticketId, status, assignedToName, resolutionNotes } = body;
      const ticket = await (prisma as any).supportTicket.update({
        where: { id: ticketId },
        data: {
          status,
          ...(assignedToName !== undefined ? { assignedToName } : {}),
          ...(resolutionNotes !== undefined ? { resolutionNotes } : {}),
          ...(status === 'RESOLVED' ? { resolvedAt: new Date() } : {}),
        },
      });
      return NextResponse.json({ success: true, ticket });
    }

    // HELP & TRAINING ARTICLES
    if (action === 'SAVE_HELP_ARTICLE') {
      const { id, title, category, content, videoUrl, isPublished = true } = body;
      const article = id
        ? await (prisma as any).helpArticle.update({ where: { id }, data: { title, category, content, videoUrl: videoUrl || null, isPublished } })
        : await (prisma as any).helpArticle.create({ data: { title, category, content, videoUrl: videoUrl || null, isPublished } });
      return NextResponse.json({ success: true, article });
    }

    if (action === 'DELETE_HELP_ARTICLE') {
      await (prisma as any).helpArticle.delete({ where: { id: body.id } });
      return NextResponse.json({ success: true });
    }

    // ANNOUNCEMENTS & NOTIFICATIONS
    if (action === 'PUBLISH_ANNOUNCEMENT') {
      const { title, message, type, targetType, targetIds, channels } = body;
      const ann = await (prisma as any).announcement.create({
        data: {
          title,
          message,
          type: type || 'UPDATE',
          targetType: targetType || 'ALL',
          targetIdsJson: targetIds ? JSON.stringify(targetIds) : null,
          channelsJson: JSON.stringify(channels || ['IN_APP']),
          publishedBy: session.name,
        },
      });

      const targetRestaurants = targetType === 'SELECTED_RESTAURANTS' && Array.isArray(targetIds)
        ? targetIds
        : (await prisma.restaurant.findMany({ select: { id: true } })).map((r) => r.id);

      for (const restId of targetRestaurants) {
        await (prisma as any).notificationLog.create({
          data: { announcementId: ann.id, restaurantId: restId, channel: 'IN_APP', status: 'DELIVERED' },
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, announcement: ann });
    }

    // PLATFORM SETTINGS
    if (action === 'SAVE_PLATFORM_SETTINGS') {
      const { platformName, supportEmail, supportPhone, defaultTaxRate, defaultTrialDays, maintenanceMode } = body;
      const settings = await (prisma as any).platformSettings.upsert({
        where: { id: 'PLATFORM_DEFAULT' },
        update: { platformName, supportEmail, supportPhone, defaultTaxRate: parseFloat(defaultTaxRate), defaultTrialDays: parseInt(defaultTrialDays), maintenanceMode: Boolean(maintenanceMode) },
        create: { id: 'PLATFORM_DEFAULT', platformName, supportEmail, supportPhone, defaultTaxRate: parseFloat(defaultTaxRate), defaultTrialDays: parseInt(defaultTrialDays), maintenanceMode: Boolean(maintenanceMode) },
      });
      await prisma.auditLog.create({
        data: { userId: session.userId, userName: session.name, action: 'PLATFORM_SETTINGS_UPDATED', entity: 'PlatformSettings', entityId: 'PLATFORM_DEFAULT', notes: 'Updated SaaS platform settings' },
      }).catch(() => {});
      return NextResponse.json({ success: true, platformSettings: settings });
    }

    // SUBSCRIPTION PLAN CREATE / ASSIGN
    if (action === 'CREATE_PLAN') {
      const { name, monthlyPrice, yearlyPrice, maxBranches, maxTables, maxOrdersPerMonth, maxStaffUsers } = body;
      const slug = `${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now().toString(36)}`;
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name,
          slug,
          monthlyPrice: parseFloat(monthlyPrice),
          yearlyPrice: parseFloat(yearlyPrice || monthlyPrice * 10),
          maxBranches: parseInt(maxBranches || '1'),
          maxTables: parseInt(maxTables || '15'),
          maxOrdersPerMonth: parseInt(maxOrdersPerMonth || '2000'),
          maxStaffUsers: parseInt(maxStaffUsers || '10'),
        },
      });
      return NextResponse.json({ success: true, plan });
    }

    if (action === 'ASSIGN_SUBSCRIPTION') {
      const { restaurantId, planId, status = 'ACTIVE', days = 30 } = body;
      const sub = await prisma.restaurantSubscription.create({
        data: {
          restaurantId,
          planId,
          status,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000),
        },
      });
      await prisma.auditLog.create({
        data: { restaurantId, userId: session.userId, userName: session.name, action: 'SUBSCRIPTION_ASSIGNED', entity: 'RestaurantSubscription', entityId: sub.id, notes: `Assigned plan ${planId} (${status})` },
      }).catch(() => {});
      return NextResponse.json({ success: true, subscription: sub });
    }

    // RESET USER PASSWORD BY SUPER ADMIN
    if (action === 'RESET_USER_PASSWORD') {
      const { userId, newPassword } = body;
      const { hashPassword } = await import('@/lib/auth');
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashPassword(newPassword || 'Reset@123'), forcePasswordChange: true },
      });
      await prisma.session.updateMany({ where: { userId }, data: { isRevoked: true } }).catch(() => {});
      await prisma.auditLog.create({
        data: { userId: session.userId, userName: session.name, action: 'ADMIN_PASSWORD_RESET', entity: 'User', entityId: userId, notes: 'Password reset by Super Admin' },
      }).catch(() => {});
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Superadmin modules POST error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}
