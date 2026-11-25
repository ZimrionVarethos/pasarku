export type UserAuthProvider = 'EMAIL' | 'GOOGLE';

export type UserDashboardModule = 'home' | 'riwayat' | 'pengaturan';

export type OtpPurpose = 'REGISTER' | 'LOGIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  authProvider: UserAuthProvider;
  emailVerified: boolean;
  preferredRegionId: string;
  avatarUrl?: string;
  frequentCommodities: Record<string, number>;
  createdAt: string;
}

export interface UserSession {
  token: string;
  user: UserProfile;
  expiresAt: number;
}

export interface OtpDispatchData {
  email: string;
  purpose: OtpPurpose;
  expiresInSeconds: number;
  deliveryMode: 'gmail_smtp' | 'demo_simulation';
  demoOtpCode?: string;
}

export interface UserCommodityHitSummary {
  commodityId: string;
  slug: string;
  name: string;
  category: string;
  unit: string;
  queryCount: number;
  regionalPrice: number;
  hapHetPrice: number;
  diffPercent: number;
}
