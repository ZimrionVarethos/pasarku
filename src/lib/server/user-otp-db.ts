import crypto from 'node:crypto';
import { dbQuery } from './db';
import { hashOtpCode } from './user-session';
import type { OtpPurpose } from '@/lib/types/user';
import type { AdminReport } from '@/lib/types/admin';
import { INITIAL_ADMIN_REPORTS } from '@/lib/store/admin-seed-reports';

interface MemoryOtpEntry {
  email: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: number;
  consumed: boolean;
}

const globalForOtpMem = globalThis as unknown as {
  pasarkuOtpsMem?: MemoryOtpEntry[];
};

function getMemoryOtps(): MemoryOtpEntry[] {
  if (!globalForOtpMem.pasarkuOtpsMem) {
    globalForOtpMem.pasarkuOtpsMem = [];
  }
  return globalForOtpMem.pasarkuOtpsMem;
}

export async function storeEmailOtpWithSchema(
  schemaReady: boolean,
  email: string,
  code: string,
  purpose: OtpPurpose
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const codeHash = hashOtpCode(normalized, code);
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const otps = getMemoryOtps();
  otps.push({ email: normalized, codeHash, purpose, expiresAt, consumed: false });
  if (otps.length > 200) otps.splice(0, otps.length - 100);

  if (schemaReady) {
    try {
      await dbQuery(
        `INSERT INTO email_otps (id, email, code_hash, purpose, expires_at, consumed)
         VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0), false)`,
        [`otp_${crypto.randomBytes(6).toString('hex')}`, normalized, codeHash, purpose, expiresAt]
      );
    } catch {
    }
  }
}

export async function verifyEmailOtpWithSchema(
  schemaReady: boolean,
  email: string,
  code: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const expectedHash = hashOtpCode(normalized, code);

  if (schemaReady) {
    try {
      const res = await dbQuery<{ id: string }>(
        `SELECT id FROM email_otps
         WHERE LOWER(email) = $1 AND purpose = $2 AND code_hash = $3 AND consumed = false AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [normalized, purpose, expectedHash]
      );
      if (res.rows[0]) {
        await dbQuery('UPDATE email_otps SET consumed = true WHERE id = $1', [res.rows[0].id]);
        return true;
      }
    } catch {
    }
  }

  const otps = getMemoryOtps();
  for (let i = otps.length - 1; i >= 0; i--) {
    const entry = otps[i];
    if (
      entry.email === normalized &&
      entry.purpose === purpose &&
      !entry.consumed &&
      entry.expiresAt > Date.now() &&
      entry.codeHash === expectedHash
    ) {
      entry.consumed = true;
      return true;
    }
  }
  return false;
}

export function getSeedReportsForUser(userId: string, email: string): AdminReport[] {
  return INITIAL_ADMIN_REPORTS.filter(
    (r) => r.userId === userId || (r.reporterEmail && r.reporterEmail.toLowerCase() === email.toLowerCase())
  );
}
