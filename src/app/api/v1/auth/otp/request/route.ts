import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, storeEmailOtp } from '@/lib/server/user-db';
import { verifyPassword } from '@/lib/server/user-session';
import { dispatchGmailOtpEmail, generateSixDigitOtp } from '@/lib/server/gmail-otp';
import type { OtpPurpose } from '@/lib/types/user';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
      purpose?: OtpPurpose;
    };

    const email = (body.email || '').trim().toLowerCase();
    const purpose: OtpPurpose = body.purpose === 'LOGIN' ? 'LOGIN' : 'REGISTER';

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Masukkan alamat email Gmail yang valid.' },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);

    if (purpose === 'REGISTER') {
      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: 'Email ini sudah terdaftar. Silakan masuk melalui halaman Masuk.',
          },
          { status: 409 }
        );
      }
      if (!body.name || body.name.trim().length < 2) {
        return NextResponse.json(
          { success: false, message: 'Nama lengkap minimal 2 karakter.' },
          { status: 400 }
        );
      }
      if (!body.password || body.password.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Kata sandi minimal 6 karakter.' },
          { status: 400 }
        );
      }
    } else {
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            message: 'Akun dengan email ini belum terdaftar. Silakan daftar terlebih dahulu.',
          },
          { status: 404 }
        );
      }
      if (existing.authProvider === 'GOOGLE' && !existing.passwordHash) {
        return NextResponse.json(
          {
            success: false,
            message: 'Akun ini terdaftar lewat Google. Gunakan tombol Lanjutkan dengan Google.',
          },
          { status: 400 }
        );
      }
      if (!body.password || !verifyPassword(body.password, existing.passwordHash)) {
        return NextResponse.json(
          { success: false, message: 'Email atau kata sandi tidak sesuai.' },
          { status: 401 }
        );
      }
    }

    const otpCode = generateSixDigitOtp();
    await storeEmailOtp(email, otpCode, purpose);

    const dispatch = await dispatchGmailOtpEmail({
      to: email,
      code: otpCode,
      purpose,
      recipientName: body.name?.trim() || existing?.name,
    });

    const isDemo = dispatch.deliveryMode === 'demo_simulation';

    return NextResponse.json({
      success: true,
      message: isDemo
        ? 'Mode Simulasi Demo: kode OTP Gmail siap digunakan di layar verifikasi.'
        : `Kode OTP 6 digit telah dikirim ke Gmail ${email}.`,
      data: {
        email,
        purpose,
        expiresInSeconds: 300,
        deliveryMode: dispatch.deliveryMode,
        demoOtpCode: isDemo ? otpCode : undefined,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses permintaan OTP Gmail.' },
      { status: 400 }
    );
  }
}
