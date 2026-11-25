import type { ApiResponse, Region } from '@/types';
import type { AdminReport } from '@/lib/types/admin';
import type {
  OtpDispatchData,
  OtpPurpose,
  UserCommodityHitSummary,
  UserProfile,
  UserSession,
} from '@/lib/types/user';

export interface UserDashboardPayload {
  user: UserProfile;
  region: Region;
  topCommodities: UserCommodityHitSummary[];
  regionalSummary: Array<{
    commodityId: string;
    slug: string;
    name: string;
    category: string;
    unit: string;
    regionalPrice: number;
    hapHetPrice: number;
    diffPercent: number;
  }>;
  reports: AdminReport[];
}

function buildAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function requestGmailOtpApi(payload: {
  email: string;
  password: string;
  name?: string;
  purpose: OtpPurpose;
}): Promise<ApiResponse<OtpDispatchData>> {
  const res = await fetch('/api/v1/auth/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiResponse<OtpDispatchData>;
}

export async function registerWithOtpApi(payload: {
  name: string;
  email: string;
  password: string;
  otpCode: string;
  preferredRegionId: string;
}): Promise<ApiResponse<UserSession>> {
  const res = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiResponse<UserSession>;
}

export async function loginWithOtpApi(payload: {
  email: string;
  password: string;
  otpCode: string;
}): Promise<ApiResponse<UserSession>> {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiResponse<UserSession>;
}

export async function checkGoogleOAuthApi(
  nextPath: string
): Promise<ApiResponse<{ configured: boolean; authUrl?: string; next?: string }>> {
  const qs = new URLSearchParams({ mode: 'json', next: nextPath });
  const res = await fetch(`/api/v1/auth/google?${qs.toString()}`, { cache: 'no-store' });
  return (await res.json()) as ApiResponse<{ configured: boolean; authUrl?: string; next?: string }>;
}

export async function loginWithGoogleDemoApi(payload: {
  email: string;
  name: string;
  preferredRegionId?: string;
}): Promise<ApiResponse<UserSession>> {
  const res = await fetch('/api/v1/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ApiResponse<UserSession>;
}

export async function fetchCurrentUserApi(
  token?: string | null
): Promise<ApiResponse<{ user: UserProfile; expiresAt: number }>> {
  const res = await fetch('/api/v1/auth/me', {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return (await res.json()) as ApiResponse<{ user: UserProfile; expiresAt: number }>;
}

export async function logoutUserApi(): Promise<void> {
  try {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
  } catch {
  }
}

export async function fetchUserDashboardApi(
  token?: string | null
): Promise<ApiResponse<UserDashboardPayload>> {
  const res = await fetch('/api/v1/user/dashboard', {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return (await res.json()) as ApiResponse<UserDashboardPayload>;
}

export async function updateUserProfileApi(
  patch: {
    name?: string;
    preferredRegionId?: string;
    currentPassword?: string;
    newPassword?: string;
  },
  token?: string | null
): Promise<ApiResponse<{ user: UserProfile }>> {
  const res = await fetch('/api/v1/user/profile', {
    method: 'PATCH',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(patch),
  });
  return (await res.json()) as ApiResponse<{ user: UserProfile }>;
}

export async function trackCommodityHitApi(
  commoditySlug: string,
  token?: string | null
): Promise<ApiResponse<{ frequentCommodities: Record<string, number> }>> {
  const res = await fetch('/api/v1/user/activity', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({ commoditySlug }),
  });
  return (await res.json()) as ApiResponse<{ frequentCommodities: Record<string, number> }>;
}
