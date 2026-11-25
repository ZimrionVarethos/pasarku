import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthorizedUserFromRequest,
  hashPassword,
  verifyPassword,
} from '@/lib/server/user-session';
import {
  findUserById,
  toPublicUserProfile,
  updateUserProfileRecord,
} from '@/lib/server/user-db';
import { MOCK_REGIONS } from '@/lib/mock/regions.data';

export async function PATCH(req: NextRequest) {
  const auth = getAuthorizedUserFromRequest(req);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Autentikasi pengguna diperlukan.' },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      preferredRegionId?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const existing = await findUserById(auth.userId);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Akun pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    const patch: { name?: string; preferredRegionId?: string; passwordHash?: string } = {};

    if (typeof body.name === 'string') {
      const trimmed = body.name.trim();
      if (trimmed.length < 2) {
        return NextResponse.json(
          { success: false, message: 'Nama lengkap minimal 2 karakter.' },
          { status: 400 }
        );
      }
      patch.name = trimmed;
    }

    if (typeof body.preferredRegionId === 'string' && body.preferredRegionId.trim()) {
      const matched = MOCK_REGIONS.find(
        (r) => r.id === body.preferredRegionId || r.slug === body.preferredRegionId
      );
      if (matched) {
        patch.preferredRegionId = matched.id;
      }
    }

    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Kata sandi baru minimal 6 karakter.' },
          { status: 400 }
        );
      }
      if (existing.passwordHash && !verifyPassword(body.currentPassword || '', existing.passwordHash)) {
        return NextResponse.json(
          { success: false, message: 'Kata sandi saat ini tidak sesuai.' },
          { status: 400 }
        );
      }
      patch.passwordHash = hashPassword(body.newPassword);
    }

    const updated = await updateUserProfileRecord(auth.userId, patch);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui profil pengguna.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan akun berhasil disimpan.',
      data: {
        user: toPublicUserProfile(updated),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Payload pembaruan profil tidak valid.' },
      { status: 400 }
    );
  }
}
