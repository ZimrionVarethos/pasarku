import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizedUserFromRequest } from '@/lib/server/user-session';
import { findUserById, toPublicUserProfile, upsertUserAccount } from '@/lib/server/user-db';

export async function GET(req: NextRequest) {
  const auth = getAuthorizedUserFromRequest(req);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Belum masuk akun.' },
      { status: 401 }
    );
  }

  let user = await findUserById(auth.userId);
  if (!user) {
    user = await upsertUserAccount({
      id: auth.userId,
      name: auth.email.split('@')[0],
      email: auth.email,
      authProvider: 'EMAIL',
      emailVerified: true,
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Sesi pengguna aktif.',
    data: {
      user: toPublicUserProfile(user),
      expiresAt: auth.exp,
    },
  });
}
