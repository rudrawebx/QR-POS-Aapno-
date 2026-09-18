import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from './prisma';
import { UserRole } from './types';

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

// In-memory rate limiter for login attempts (15 minute lockout after 5 failed attempts)
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

  // If lockout expired, reset
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

  // Lock out for 15 minutes after 5 failed attempts
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

    const parsed = JSON.parse(sessionCookie) as AuthSession;
    if (!parsed || !parsed.userId) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function hasPermission(role: UserRole, resource: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes('*') || permissions.includes(resource);
}

