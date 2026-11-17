import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from './prisma';
import { UserRole } from './types';

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'aapno-khano-qsr-saas-hmac-secret-2026';

// Normalize email & mobile for consistent duplicate prevention
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function normalizeMobile(mobile: string): string {
  const digits = (mobile || '').replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(-10);
  }
  return digits;
}

// Cryptographically secure password/PIN hashing using scrypt with random salt
export function hashPassword(password: string): string {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

// Secure hash verification supporting current scrypt hashes and legacy migration hashes
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  // Modern scrypt format: scrypt$salt$hash
  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const key = parts[2];
    try {
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
    } catch {
      return false;
    }
  }

  // Legacy deterministic hash format: hash_<num>_<prefix>
  if (storedHash.startsWith('hash_')) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const calculatedLegacy = `hash_${Math.abs(hash)}_${password.slice(0, 3)}`;
    return calculatedLegacy === storedHash;
  }

  // Direct comparison (legacy or seed during dev transition)
  try {
    const bufA = Buffer.from(password);
    const bufB = Buffer.from(storedHash);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include letters.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least one number.' };
  }
  return { valid: true };
}

// OTP Generation & Verification
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashToken(token: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(token).digest('hex');
}

// Sign & Verify Session Cookie Payload
export function signSessionToken(payload: AuthSession): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySignedSessionToken(token: string): AuthSession | null {
  try {
    // Support signed format: base64url.sig
    if (token.includes('.') && !token.trim().startsWith('{')) {
      const [data, sig] = token.split('.');
      if (!data || !sig) return null;
      const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        return null;
      }
      const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8')) as AuthSession;
      if (!parsed || !parsed.userId) return null;
      return parsed;
    }

    // Legacy JSON cookie fallback for seamless non-breaking transition
    const parsed = JSON.parse(token) as AuthSession;
    if (!parsed || !parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

// In-memory rate limiter for login & OTP attempts
interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number | null;
  lastAttempt: number;
}

const loginRateLimits = new Map<string, RateLimitRecord>();

export function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = loginRateLimits.get(identifier);

  if (!record) {
    return { allowed: true };
  }

  if (record.lockoutUntil && record.lockoutUntil > now) {
    const remainingMinutes = Math.ceil((record.lockoutUntil - now) / 60000);
    return { allowed: false, remainingMinutes };
  }

  if (record.lockoutUntil && record.lockoutUntil <= now) {
    loginRateLimits.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string) {
  const now = Date.now();
  const record = loginRateLimits.get(identifier) || { attempts: 0, lockoutUntil: null, lastAttempt: now };
  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= 5) {
    record.lockoutUntil = now + 15 * 60 * 1000;
  }

  loginRateLimits.set(identifier, record);
}

export function resetLoginRateLimit(identifier: string) {
  loginRateLimits.delete(identifier);
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId: string | null;
  branchId: string | null;
  restaurantSlug?: string;
  restaurantName?: string;
  qsrNumber?: string | null;
  logoUrl?: string;
  sessionId?: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*'],
  OWNER: [
    'pos',
    'orders',
    'tables',
    'menu',
    'kitchen',
    'invoices',
    'payments',
    'reports',
    'staff',
    'inventory',
    'expenses',
    'reservations',
    'customers',
    'settings',
    'qr-codes',
    'feedback',
  ],
  MANAGER: [
    'pos',
    'orders',
    'tables',
    'menu',
    'kitchen',
    'invoices',
    'payments',
    'reports',
    'staff',
    'inventory',
    'expenses',
    'reservations',
    'customers',
    'qr-codes',
    'feedback',
  ],
  CASHIER: [
    'pos',
    'orders',
    'tables',
    'invoices',
    'payments',
    'customers',
  ],
  KITCHEN: ['kitchen'],
  WAITER: ['pos', 'orders', 'tables'],
  ACCOUNTANT: ['invoices', 'payments', 'reports', 'expenses'],
};

export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session')?.value;

    if (!sessionCookie) return null;

    const parsed = verifySignedSessionToken(sessionCookie);
    if (!parsed || !parsed.userId) return null;

    // If a server-side sessionId is present, verify it is not revoked or expired
    if (parsed.sessionId && prisma) {
      const dbSession = await prisma.session.findUnique({
        where: { id: parsed.sessionId },
        select: { isRevoked: true, expiresAt: true },
      }).catch(() => null);

      if (dbSession && (dbSession.isRevoked || dbSession.expiresAt < new Date())) {
        return null;
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

export function hasPermission(role: UserRole, resource: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes('*') || permissions.includes(resource);
}

// Atomic QSR Number Generator (must be called inside a Prisma transaction)
export async function allocateNextQsrNumber(tx: any): Promise<string> {
  // Ensure sequence row exists
  const existingSeq = await tx.restaurantSequence.findUnique({
    where: { id: 'QSR_SEQ' },
  });

  if (!existingSeq) {
    // Count existing QSR restaurants to initialize safely
    const count = await tx.restaurant.count({
      where: { qsrNumber: { not: null } },
    });
    const nextNum = Math.max(count, 2) + 1;
    await tx.restaurantSequence.create({
      data: { id: 'QSR_SEQ', lastNumber: nextNum },
    });
    return `QSR${String(nextNum).padStart(2, '0')}`;
  }

  const updated = await tx.restaurantSequence.update({
    where: { id: 'QSR_SEQ' },
    data: { lastNumber: { increment: 1 } },
  });

  return `QSR${String(updated.lastNumber).padStart(2, '0')}`;
}
