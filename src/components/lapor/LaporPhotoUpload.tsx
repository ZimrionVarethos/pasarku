'use client';

import { useState } from 'react';
import {
  UploadSimple,
  X,
  ShieldCheck,
  WarningCircle,
  Plus,
} from '@phosphor-icons/react';

export interface UploadedPhotoItem {
  id: string;
  name: string;
  sizeKb: number;
  dataUrl: string;
}

const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function stripExifAndEncodeDataUrl(file: File): Promise<UploadedPhotoItem> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const maxSide = 960;
        const scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Kanvas browser tidak tersedia.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        URL.revokeObjectURL(objectUrl);
        const approxKb = Math.max(1, Math.round((dataUrl.length * 3) / 4 / 1024));
        const cleanName = file.name.replace(/\.[^.]+$/, '.jpg');
        resolve({
          id: `ph_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: cleanName,
          sizeKb: approxKb,
          dataUrl,
        });
      } catch {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Gagal memproses foto.'));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('File gambar tidak dapat dibaca.'));
    };
    img.src = objectUrl;
  });
}

interface Props {
  photos: UploadedPhotoItem[];
  onChangePhotos: (photos: UploadedPhotoItem[]) => void;
  fileInputId: string;
}

export function LaporPhotoUpload({ photos, onChangePhotos, fileInputId }: Props) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFilesPick = async (fileList: FileList | null) => {
    setUploadError(null);
    if (!fileList || fileList.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setUploadError(`Maksimal ${MAX_PHOTOS} foto bukti per laporan.`);
      return;
    }

    const picked = Array.from(fileList).slice(0, remaining);
    if (fileList.length > remaining) {
      setUploadError(`Hanya ${remaining} foto tambahan yang diproses (maksimal ${MAX_PHOTOS} foto).`);
    }

    setProcessing(true);
    const added: UploadedPhotoItem[] = [];
    for (const file of picked) {
      if (!ALLOWED_MIME.has(file.type)) {
        setUploadError('Format foto harus JPG, PNG, atau WebP.');
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setUploadError(`Foto "${file.name}" melebihi 5MB. Pilih foto lebih kecil.`);
        continue;
      }
      try {
        const cleaned = await stripExifAndEncodeDataUrl(file);
        added.push(cleaned);
      } catch {
        setUploadError(`Gagal memproses foto "${file.name}".`);
      }
    }
    setProcessing(false);
    if (added.length > 0) {
      onChangePhotos([...photos, ...added]);
    }
  };

  const handleRemove = (id: string) => {
    setUploadError(null);
    onChangePhotos(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[12px] font-bold text-[var(--text-primary)]">
          Foto Bukti Nota / Papan Harga{' '}
          <span className="font-normal text-[var(--text-muted)]">
            (Bisa hingga {MAX_PHOTOS} foto)
          </span>
        </label>
        <span className="font-mono-num text-[11px] font-bold text-[var(--forest-ink)]">
          {photos.length}/{MAX_PHOTOS} Foto
        </span>
      </div>

      {uploadError && (
        <div className="px-3 py-2 rounded-lg bg-[var(--accent-chili-soft)] border border-[var(--accent-chili)] text-[11px] font-bold text-[var(--accent-chili)] flex items-center gap-1.5">
          <WarningCircle size={14} weight="bold" className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative rounded-[12px] overflow-hidden border-2 border-[var(--border-ink)] bg-[var(--bg-paper)]"
              >
                <img
                  src={photo.dataUrl}
                  alt={`Pratinjau foto bukti ${idx + 1}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(photo.id)}
                  aria-label={`Hapus foto ${idx + 1}`}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 text-white hover:bg-[var(--accent-chili)] flex items-center justify-center cursor-pointer"
                >
                  <X size={13} weight="bold" />
                </button>
                <div className="px-2 py-1 text-[10px] font-bold text-[var(--text-secondary)] truncate bg-[var(--bg-card)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-1">
                  <span className="truncate">Foto {idx + 1}</span>
                  <span className="font-mono-num text-[9px] text-[var(--text-muted)] shrink-0">
                    {photo.sizeKb}KB
                  </span>
                </div>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <label
                htmlFor={fileInputId}
                className="h-[120px] rounded-[12px] border-2 border-dashed border-[var(--border-ink)] bg-[var(--bg-paper)] hover:bg-[var(--bg-muted)] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-center p-2"
              >
                <Plus size={20} weight="bold" className="text-[var(--forest-ink)]" />
                <span className="text-[11px] font-bold text-[var(--text-primary)]">
                  {processing ? 'Memproses...' : 'Tambah Foto'}
                </span>
              </label>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--forest-ink)]">
            <ShieldCheck size={13} weight="bold" />
            <span>Seluruh metadata EXIF &amp; koordinat GPS dibersihkan otomatis di browser</span>
          </span>
        </div>
      )}

      {photos.length === 0 && (
        <label
          htmlFor={fileInputId}
          className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--border-ink)] bg-[var(--bg-paper)] hover:bg-[var(--bg-muted)] rounded-[14px] p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center"
        >
          <UploadSimple size={24} weight="bold" className="text-[var(--text-muted)]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">
              {processing
                ? 'Membersihkan metadata EXIF & GPS foto...'
                : 'Unggah 1 hingga 4 foto struk, label harga, atau kondisi lapak'}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Bisa pilih banyak foto sekaligus (JPG, PNG, WebP maks. 5MB/foto). EXIF GPS otomatis dihapus.
            </span>
          </div>
        </label>
      )}

      <input
        id={fileInputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => {
          void handleFilesPick(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
