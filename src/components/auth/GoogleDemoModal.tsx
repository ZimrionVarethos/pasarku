'use client';

import { useState } from 'react';
import { X, EnvelopeSimple, User, WarningCircle, CheckCircle } from '@phosphor-icons/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { name: string; email: string }) => Promise<void>;
  isSubmitting: boolean;
}

const DEMO_GOOGLE_ACCOUNTS = [
  {
    name: 'Nadia Putri',
    email: 'warga.demo@gmail.com',
    note: 'Akun Demo dengan 3 riwayat laporan (Diterima, Diproses, Ditolak)',
  },
  {
    name: 'Dimas Pratama',
    email: 'dimas.pasar@gmail.com',
    note: 'Akun Warga Baru (Kota Bogor)',
  },
];

export function GoogleDemoModal({
  isOpen,
  onClose,
  onSelectAccount,
  isSubmitting,
}: Props) {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = customEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat Gmail yang valid.');
      return;
    }
    const name = customName.trim() || email.split('@')[0];
    await onSelectAccount({ name, email });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#0A120E]/65 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md market-card p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-[var(--border-ink)]">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[var(--ochre-surface)] text-[var(--warning-ink)] border border-[var(--earth-ochre)]/45">
              Mode Simulasi Google OAuth
            </span>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1.5">
              Pilih Akun Google Anda
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              OAuth Google server belum diisi kredensial produksi; pilih akun demo atau masukkan Gmail Anda untuk lanjut.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog akun Google"
            className="market-btn-secondary w-8 h-8 p-0 inline-flex items-center justify-center shrink-0"
          >
            <X size={15} weight="bold" />
          </button>
        </div>

        <div className="space-y-2.5">
          {DEMO_GOOGLE_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={isSubmitting}
              onClick={() => void onSelectAccount({ name: acc.name, email: acc.email })}
              className="w-full p-3 rounded-[12px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] hover:bg-[var(--bg-muted)] text-left flex items-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--forest-surface)] border border-[var(--border-ink)] text-[var(--forest-ink)] font-bold text-sm flex items-center justify-center shrink-0">
                {acc.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="truncate">{acc.name}</span>
                  <CheckCircle size={13} weight="fill" className="text-[var(--forest-ink)] shrink-0" />
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] truncate">{acc.email}</div>
                <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{acc.note}</div>
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Atau Gunakan Alamat Gmail Lain
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-[var(--accent-chili-soft)] border border-[var(--accent-chili)] text-[11px] font-bold text-[var(--accent-chili)] flex items-center gap-1.5">
              <WarningCircle size={14} weight="fill" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nama lengkap"
                className="w-full pl-8 pr-3 py-2 rounded-lg border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] text-xs text-[var(--text-primary)]"
              />
            </div>
            <div className="relative">
              <EnvelopeSimple size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full pl-8 pr-3 py-2 rounded-lg border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] text-xs text-[var(--text-primary)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="market-btn-primary w-full py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Menghubungkan Akun Google...' : 'Lanjutkan dengan Akun Ini'}
          </button>
        </form>
      </div>
    </div>
  );
}
