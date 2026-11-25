import { NextRequest, NextResponse } from 'next/server';
import {
  findUserByEmail,
  toPublicUserProfile,
  verifyAndConsumeEmailOtp,
} from '@/lib/server/user-db';
import {
  attachUserSessionCookie,
  createSignedUserToken,
  verifyPassword,
} from '@/lib/server/user-session';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      otpCode?: string;
    };

    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const otpCode = (body.otpCode || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { success: false, message: 'Verifikasi kode OTP 6 digit dari Gmail wajib dilengkapi.' },
        { status: 400 }
      );
    }

    const otpValid = await verifyAndConsumeEmailOtp(email, otpCode, 'LOGIN');
    if (!otpValid) {
      return NextResponse.json(
        { success: false, message: 'Kode OTP tidak valid atau sudah kedaluwarsa.' },
        { status: 401 }
      );
    }

    const token = createSignedUserToken(user.id, user.email);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const res = NextResponse.json({
      success: true,
      message: 'Login berhasil dengan verifikasi OTP Gmail.',
      data: {
        token,
        expiresAt,
        user: toPublicUserProfile(user),
      },
    });
    attachUserSessionCookie(res, token);
    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Permintaan login tidak valid.' },
      { status: 400 }
    );
  }
}
