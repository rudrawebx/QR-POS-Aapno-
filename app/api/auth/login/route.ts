import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, pinCode } = await request.json();

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';
    const rateLimitKey = `${clientIp}_${email ? email.toLowerCase().trim() : `pin_${pinCode}`}`;

    // 1. Rate Limiting & Temporary Lockout Check
    const rateCheck = checkLoginRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${rateCheck.remainingMinutes || 15} minutes.`,
        },
        { status: 429 }
      );
    }

    let user: any = null;

    // 2. Fetch User from Database strictly
    try {
      if (prisma) {
        if (pinCode) {
          const cleanPin = String(pinCode).trim();
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { pinCode: cleanPin },
                { pinCode: `scrypt$${cleanPin}` },
              ],
              isActive: true,
            },
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
      console.warn('[Auth Security] Database query warning during login:', dbErr);
      user = null;
    }

    // 3. Credential Verification
    let isAuthenticated = false;

    if (user) {
      if (pinCode) {
        // Direct or hashed PIN verification
        if (user.pinCode && verifyPassword(String(pinCode).trim(), user.pinCode)) {
          isAuthenticated = true;
        }
      } else if (email && password) {
        if (user.passwordHash && verifyPassword(password, user.passwordHash)) {
          isAuthenticated = true;
        }
      }
    }

    // 4. Handle Authentication Failure (Uniform generic error response)
    if (!isAuthenticated || !user) {
      recordFailedLogin(rateLimitKey);

      // Async audit log for failed attempt
      try {
        if (prisma) {
          await prisma.auditLog.create({
            data: {
              action: 'FAILED_LOGIN_ATTEMPT',
              entity: 'User',
              entityId: email || (pinCode ? 'PIN_LOGIN' : null),
              notes: `Failed login attempt from IP ${clientIp}`,
              ipAddress: clientIp,
            },
          });
        }
      } catch (logErr) {
        // Ignore background logging errors
      }

      return NextResponse.json(
        { error: 'Invalid credentials. Please verify your email or PIN and try again.' },
        { status: 401 }
      );
    }

    // 5. Successful Login - Reset Rate Limit
    resetLoginRateLimit(rateLimitKey);

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

    // Log successful login audit
    try {
      if (prisma) {
        await prisma.auditLog.create({
          data: {
            restaurantId: user.restaurantId || 'rest_aapno_khano',
            userId: user.id,
            userName: user.name,
            action: 'USER_LOGIN_SUCCESS',
            entity: 'User',
            entityId: user.id,
            notes: `Successful login as ${user.role} from IP ${clientIp}`,
            ipAddress: clientIp,
          },
        });
      }
    } catch {
      // Ignore background log error
    }

    const response = NextResponse.json({ success: true, user: sessionData });

    // 6. Issue Secure Persistent Session Cookie
    response.cookies.set({
      name: 'auth_session',
      value: JSON.stringify(sessionData),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    console.error('[Auth Security] Login handler error:', error);
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable. Please retry.' },
      { status: 500 }
    );
  }
}

