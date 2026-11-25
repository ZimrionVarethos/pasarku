'use client';

import { useEffect, useRef } from 'react';
import { useUserAuth } from '@/lib/store/user-auth-store';

export function CommodityHitTracker({ slug }: { slug: string }) {
  const { user, trackCommodityQuery } = useUserAuth();
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !slug || recordedRef.current === slug) return;
    recordedRef.current = slug;
    trackCommodityQuery(slug);
  }, [user, slug, trackCommodityQuery]);

  return null;
}
