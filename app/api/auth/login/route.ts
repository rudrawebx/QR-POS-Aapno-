import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

export const FALLBACK_USERS = [
  {
    id: 'usr_super_admin',
    email: 'vinod@aapnokhano.com',
    password: 'Khano#Aapno@Sector3',
    name: 'Vinod (SaaS Super Admin)',
    role: 'SUPER_ADMIN',
    pinCode: '0000',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  {
    id: 'usr_owner_fatehabad',
    email: 'fatehabad@aapnokhano.com',
    password: 'Fatehabad#Aapno@Sector3',
    name: 'Fatehabad Store Owner',
    role: 'OWNER',
    pinCode: '1111',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  {
    id: 'usr_manager_ftd',
    email: 'ftd.mngr@aapnokhano.com',
    password: 'FTDmngr#Aapno@Sector3',
    name: 'Fatehabad Store Manager',
    role: 'MANAGER',
    pinCode: '2222',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  {
    id: 'usr_cashier_ftd',
    email: 'ftd.cashier@aapnokhano.com',
    password: 'FTDcashier#Aapno@Sector3',
    name: 'Fatehabad Billing Cashier',
    role: 'CASHIER',
    pinCode: '3333',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  {
    id: 'usr_kitchen_ftd',
    email: 'ftd.kitchen@aapnokhano.com',
    password: 'FTDKitchen#Aapno@Sector3',
    name: 'Fatehabad Head Chef',
    role: 'KITCHEN',
    pinCode: '4444',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
  {
    id: 'usr_waiter_ftd',
    email: 'ftd.waiter@aapnokhano.com',
    password: 'Ftdwaiter#Aapno@Sector3',
    name: 'Fatehabad Waiter & Captain',
    role: 'WAITER',
    pinCode: '5555',
    restaurantId: 'rest_aapno_khano',
    branchId: 'branch-aapno-fatehabad',
    restaurantSlug: 'aapno-khano',
    restaurantName: 'आपणो खाणो (Aapno Khaano)',
  },
];

export async function POST(request: Request) {
  try {
    const { email, password, pinCode } = await request.json();

    let user: any = null;

    // 1. Try fetching user from database
    try {
      if (prisma) {
        if (pinCode) {
          user = await prisma.user.findFirst({
            where: { pinCode: String(pinCode).trim(), isActive: true },
            include: { restaurant: true },
          });
        } else if (email) {
          user = await prisma.user.findFirst({
            where: { email: email.toLowerCase().trim(), isActive: true },
            include: { restaurant: true },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Database query failed during login, using fallback auth:', dbErr);
      user = null;
    }

    // 2. If not found in DB or DB unreachable, check fallback static directory
    if (!user) {
      if (pinCode) {
        const fallback = FALLBACK_USERS.find((u) => u.pinCode === String(pinCode).trim());
        if (fallback) {
          user = {
            id: fallback.id,
            email: fallback.email,
            name: fallback.name,
            role: fallback.role,
            passwordHash: fallback.password,
            restaurantId: fallback.restaurantId,
            branchId: fallback.branchId,
            restaurant: {
              slug: fallback.restaurantSlug,
              name: fallback.restaurantName,
            },
          };
        }
      } else if (email) {
        const fallback = FALLBACK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
        if (fallback) {
          if (password && (password === fallback.password || verifyPassword(password, fallback.password))) {
            user = {
              id: fallback.id,
              email: fallback.email,
              name: fallback.name,
              role: fallback.role,
              passwordHash: fallback.password,
              restaurantId: fallback.restaurantId,
              branchId: fallback.branchId,
              restaurant: {
                slug: fallback.restaurantSlug,
                name: fallback.restaurantName,
              },
            };
          } else {
            return NextResponse.json({ error: 'Invalid password. Please check and try again.' }, { status: 401 });
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    // Verify password if DB user was returned
    if (password && user.passwordHash && !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid password. Please check and try again.' }, { status: 401 });
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId || 'rest_aapno_khano',
      branchId: user.branchId || 'branch-aapno-fatehabad',
      restaurantSlug: user.restaurant?.slug || 'aapno-khano',
      restaurantName: user.restaurant?.name || 'आपणो खाणो (Aapno Khaano)',
    };

    const response = NextResponse.json({ success: true, user: sessionData });

    // Set persistent session cookie
    response.cookies.set({
      name: 'auth_session',
      value: JSON.stringify(sessionData),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error?.message || 'Login failed. Please retry.' }, { status: 500 });
  }
}
