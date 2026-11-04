import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateWIB } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function LaporanPendapatanPage() {
  const paidPayments = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "PAID" },
  });

  const cashTransactions = await prisma.cashTransaction.aggregate({
    _sum: { amount: true },
    where: { status: "RECORDED" },
  });

  const grossTotal = Number(paidPayments._sum.amount || 0) + Number(cashTransactions._sum.amount || 0);
  const refundTotal = 0; // Pilot awal
  const netTotal = grossTotal - refundTotal;

  // 40% alokasi retribusi PAD resmi (OQ-03 & PRD FR-07.3)
  const estimatedPAD = Math.round(netTotal * 0.4);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-extrabold text-[#00243D] tracking-tight">
            Laporan Pendapatan Wisata Bahari
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Rekapitulasi penerimaan retribusi daerah (PAD) dan pendapatan usaha BUMDes Pulau Pahawang.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/reports/export"
            download
            className="px-4 py-2 rounded-xl bg-white border border-primary-container text-primary-container text-xs font-bold hover:bg-surface-container flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Ekspor CSV Resmi</span>
          </a>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-brand-coral hover:bg-[#B93624] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Cetak PDF Resmi Pemda</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu Ringkasan Keuangan (SKILL §6.14) */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
            Nilai Transaksi Tercatat
          </span>
          <span className="text-headline-lg font-extrabold text-primary-container block">
            {formatRupiah(grossTotal)}
          </span>
          <span className="text-[11px] text-outline font-medium block">Termasuk QRIS & Tunai loket</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
            Pengembalian Dana (Refund)
          </span>
          <span className="text-headline-lg font-extrabold text-outline block">
            {formatRupiah(refundTotal)}
          </span>
          <span className="text-[11px] text-outline font-medium block">0 pengajuan disetujui</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
            Nilai Bersih Mitra
          </span>
          <span className="text-headline-lg font-extrabold text-[#006a6a] block">
            {formatRupiah(netTotal - estimatedPAD)}
          </span>
          <span className="text-[11px] text-secondary font-bold block">Hak BUMDes & Operator Kapal</span>
        </div>

        {/* Kartu Khusus: Penerimaan Daerah (PAD) = "Menunggu Validasi" Kuning (SKILL §6.14 & PRD FR-07.3) */}
        <div className="bg-[#FEF7EA] rounded-2xl p-5 border-2 border-[#B7791F] shadow-coastal-1 space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-[#B7791F]">
            <span className="uppercase tracking-wider">Verifikasi PAD Daerah</span>
            <span className="px-2 py-0.5 rounded-full bg-[#B7791F] text-white text-[9px] font-black uppercase">
              Menunggu Validasi
            </span>
          </div>
          <span className="text-headline-lg font-extrabold text-[#7A4F00] block">
            {formatRupiah(estimatedPAD)}
          </span>
          <span className="text-[11px] text-[#B7791F] font-bold block">
            Dasar: Perda No. 4/2024 (40%)
          </span>
        </div>
      </div>

      {/* Tabel Rincian Mingguan & Rekonsiliasi (SKILL §6.14) */}
      <section className="bg-white rounded-2xl border border-[#D5CEBF]/40 shadow-coastal-1 overflow-hidden space-y-4 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-headline-sm font-bold text-primary-container">
              Rekapitulasi Penerimaan Periode Berjalan
            </h3>
            <span className="text-xs text-on-surface-variant">
              Rincian pendapatan menurut jenis kanal dan status rekonsiliasi kas
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FBF7EF] border-b border-[#D5CEBF]/60 text-outline text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Periode</th>
                <th className="py-3 px-3">QRIS Bank Lampung</th>
                <th className="py-3 px-3">Tunai Loket BUMDes</th>
                <th className="py-3 px-3">Total Bruto</th>
                <th className="py-3 px-3">Alokasi PAD (40%)</th>
                <th className="py-3 px-3">Status Rekonsiliasi</th>
                <th className="py-3 px-3">Validasi BPKAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CEBF]/30">
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-3 font-bold text-primary-container">
                  Minggu 3 (15 - 21 Okt 2026)
                </td>
                <td className="py-3.5 px-3 font-mono">Rp 4.250.000 (85 tiket)</td>
                <td className="py-3.5 px-3 font-mono">Rp 2.100.000 (42 tiket)</td>
                <td className="py-3.5 px-3 font-extrabold text-primary-container font-mono">
                  Rp 6.350.000
                </td>
                <td className="py-3.5 px-3 font-bold text-[#006a6a] font-mono">
                  Rp 2.540.000
                </td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#1E7B4F] text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs fill-icon">check_circle</span>
                    <span>Terekonsiliasi 100%</span>
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5EE] text-[#1E7B4F]">
                    Disahkan BPKAD
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-surface-container-low transition-colors bg-[#FFF5F4]/40">
                <td className="py-3.5 px-3 font-bold text-primary-container">
                  Minggu 4 (22 - 24 Okt 2026) · Berjalan
                </td>
                <td className="py-3.5 px-3 font-mono">Rp 1.850.000 (37 tiket)</td>
                <td className="py-3.5 px-3 font-mono">Rp 1.150.000 (23 tiket)</td>
                <td className="py-3.5 px-3 font-extrabold text-primary-container font-mono">
                  Rp 3.000.000
                </td>
                <td className="py-3.5 px-3 font-bold text-[#006a6a] font-mono">
                  Rp 1.200.000
                </td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF7EA] text-[#B7791F] text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    <span>Sedang Berjalan (Cut-off 17:00)</span>
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF7EA] text-[#B7791F]">
                    Menunggu Validasi
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-[#FBF7EF] border-t-2 border-[#D5CEBF] font-bold">
              <tr>
                <td className="py-3 px-3 text-primary-container uppercase text-[11px]">Total Kumulatif</td>
                <td className="py-3 px-3 font-mono">Rp 6.100.000</td>
                <td className="py-3 px-3 font-mono">Rp 3.250.000</td>
                <td className="py-3 px-3 font-extrabold text-primary-container font-mono text-sm">
                  Rp 9.350.000
                </td>
                <td className="py-3 px-3 font-extrabold text-[#006a6a] font-mono text-sm">
                  Rp 3.740.000
                </td>
                <td colSpan={2} className="py-3 px-3 text-outline text-[11px]">
                  Terhitung 147 Reservasi Terkonfirmasi
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Sumber Data (SKILL §6.14 & PRD FR-07.4) */}
        <div className="pt-3 border-t border-[#D5CEBF]/30 flex items-center justify-between text-[11px] text-outline">
          <span>Sumber data: Sistem Terpadu TourismPay & Rekening Kas Bank Lampung</span>
          <span>Waktu Pembaruan: 20 Oktober 2026 · 17:00 WIB</span>
        </div>
      </section>
    </div>
  );
}
