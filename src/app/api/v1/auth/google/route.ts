import { NextRequest, NextResponse } from 'next/server';
import { toPublicUserProfile, upsertUserAccount } from '@/lib/server/user-db';
import { attachUserSessionCookie, createSignedUserToken } from '@/lib/server/user-session';
import { resolveRequestOrigin } from '@/lib/server/request-origin';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeNextPath(nextPath: string | null | undefined): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) return '/akun';
  return nextPath;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const nextPath = sanitizeNextPath(req.nextUrl.searchParams.get('next'));
  const mode = req.nextUrl.searchParams.get('mode');

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      success: true,
      message: 'Google OAuth belum dikonfigurasi di server; mode pemilih akun demo aktif.',
      data: {
        configured: false,
        next: nextPath,
      },
    });
  }

  const origin = resolveRequestOrigin(req);
  const redirectUri = `${origin}/api/v1/auth/google/callback`;
  const state = Buffer.from(JSON.stringify({ next: nextPath })).toString('base64url');
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('state', state);

  if (mode === 'json') {
    return NextResponse.json({
      success: true,
      message: 'URL autentikasi Google OAuth siap.',
      data: {
        configured: true,
        authUrl: authUrl.toString(),
      },
    });
  }

  return NextResponse.redirect(authUrl.toString());
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      name?: string;
      preferredRegionId?: string;
    };

    const email = (body.email || '').trim().toLowerCase();
    const name = (body.name || '').trim() || email.split('@')[0];

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Masukkan alamat akun Google yang valid.' },
        { status: 400 }
      );
    }

    const account = await upsertUserAccount({
      name,
      email,
      authProvider: 'GOOGLE',
      emailVerified: true,
      preferredRegionId: body.preferredRegionId || 'reg_bogor',
    });

    const token = createSignedUserToken(account.id, account.email);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const res = NextResponse.json({
      success: true,
      message: 'Berhasil masuk menggunakan akun Google.',
      data: {
        token,
        expiresAt,
        user: toPublicUserProfile(account),
      },
    });
    attachUserSessionCookie(res, token);
    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses login Google.' },
      { status: 400 }
    );
  }
}
