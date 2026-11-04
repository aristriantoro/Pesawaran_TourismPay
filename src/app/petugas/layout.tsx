"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isScan = pathname.startsWith("/petugas/scan");
  const isCash = pathname.startsWith("/petugas/tunai");
  const isSync = pathname.startsWith("/petugas/sinkron");
  const isManifest = pathname.startsWith("/petugas/manifest");

  return (
    <div className="w-full min-h-screen bg-[#FBF7EF] flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#FBF7EF] relative flex flex-col shadow-coastal-1">
        {/* Banner Offline Amber Outdoor (SKILL §6.8 & PRD FR-08.1) */}
        <div className="bg-[#FFF3DC] border-b border-[#B7791F]/30 px-3.5 py-2 flex items-center justify-between text-xs text-[#7A4F00]">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-sm fill-icon text-[#B7791F]">offline_pin</span>
            <span>Database Lokal Siap · Mode Luar Ruang</span>
          </div>
          <Link
            href="/petugas/sinkron"
            className="px-2 py-0.5 rounded bg-[#FEF7EA] border border-[#B7791F]/40 text-[11px] font-extrabold hover:bg-white transition-colors"
          >
            Antrean Sinkron
          </Link>
        </div>

        {/* Header Petugas Dermaga */}
        <header className="sticky top-0 z-40 bg-[#00243D] text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              title="Ke Portal Wisatawan"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-sm font-extrabold text-[#7ff5f4]">
                  Dermaga Ketapang
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-bold">Pintu 1</span>
              </div>
              <span className="text-[11px] text-white/70 block">Petugas: Budi Santoso (BUMDes)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-lg bg-[#0FA3A3] text-white text-[11px] font-bold hover:bg-[#006a6a] transition-all"
            >
              Admin Desktop
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-24">{children}</main>

        {/* Bottom Bar Petugas (SKILL §6.8) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D5CEBF]/50 py-2 px-3 shadow-bottom-bar flex justify-center pb-safe">
          <div className="w-full max-w-[480px] grid grid-cols-4 gap-1">
            <Link
              href="/petugas/scan"
              className={`flex flex-col items-center py-1 rounded-xl text-center transition-all ${
                isScan
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isScan ? "fill-icon" : ""}`}>
                qr_code_scanner
              </span>
              <span className="text-[11px] mt-0.5">Pindai</span>
            </Link>

            <Link
              href="/petugas/tunai"
              className={`flex flex-col items-center py-1 rounded-xl text-center transition-all ${
                isCash
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isCash ? "fill-icon" : ""}`}>
                payments
              </span>
              <span className="text-[11px] mt-0.5">Catat Kas</span>
            </Link>

            <Link
              href="/petugas/sinkron"
              className={`flex flex-col items-center py-1 rounded-xl text-center transition-all ${
                isSync
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isSync ? "fill-icon" : ""}`}>
                sync
              </span>
              <span className="text-[11px] mt-0.5">Sinkron</span>
            </Link>

            <Link
              href="/petugas/manifest"
              className={`flex flex-col items-center py-1 rounded-xl text-center transition-all ${
                isManifest
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isManifest ? "fill-icon" : ""}`}>
                directions_boat
              </span>
              <span className="text-[11px] mt-0.5">Manifes</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
