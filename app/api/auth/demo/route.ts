import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const FALLBACK_ROLES: Record<string, any> = {
  SUPER_ADMIN: {
    userId: 'usr_super_admin',
    email: 'vinod@aapnokhano.com',
    name: 'Vinod (SaaS Super Admin)',
    role: 'SUPER_ADMIN',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  OWNER: {
    userId: 'usr_owner_fatehabad',
    email: 'fatehabad@aapnokhano.com',
    name: 'Fatehabad Store Owner',
    role: 'OWNER',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  MANAGER: {
    userId: 'usr_manager_ftd',
    email: 'ftd.mngr@aapnokhano.com',
    name: 'Fatehabad Store Manager',
    role: 'MANAGER',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  CASHIER: {
    userId: 'usr_cashier_ftd',
    email: 'ftd.cashier@aapnokhano.com',
    name: 'Fatehabad Billing Cashier',
    role: 'CASHIER',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  KITCHEN: {
    userId: 'usr_kitchen_ftd',
    email: 'ftd.kitchen@aapnokhano.com',
    name: 'Fatehabad Head Chef',
    role: 'KITCHEN',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  WAITER: {
    userId: 'usr_waiter_ftd',
    email: 'ftd.waiter@aapnokhano.com',
    name: 'Fatehabad Waiter & Captain',
    role: 'WAITER',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
};

export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    const targetRole = role || 'OWNER';

    let sessionData = null;

    try {
      if (prisma) {
        let user = null;
        if (targetRole === 'SUPER_ADMIN') {
          user = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' },
            include: { restaurant: true },
          });
        } else {
          user = await prisma.user.findFirst({
            where: { role: targetRole },
            include: { restaurant: true },
          });
        }

        if (user) {
          sessionData = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            restaurantId: user.restaurantId || 'rest_aapno_khano',
            branchId: user.branchId || 'branch-aapno-fatehabad',
            restaurantSlug: user.restaurant?.slug || 'aapno-khano',
            restaurantName: user.restaurant?.name || 'आपणो खाणो (Aapno Khaano)',
          };
        }
      }
    } catch (dbErr) {
      console.warn('Database query failed in demo auth, using fallback role session:', dbErr);
    }

    if (!sessionData) {
      sessionData = FALLBACK_ROLES[targetRole] || FALLBACK_ROLES['OWNER'];
    }

    const response = NextResponse.json({ success: true, user: sessionData });

    response.cookies.set({
      name: 'auth_session',
      value: JSON.stringify(sessionData),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Demo auth error:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
