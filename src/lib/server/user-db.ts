import crypto from 'node:crypto';
import { dbQuery, getPgPool } from './db';
import { hashPassword } from './user-session';
import {
  getSeedReportsForUser,
  storeEmailOtpWithSchema,
  verifyEmailOtpWithSchema,
} from './user-otp-db';
import type { OtpPurpose, UserAuthProvider, UserProfile } from '@/lib/types/user';

export { getSeedReportsForUser };

export interface StoredUserRecord extends UserProfile {
  passwordHash: string | null;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  auth_provider: string;
  email_verified: boolean;
  preferred_region_id: string;
  avatar_url: string | null;
  frequent_commodities: Record<string, number> | string | null;
  created_at: string | Date;
}

const globalForUserMem = globalThis as unknown as {
  pasarkuUsersMem?: Map<string, StoredUserRecord>;
  pasarkuUserSchemaReady?: boolean;
};

function getMemoryUsers(): Map<string, StoredUserRecord> {
  if (!globalForUserMem.pasarkuUsersMem) {
    const map = new Map<string, StoredUserRecord>();
    const demoUser: StoredUserRecord = {
      id: 'usr_demo_warga',
      name: 'Nadia Putri',
      email: 'warga.demo@gmail.com',
      passwordHash: hashPassword('pasarku123'),
      authProvider: 'EMAIL',
      emailVerified: true,
      preferredRegionId: 'reg_bogor',
      frequentCommodities: {
        'cabai-rawit-merah': 7,
        'bawang-merah-brebes': 5,
        'beras-medium-ir64': 4,
      },
      createdAt: new Date().toISOString(),
    };
    map.set(demoUser.email, demoUser);
    globalForUserMem.pasarkuUsersMem = map;
  }
  return globalForUserMem.pasarkuUsersMem;
}

function parseFreq(raw: Record<string, number> | string | null): Record<string, number> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as Record<string, number>;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof raw === 'object' ? raw : {};
}

function mapUserRow(r: UserRow): StoredUserRecord {
  return {
    id: r.id,
    name: r.name,
    email: r.email.toLowerCase(),
    passwordHash: r.password_hash,
    authProvider: r.auth_provider === 'GOOGLE' ? 'GOOGLE' : 'EMAIL',
    emailVerified: Boolean(r.email_verified),
    preferredRegionId: r.preferred_region_id || 'reg_bogor',
    avatarUrl: r.avatar_url || undefined,
    frequentCommodities: parseFreq(r.frequent_commodities),
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  };
}

export function toPublicUserProfile(rec: StoredUserRecord): UserProfile {
  return {
    id: rec.id,
    name: rec.name,
    email: rec.email,
    authProvider: rec.authProvider,
    emailVerified: rec.emailVerified,
    preferredRegionId: rec.preferredRegionId,
    avatarUrl: rec.avatarUrl,
    frequentCommodities: rec.frequentCommodities,
    createdAt: rec.createdAt,
  };
}

