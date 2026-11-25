import { NextResponse } from 'next/server';
import { clearUserSessionCookie } from '@/lib/server/user-session';

function buildLogoutResponse() {
  const res = NextResponse.json({
    success: true,
    message: 'Sesi pengguna telah diakhiri.',
  });
  clearUserSessionCookie(res);
  return res;
}

export async function POST() {
  return buildLogoutResponse();
}

export async function DELETE() {
  return buildLogoutResponse();
}
