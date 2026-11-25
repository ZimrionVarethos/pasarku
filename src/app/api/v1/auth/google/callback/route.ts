import { NextRequest, NextResponse } from 'next/server';
import { upsertUserAccount } from '@/lib/server/user-db';
import { attachUserSessionCookie, createSignedUserToken } from '@/lib/server/user-session';
import { resolveRequestOrigin } from '@/lib/server/request-origin';

function parseSafeNext(stateParam: string | null): string {
  if (!stateParam) return '/akun';
  try {
    const parsed = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8')) as {
      next?: string;
    };
    if (parsed.next && parsed.next.startsWith('/') && !parsed.next.startsWith('//')) {
      return parsed.next;
    }
  } catch {
  }
  return '/akun';
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const nextPath = parseSafeNext(req.nextUrl.searchParams.get('state'));
  const origin = resolveRequestOrigin(req);

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/masuk?error=google_oauth_failed`);
  }

  try {
    const redirectUri = `${origin}/api/v1/auth/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenJson.access_token) {
      return NextResponse.redirect(`${origin}/masuk?error=google_token_failed`);
    }

    const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const profile = (await userRes.json()) as {
      email?: string;
      name?: string;
      picture?: string;
    };

    if (!userRes.ok || !profile.email) {
      return NextResponse.redirect(`${origin}/masuk?error=google_profile_failed`);
    }

    const account = await upsertUserAccount({
      name: profile.name || profile.email.split('@')[0],
      email: profile.email,
      authProvider: 'GOOGLE',
      emailVerified: true,
      avatarUrl: profile.picture,
    });

    const token = createSignedUserToken(account.id, account.email);
    const res = NextResponse.redirect(`${origin}${nextPath}`);
    attachUserSessionCookie(res, token);
    return res;
  } catch {
    return NextResponse.redirect(`${origin}/masuk?error=google_oauth_error`);
  }
}
