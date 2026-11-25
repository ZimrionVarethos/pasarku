'use client';

import Image from 'next/image';
import {
  ShieldCheck,
  Camera,
  ChartLineUp,
  CheckCircle,
} from '@phosphor-icons/react';

export function UserAuthShowcase() {
  const highlights = [
    {
      icon: ShieldCheck,
      iconBg: 'bg-[#E2EFE6] text-[#245034] border border-[#132E20]',
      title: 'Laporan Anti-Fraud Terverifikasi Gmail',
      desc: 'Setiap pelapor terautentikasi lewat Google atau verifikasi OTP Gmail agar harga lapangan bebas spam & manipulasi.',
    },
    {
      icon: Camera,
      iconBg: 'bg-[#FBE9E6] text-[#A92717] border border-[#132E20]',
      title: 'Bukti Multi-Foto & Lacak Status Real',
      desc: 'Unggah hingga 4 foto struk atau kondisi lapak per laporan (EXIF GPS dibersihkan) dan pantau status Diproses, Selesai, atau Ditolak.',
    },
    {
      icon: ChartLineUp,
      iconBg: 'bg-[#F5E9D4] text-[#8A5316] border border-[#132E20]',
      title: 'Ringkasan Harga Daerah & 3 Pangan Favorit',
      desc: 'Dashboard pribadi menampilkan rangkuman harga daerah pilihan dan 3 bahan pangan yang paling sering Anda cek.',
    },
  ];

  return (
    <div className="relative w-full h-full bg-[var(--bg-stage)] text-[#F9F3EE] p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center bg-[#F9F3EE] px-2.5 py-1 rounded-[10px] border-2 border-[#D8C8B0] shadow-[2px_2px_0px_#060B08]">
            <Image
              src="/images/pasarku/logo-nav.webp"
              alt="Logo PasarKu"
              width={400}
              height={173}
              unoptimized
              className="h-7 w-auto object-contain"
            />
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-[#F9F3EE]">
              Akun Warga PasarKu
            </span>
            <span className="text-[10px] text-[#9AB0A1] tracking-wider uppercase font-bold">
              PEMBELI &amp; KONTRIBUTOR PANGAN
            </span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3127] border border-[#4E6B59] text-[11px] font-bold text-[#6EE7A0]">
            Transparansi Pangan Berbasis Komunitas
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F9F3EE] leading-tight">
            Tawar Pintar, Belanja Wajar di Setiap Pasar Rakyat
          </h2>
          <p className="text-xs sm:text-sm text-[#D0DDD4] leading-relaxed max-w-md">
            Masuk dengan akun Google atau email terverifikasi OTP Gmail untuk melapor harga lapangan, menyimpan 3 pangan andalan, dan memantau riwayat laporan Anda.
          </p>
        </div>
      </div>

      <div className="my-8 space-y-3 max-w-lg">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-3.5 rounded-[12px] bg-[#16241D] border-2 border-[#4E6B59] shadow-[2px_2px_0px_#060B08] flex items-start gap-3.5"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}
              >
                <Icon size={18} weight="bold" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-xs text-[#F9F3EE]">{item.title}</span>
                <p className="text-[11px] text-[#D0DDD4] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#2A3F33] flex items-center justify-between text-xs text-[#9AB0A1]">
        <div className="flex items-center gap-1.5">
          <CheckCircle size={15} weight="fill" className="text-[#6EE7A0]" />
          <span className="text-[11px] font-medium">Identitas Pelapor Dilindungi di Publik</span>
        </div>
        <span className="font-mono-num text-[10px]">PasarKu Indonesia</span>
      </div>
    </div>
  );
}
