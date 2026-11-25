import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizedUserFromRequest } from '@/lib/server/user-session';
import { incrementUserCommodityHit } from '@/lib/server/user-db';

export async function POST(req: NextRequest) {
  const auth = getAuthorizedUserFromRequest(req);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Sesi pengguna diperlukan.' },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as { commoditySlug?: string };
    const slug = (body.commoditySlug || '').trim().toLowerCase();
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug komoditas wajib diisi.' },
        { status: 400 }
      );
    }

    const frequentCommodities = await incrementUserCommodityHit(auth.userId, slug);
    return NextResponse.json({
      success: true,
      message: 'Aktivitas komoditas dicatat.',
      data: { frequentCommodities },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal mencatat aktivitas.' },
      { status: 400 }
    );
  }
}
