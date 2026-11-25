import { NextRequest, NextResponse } from 'next/server';
import {
  findUserByEmail,
  toPublicUserProfile,
  upsertUserAccount,
  verifyAndConsumeEmailOtp,
} from '@/lib/server/user-db';
import {
  attachUserSessionCookie,
  createSignedUserToken,
  hashPassword,
} from '@/lib/server/user-session';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      otpCode?: string;
      preferredRegionId?: string;
    };

    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const otpCode = (body.otpCode || '').trim();

    if (name.length < 2 || !EMAIL_REGEX.test(email) || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Nama, email valid, dan kata sandi (min. 6 karakter) wajib diisi.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { success: false, message: 'Masukkan kode OTP 6 digit dari Gmail.' },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar. Silakan masuk melalui halaman Masuk.' },
        { status: 409 }
      );
    }

    const otpValid = await verifyAndConsumeEmailOtp(email, otpCode, 'REGISTER');
    if (!otpValid) {
      return NextResponse.json(
        { success: false, message: 'Kode OTP tidak valid atau sudah kedaluwarsa. Kirim ulang OTP.' },
        { status: 401 }
      );
    }

    const created = await upsertUserAccount({
      name,
      email,
      passwordHash: hashPassword(password),
      authProvider: 'EMAIL',
      emailVerified: true,
      preferredRegionId: body.preferredRegionId || 'reg_bogor',
    });

    const token = createSignedUserToken(created.id, created.email);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const res = NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil dan email Gmail telah terverifikasi.',
      data: {
        token,
        expiresAt,
        user: toPublicUserProfile(created),
      },
    });
    attachUserSessionCookie(res, token);
    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal menyelesaikan pendaftaran akun.' },
      { status: 400 }
    );
  }
}
