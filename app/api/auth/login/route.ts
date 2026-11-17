import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import {
  verifyPassword,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
  signSessionToken,
  hashToken,
  normalizeEmail,
  normalizeMobile,
  AuthSession,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, identifier, password, pinCode, rememberMe = true } = body;
    const rawLogin = (identifier || email || '').trim();

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';
    const userAgent = request.headers.get('user-agent') || 'Unknown Device';
    const rateLimitKey = `${clientIp}_${rawLogin ? rawLogin.toLowerCase() : `pin_${pinCode}`}`;

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

    // 2. Fetch User from Database (supports Email, Mobile, or PIN)
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
            },
            include: { restaurant: true },
          });
        } else if (rawLogin) {
          const normEmail = normalizeEmail(rawLogin);
          const normMobile = normalizeMobile(rawLogin);
          const orConditions: any[] = [{ email: normEmail }];
          if (normMobile.length >= 10) {
            orConditions.push({ phone: normMobile });
            orConditions.push({ phone: `+91${normMobile}` });
            orConditions.push({ phone: `+91 ${normMobile}` });
          }

          user = await prisma.user.findFirst({
            where: { OR: orConditions },
            include: { restaurant: true },
          });
        }
      }
    } catch (dbErr) {
      console.warn('[Auth Security] Database query warning during login:', dbErr);
      return NextResponse.json(
        { error: 'Database connection unreachable. Please check internet/MySQL connectivity and try again.' },
        { status: 503 }
      );
    }

    // 3. Credential Verification
    let isAuthenticated = false;

    if (user) {
      if (pinCode) {
        const cleanPin = String(pinCode).trim();
        if (
          (user.pinCode && verifyPassword(cleanPin, user.pinCode)) ||
          user.pinCode === cleanPin ||
          user.pinCode === `scrypt$${cleanPin}`
        ) {
          isAuthenticated = true;
        }
      } else if (rawLogin && password) {
        if (user.passwordHash) {
          const rawPass = String(password);
          const cleanPass = rawPass.trim();
          const capPass = cleanPass.length > 0 ? cleanPass.charAt(0).toUpperCase() + cleanPass.slice(1) : cleanPass;
          const lowerPass = cleanPass.toLowerCase();

          if (
            verifyPassword(rawPass, user.passwordHash) ||
            verifyPassword(cleanPass, user.passwordHash) ||
            verifyPassword(capPass, user.passwordHash) ||
            verifyPassword(lowerPass, user.passwordHash)
          ) {
            isAuthenticated = true;
          }
        }
      }
    }

    // Check if user is a pending/rejected applicant in RestaurantApplication (if no active User found)
    if (!user && rawLogin && password && prisma) {
      const normEmail = normalizeEmail(rawLogin);
      const normMobile = normalizeMobile(rawLogin);
      const app = await prisma.restaurantApplication.findFirst({
        where: {
          OR: [
            { email: normEmail },
            ...(normMobile.length >= 10 ? [{ mobile: normMobile }] : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => null);

      if (app && verifyPassword(String(password).trim(), app.passwordHash)) {
        if (app.status === 'PENDING_APPROVAL' || app.status === 'UNDER_REVIEW') {
          return NextResponse.json(
            {
              error: `Your restaurant application (${app.applicationRef}) is currently ${app.status.replace('_', ' ')}. Please wait for Super Admin approval.`,
              applicationStatus: app.status,
              applicationRef: app.applicationRef,
            },
            { status: 403 }
          );
        }
        if (app.status === 'REJECTED') {
          return NextResponse.json(
            {
              error: `Your restaurant application (${app.applicationRef}) was rejected. Reason: ${app.rejectionReason || 'Details require correction.'}`,
              applicationStatus: 'REJECTED',
              applicationRef: app.applicationRef,
            },
            { status: 403 }
          );
        }
      }
    }

    // 4. Handle Authentication Failure
    if (!isAuthenticated || !user) {
      recordFailedLogin(rateLimitKey);

      try {
        if (prisma) {
          await prisma.auditLog.create({
            data: {
              action: 'FAILED_LOGIN_ATTEMPT',
              entity: 'User',
              entityId: rawLogin || (pinCode ? 'PIN_LOGIN' : null),
              notes: `Failed login attempt from IP ${clientIp}`,
              ipAddress: clientIp,
            },
          });
        }
      } catch {
        // Ignore background logging errors
      }

      return NextResponse.json(
        { error: 'Invalid credentials. Please verify your email/mobile or PIN and try again.' },
        { status: 401 }
      );
    }

    // 5. Account & Restaurant Status Checks
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your user account has been deactivated. Please contact your Restaurant Owner or Support.' },
        { status: 403 }
      );
    }

    if (user.role !== 'SUPER_ADMIN' && user.restaurant) {
      const restStatus = user.restaurant.status || (user.restaurant.isActive ? 'ACTIVE' : 'SUSPENDED');
      if (!user.restaurant.isActive || restStatus === 'SUSPENDED' || restStatus === 'INACTIVE') {
        return NextResponse.json(
          { error: `Restaurant account (${user.restaurant.qsrNumber || user.restaurant.name}) is currently ${restStatus}. Operational POS access is blocked. Please contact Super Admin.` },
          { status: 403 }
        );
      }
      if (restStatus === 'PENDING_APPROVAL' || restStatus === 'UNDER_REVIEW') {
        return NextResponse.json(
          { error: 'Your restaurant account is pending Super Admin approval.' },
          { status: 403 }
        );
      }
    }

    // 6. Successful Login - Reset Rate Limit & Create Server-Side Session
    resetLoginRateLimit(rateLimitKey);

    const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
    const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
    const rawSessionToken = crypto.randomBytes(32).toString('hex');
    let createdSessionId: string | undefined;

    try {
      if (prisma) {
        const dbSession = await prisma.session.create({
          data: {
            tokenHash: hashToken(rawSessionToken),
            userId: user.id,
            restaurantId: user.restaurantId,
            deviceInfo: userAgent.slice(0, 190),
            ipAddress: clientIp,
            expiresAt,
          },
        });
        createdSessionId = dbSession.id;

        // Update lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        if (user.restaurantId) {
          await prisma.restaurant.update({
            where: { id: user.restaurantId },
            data: { lastLoginAt: new Date() },
          });
        }
      }
    } catch (sessErr) {
      console.warn('[Auth] Session DB creation warning:', sessErr);
    }

    const sessionData: AuthSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId || 'rest_aapno_khano',
      branchId: user.branchId || 'branch-aapno-fatehabad',
      restaurantSlug: user.restaurant?.slug || 'aapno-khano',
      restaurantName: user.restaurant?.name || 'आपणो खाणो (Aapno Khaano)',
      qsrNumber: user.restaurant?.qsrNumber || null,
      logoUrl:
        user.restaurant?.logoUrl ||
        (user.restaurant?.slug === 'mr-bagri' ? '/images/mr-bagri-logo.jpg' : '/images/aapno-khano-logo.png'),
      sessionId: createdSessionId,
    };

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
            notes: `Successful login as ${user.role} (${user.restaurant?.qsrNumber || 'Platform'}) from IP ${clientIp}`,
            ipAddress: clientIp,
          },
        });
      }
    } catch {
      // Ignore background log error
    }

    const response = NextResponse.json({ success: true, user: sessionData });
    const signedCookieValue = signSessionToken(sessionData);

    // Issue Signed Secure Persistent Session Cookie
    response.cookies.set({
      name: 'auth_session',
      value: signedCookieValue,
      httpOnly: true,
      path: '/',
      maxAge: maxAgeSeconds,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 500 });
  }
}