export async function ensureUserSchemaReady(): Promise<boolean> {
  if (globalForUserMem.pasarkuUserSchemaReady) return true;
  if (!getPgPool()) return false;
  try {
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        auth_provider TEXT NOT NULL DEFAULT 'EMAIL',
        email_verified BOOLEAN NOT NULL DEFAULT false,
        preferred_region_id TEXT NOT NULL DEFAULT 'reg_bogor',
        avatar_url TEXT,
        frequent_commodities JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS email_otps (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        purpose TEXT NOT NULL DEFAULT 'REGISTER',
        expires_at TIMESTAMPTZ NOT NULL,
        consumed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb;
      ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS user_id TEXT;
      ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS reporter_name TEXT;
      ALTER TABLE citizen_reports ADD COLUMN IF NOT EXISTS reporter_email TEXT;
    `);
    globalForUserMem.pasarkuUserSchemaReady = true;
    return true;
  } catch {
    return false;
  }
}

export async function findUserByEmail(email: string): Promise<StoredUserRecord | null> {
  const normalized = email.trim().toLowerCase();
  if (await ensureUserSchemaReady()) {
    try {
      const res = await dbQuery<UserRow>('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalized]);
      if (res.rows[0]) {
        const mapped = mapUserRow(res.rows[0]);
        getMemoryUsers().set(mapped.email, mapped);
        return mapped;
      }
    } catch {
    }
  }
  return getMemoryUsers().get(normalized) || null;
}

export async function findUserById(id: string): Promise<StoredUserRecord | null> {
  if (await ensureUserSchemaReady()) {
    try {
      const res = await dbQuery<UserRow>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows[0]) {
        const mapped = mapUserRow(res.rows[0]);
        getMemoryUsers().set(mapped.email, mapped);
        return mapped;
      }
    } catch {
    }
  }
  for (const user of getMemoryUsers().values()) {
    if (user.id === id) return user;
  }
  return null;
}

export async function upsertUserAccount(input: {
  id?: string;
  name: string;
  email: string;
  passwordHash?: string | null;
  authProvider: UserAuthProvider;
  emailVerified: boolean;
  preferredRegionId?: string;
  avatarUrl?: string;
}): Promise<StoredUserRecord> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  const record: StoredUserRecord = {
    id: existing?.id || input.id || `usr_${crypto.randomBytes(6).toString('hex')}`,
    name: input.name.trim() || existing?.name || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    passwordHash:
      input.passwordHash !== undefined ? input.passwordHash : existing?.passwordHash ?? null,
    authProvider: existing?.authProvider || input.authProvider,
    emailVerified: existing?.emailVerified || input.emailVerified,
    preferredRegionId: input.preferredRegionId || existing?.preferredRegionId || 'reg_bogor',
    avatarUrl: input.avatarUrl || existing?.avatarUrl,
    frequentCommodities: existing?.frequentCommodities || {
      'cabai-rawit-merah': 3,
      'bawang-merah-brebes': 2,
      'beras-medium-ir64': 1,
    },
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  getMemoryUsers().set(record.email, record);

  if (await ensureUserSchemaReady()) {
    try {
      await dbQuery(
        `INSERT INTO users (id, name, email, password_hash, auth_provider, email_verified, preferred_region_id, avatar_url, frequent_commodities, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
           email_verified = users.email_verified OR EXCLUDED.email_verified,
           preferred_region_id = EXCLUDED.preferred_region_id,
           avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
           updated_at = NOW()`,
        [
          record.id, record.name, record.email, record.passwordHash, record.authProvider,
          record.emailVerified, record.preferredRegionId, record.avatarUrl || null,
          JSON.stringify(record.frequentCommodities),
        ]
      );
    } catch {
    }
  }
  return record;
}

export async function updateUserProfileRecord(
  userId: string,
  patch: { name?: string; preferredRegionId?: string; passwordHash?: string }
): Promise<StoredUserRecord | null> {
  const existing = await findUserById(userId);
  if (!existing) return null;
  const updated: StoredUserRecord = {
    ...existing,
    name: patch.name?.trim() ? patch.name.trim() : existing.name,
    preferredRegionId: patch.preferredRegionId || existing.preferredRegionId,
    passwordHash: patch.passwordHash ?? existing.passwordHash,
  };
  getMemoryUsers().set(updated.email, updated);

  if (await ensureUserSchemaReady()) {
    try {
      await dbQuery(
        'UPDATE users SET name = $2, preferred_region_id = $3, password_hash = COALESCE($4, password_hash), updated_at = NOW() WHERE id = $1',
        [updated.id, updated.name, updated.preferredRegionId, patch.passwordHash ?? null]
      );
    } catch {
    }
  }
  return updated;
}

export async function incrementUserCommodityHit(
  userId: string,
  commoditySlug: string
): Promise<Record<string, number>> {
  const cleanSlug = commoditySlug.trim().toLowerCase();
  const existing = await findUserById(userId);
  if (!existing || !cleanSlug) return existing?.frequentCommodities || {};

  const nextFreq: Record<string, number> = {
    ...existing.frequentCommodities,
    [cleanSlug]: (existing.frequentCommodities[cleanSlug] || 0) + 1,
  };
  existing.frequentCommodities = nextFreq;
  getMemoryUsers().set(existing.email, existing);

  if (await ensureUserSchemaReady()) {
    try {
      await dbQuery(
        'UPDATE users SET frequent_commodities = $2::jsonb, updated_at = NOW() WHERE id = $1',
        [userId, JSON.stringify(nextFreq)]
      );
    } catch {
    }
  }
  return nextFreq;
}

export async function storeEmailOtp(email: string, code: string, purpose: OtpPurpose): Promise<void> {
  const ready = await ensureUserSchemaReady();
  await storeEmailOtpWithSchema(ready, email, code, purpose);
}

export async function verifyAndConsumeEmailOtp(
  email: string,
  code: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const ready = await ensureUserSchemaReady();
  return verifyEmailOtpWithSchema(ready, email, code, purpose);
}
