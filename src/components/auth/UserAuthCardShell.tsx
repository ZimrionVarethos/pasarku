'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Moon, Sun, WarningCircle } from '@phosphor-icons/react';
import { useTheme } from '@/lib/store/theme-store';
import { GoogleSignInButton } from './GoogleSignInButton';

interface Props {
  badgeText: string;
  title: string;
  subtitle: string;
  errorMessage: string;
  successMessage: string | null;
  showGoogleSection: boolean;
  googleButtonLabel: string;
  googleDividerLabel: string;
  onGoogleClick: () => void;
  googleDisabled: boolean;
  switchPromptText: string;
  switchLinkLabel: string;
  switchLinkHref: string;
  children: ReactNode;
}

export function UserAuthCardShell({
  badgeText,
  title,
  subtitle,
  errorMessage,
  successMessage,
  showGoogleSection,
  googleButtonLabel,
  googleDividerLabel,
  onGoogleClick,
  googleDisabled,
  switchPromptText,
  switchLinkLabel,
  switchLinkHref,
  children,
}: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-full max-w-md market-card p-6 sm:p-8 space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="pasarku-logo-plaque">
              <Image
                src="/images/pasarku/logo-nav.webp"
                alt="Logo PasarKu"
                width={400}
                height={173}
                unoptimized
                className="h-7 w-auto object-contain"
              />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-ink)]">
              {badgeText}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Beralih ke Mode Siang' : 'Beralih ke Mode Subuh'}
            className="market-btn-secondary w-9 h-9 p-0 inline-flex items-center justify-center shrink-0"
          >
            {theme === 'dark' ? (
              <Sun size={17} weight="bold" className="text-[#EEF773]" />
            ) : (
              <Moon size={17} weight="bold" className="text-[var(--text-primary)]" />
            )}
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-[10px] bg-[var(--accent-chili-soft)] border-2 border-[var(--accent-chili)] text-xs font-bold text-[var(--accent-chili)] flex items-center gap-2">
          <WarningCircle size={16} weight="fill" className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-[10px] bg-[var(--forest-surface)] border-2 border-[var(--forest-ink)] text-xs font-bold text-[var(--forest-ink)] flex items-center gap-2">
          <CheckCircle size={16} weight="fill" className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {showGoogleSection && (
        <>
          <GoogleSignInButton
            label={googleButtonLabel}
            onClick={onGoogleClick}
            disabled={googleDisabled}
          />
          <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-muted)]">
            <span className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span>{googleDividerLabel}</span>
            <span className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>
        </>
      )}

      {children}

      <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col items-center gap-2 text-xs">
        <span className="text-[var(--text-secondary)]">
          {switchPromptText}{' '}
          <Link href={switchLinkHref} className="font-bold text-[var(--accent-chili)] hover:underline">
            {switchLinkLabel}
          </Link>
        </span>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] no-underline"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Kembali ke Website Publik</span>
        </Link>
      </div>
    </div>
  );
}
