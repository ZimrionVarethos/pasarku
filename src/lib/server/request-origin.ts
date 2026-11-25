import type { NextRequest } from 'next/server';

export function resolveRequestOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (forwardedHost) {
    const isLocal =
      forwardedHost.startsWith('localhost') || forwardedHost.startsWith('127.0.0.1');
    const proto = forwardedProto || (isLocal ? 'http' : 'https');
    return `${proto}://${forwardedHost}`;
  }

  const host = req.headers.get('host')?.trim();
  if (host) {
    const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
    const proto = isLocal ? 'http' : 'https';
    return `${proto}://${host}`;
  }

  const fallback = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return fallback.replace(/\/$/, '');
}
