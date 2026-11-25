'use client';

import { useEffect, useState } from 'react';
import {
  Camera,
  CaretLeft,
  CaretRight,
  MagnifyingGlassPlus,
  ShieldCheck,
  X,
} from '@phosphor-icons/react';

interface Props {
  photoUrls?: string[];
  fallbackPhotoUrl?: string;
  hasPhoto?: boolean;
  emptyLabel?: string;
  compact?: boolean;
}

export function ReportPhotoGallery({
  photoUrls,
  fallbackPhotoUrl,
  hasPhoto = false,
  emptyLabel = 'Pelapor tidak menyertakan foto.',
  compact = false,
}: Props) {
  const photos =
    photoUrls && photoUrls.length > 0
      ? photoUrls
      : fallbackPhotoUrl
      ? [fallbackPhotoUrl]
      : [];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight' && photos.length > 1) {
        setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % photos.length));
      }
      if (e.key === 'ArrowLeft' && photos.length > 1) {
        setLightboxIndex((prev) =>
          prev === null ? 0 : (prev - 1 + photos.length) % photos.length
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="p-4 rounded-[12px] bg-[var(--bg-paper)] border border-[var(--border-subtle)] text-[12px] text-[var(--text-muted)] text-center flex flex-col items-center gap-1.5">
        <Camera size={22} weight="bold" className="opacity-60" />
        <span>{hasPhoto ? 'Foto terdaftar tanpa pratinjau tersimpan.' : emptyLabel}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Bukti Foto Lapangan ({photos.length} Foto)
        </span>
        <span className="text-[11px] font-bold text-[var(--forest-ink)] inline-flex items-center gap-1">
          <ShieldCheck size={14} weight="bold" />
          <span>EXIF Sanitized: No GPS</span>
        </span>
      </div>

      <div
        className={`grid gap-2.5 ${
          photos.length === 1
            ? 'grid-cols-1'
            : compact
            ? 'grid-cols-2 sm:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-2'
        }`}
      >
        {photos.map((src, idx) => (
          <button
            key={`${idx}-${src.slice(0, 32)}`}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            className="group relative rounded-[12px] overflow-hidden border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent-chili)]"
          >
            {failedIndices[idx] ? (
              <div
                className={`${
                  compact ? 'h-24' : 'h-40'
                } w-full flex flex-col items-center justify-center gap-1 bg-[var(--bg-muted)] text-[var(--text-muted)] text-[11px]`}
              >
                <Camera size={20} weight="bold" />
                <span>Pratinjau tidak tersedia</span>
              </div>
            ) : (
              <img
                src={src}
                alt={`Bukti foto laporan ${idx + 1}`}
                onError={() => setFailedIndices((prev) => ({ ...prev, [idx]: true }))}
                className={`${
                  compact ? 'h-24' : photos.length === 1 ? 'h-56' : 'h-40'
                } w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]`}
              />
            )}

            <div className="absolute inset-x-0 bottom-0 px-2.5 py-1.5 bg-gradient-to-t from-black/75 via-black/40 to-transparent flex items-center justify-between text-white">
              <span className="text-[10px] font-bold font-mono-num">
                Foto {idx + 1}/{photos.length}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold">
                <MagnifyingGlassPlus size={13} weight="bold" />
                <span>Perbesar</span>
              </span>
            </div>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A120E]/85 backdrop-blur-xs"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full market-card p-3 sm:p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="font-mono-num text-xs font-bold text-[var(--text-primary)]">
                  Bukti Foto {lightboxIndex + 1} dari {photos.length}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--forest-surface)] text-[var(--forest-ink)] border border-[var(--forest-ink)]/35">
                  EXIF &amp; GPS Sanitized
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Tutup pratinjau foto"
                className="market-btn-secondary w-8 h-8 p-0 inline-flex items-center justify-center cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="relative bg-[var(--bg-paper)] rounded-[10px] border border-[var(--border-subtle)] flex items-center justify-center min-h-[280px] max-h-[70vh] overflow-hidden">
              <img
                src={photos[lightboxIndex]}
                alt={`Bukti foto detail ${lightboxIndex + 1}`}
                className="max-h-[68vh] w-auto max-w-full object-contain"
              />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)
                    }
                    aria-label="Foto sebelumnya"
                    className="absolute left-3 top-1/2 -translate-y-1/2 market-btn-secondary w-10 h-10 p-0 inline-flex items-center justify-center cursor-pointer"
                  >
                    <CaretLeft size={18} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % photos.length)}
                    aria-label="Foto berikutnya"
                    className="absolute right-3 top-1/2 -translate-y-1/2 market-btn-secondary w-10 h-10 p-0 inline-flex items-center justify-center cursor-pointer"
                  >
                    <CaretRight size={18} weight="bold" />
                  </button>
                </>
              )}
            </div>

            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                {photos.map((thumb, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                      idx === lightboxIndex
                        ? 'border-[var(--accent-chili)] ring-2 ring-[var(--accent-chili)]/30'
                        : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
