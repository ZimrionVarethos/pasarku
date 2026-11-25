import crypto from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';

export const USER_COOKIE_NAME = 'pasarku_user_cookie';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getUserSecret(): string {
  return (
    process.env.USER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    'pasarku_user_dev_fallback_secret_change_in_prod'
  );
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, expectedHex] = storedHash.split(':');
  if (!salt || !expectedHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function hashOtpCode(email: string, code: string): string {
  const normalized = `${email.trim().toLowerCase()}:${code.trim()}`;
  return crypto.createHmac('sha256', getUserSecret()).update(normalized).digest('hex');
}

export function createSignedUserToken(userId: string, email: string): string {
  const exp = Date.now() + SESSION_DURATION_MS;
  const payload = Buffer.from(JSON.stringify({ userId, email, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', getUserSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySignedUserToken(
  token: string | undefined | null
): { userId: string; email: string; exp: number } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', getUserSecret()).update(payload).digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      userId?: string;
      email?: string;
      exp?: number;
    };
    if (
      typeof parsed.userId !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.exp !== 'number' ||
      parsed.exp <= Date.now()
    ) {
      return null;
    }
    return { userId: parsed.userId, email: parsed.email, exp: parsed.exp };
  } catch {
    return null;
  }
}

export function getAuthorizedUserFromRequest(
  req: NextRequest
): { userId: string; email: string; exp: number } | null {
  const cookieToken = req.cookies.get(USER_COOKIE_NAME)?.value;
  const fromCookie = verifySignedUserToken(cookieToken);
  if (fromCookie) return fromCookie;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    return verifySignedUserToken(bearer);
  }
  return null;
}

export function attachUserSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(USER_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearUserSessionCookie(res: NextResponse): void {
  res.cookies.set(USER_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}
