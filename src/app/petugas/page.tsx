import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function PetugasHomePage() {
  const today = new Date().toISOString().split("T")[0];

  // Quick stats for staff
  const scanCountToday = await prisma.ticketScan.count();
  const cashSum = await prisma.cashTransaction.aggregate({
    _sum: { amount: true },
    where: { status: "RECORDED" },
  });
  const conflictCount = await prisma.syncQueue.count({
    where: { syncStatus: "CONFLICT" },
  });

  return (
    <div className="p-4 space-y-4">
      {/* Banner Sapaan Petugas */}
      <section className="bg-gradient-to-br from-[#0B3A5B] to-[#00243D] rounded-3xl p-5 text-white shadow-coastal-2 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#7ff5f4] uppercase tracking-wider">
            Pos Pemeriksaan Dermaga
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
            Aktif
          </span>
        </div>

        <div>
          <h2 className="text-headline-lg-mobile font-bold">Halo, Budi Santoso</h2>
          <p className="text-xs text-white/80 mt-0.5">
            Shift Pagi · Pintu 1 Keberangkatan Ketapang
          </p>
        </div>

        <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-center">
          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-[10px] uppercase tracking-wider text-white/70 block">
              Tiket Divalidasi
            </span>
            <span className="text-headline-sm font-extrabold text-[#7ff5f4]">
              {scanCountToday}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-[10px] uppercase tracking-wider text-white/70 block">
              Kas Tunai Di Pos
            </span>
            <span className="text-headline-sm font-extrabold text-[#7ff5f4]">
              {formatRupiah(Number(cashSum._sum.amount || 0))}
            </span>
          </div>
        </div>
      </section>

      {/* Peringatan Siaga Jika Ada Konflik Offline (SKILL §6.8) */}
      {conflictCount > 0 && (
        <Link
          href="/petugas/sinkron"
          className="rounded-2xl p-3.5 bg-[#FCECE9] border-2 border-brand-coral flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2.5 text-brand-coral">
            <span className="material-symbols-outlined fill-icon text-2xl">warning</span>
            <div>
              <span className="text-xs font-extrabold block">
                {conflictCount} Peristiwa Perlu Ditinjau (SIAGA)
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Terdeteksi potensi pemindaian ganda offline
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-brand-coral">chevron_right</span>
        </Link>
      )}

      {/* Menu Aksi Cepat Petugas */}
      <div className="space-y-3">
        <h3 className="text-label-md text-primary-container font-bold">
          Menu Operasional Dermaga
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/petugas/scan"
            className="p-4 rounded-2xl bg-white border border-[#D5CEBF]/40 shadow-sm hover:shadow-coastal-1 transition-all flex flex-col justify-between space-y-3 active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0FA3A3]/10 text-brand-teal flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-sm font-bold text-primary-container">
                Pindai Tiket QR
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Validasi cepat boarding pass wisatawan
              </p>
            </div>
          </Link>

          <Link
            href="/petugas/tunai"
            className="p-4 rounded-2xl bg-white border border-[#D5CEBF]/40 shadow-sm hover:shadow-coastal-1 transition-all flex flex-col justify-between space-y-3 active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D94530]/10 text-brand-coral flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-sm font-bold text-primary-container">
                Catat Kas Tunai
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Kasir tiket langsung di loket dermaga
              </p>
            </div>
          </Link>

          <Link
            href="/petugas/sinkron"
            className="p-4 rounded-2xl bg-white border border-[#D5CEBF]/40 shadow-sm hover:shadow-coastal-1 transition-all flex flex-col justify-between space-y-3 active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-container/10 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">sync</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-sm font-bold text-primary-container">
                Sinkronisasi Antrean
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Kelola data offline & status koneksi
              </p>
            </div>
          </Link>

          <Link
            href="/petugas/manifest"
            className="p-4 rounded-2xl bg-white border border-[#D5CEBF]/40 shadow-sm hover:shadow-coastal-1 transition-all flex flex-col justify-between space-y-3 active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1E7B4F]/10 text-[#1E7B4F] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">directions_boat</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-sm font-bold text-primary-container">
                Manifes Penumpang
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Daftar keberangkatan kapal ke pulau
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
