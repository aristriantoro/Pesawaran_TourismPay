import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTimeWIB } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Aggregate KPI data
  const totalPaidSum = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "PAID" },
  });

  const totalCashSum = await prisma.cashTransaction.aggregate({
    _sum: { amount: true },
    where: { status: "RECORDED" },
  });

  const grossRecorded = Number(totalPaidSum._sum.amount || 0) + Number(totalCashSum._sum.amount || 0);

  const totalTickets = await prisma.ticket.count();
  const usedTickets = await prisma.ticket.count({ where: { status: "USED" } });
  const validationRate = totalTickets > 0 ? Math.round((usedTickets / totalTickets) * 100) : 0;

  const totalVisitorsAggregate = await prisma.ticket.aggregate({
    _sum: { passengerCount: true },
  });
  const totalVisitors = totalVisitorsAggregate._sum.passengerCount || 0;

  // Items needing review (SIAGA)
  const conflictCount = await prisma.syncQueue.count({
    where: { syncStatus: "CONFLICT" },
  });
  const reconDiscrepancies = await prisma.reconciliation.count({
    where: { status: "DISCREPANCY" },
  });
  const totalIssuesNeedingReview = conflictCount + reconDiscrepancies;

  // Recent transactions
  const recentReservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      payments: { take: 1, orderBy: { createdAt: "desc" } },
      reservationItems: { include: { service: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Title & Filter Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-extrabold text-[#00243D] tracking-tight">
            Dashboard Transparansi Wisata Bahari
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Pantauan reservasi, transaksi QRIS, kasir loket, dan kepatuhan penerimaan daerah (PAD) Pulau Pahawang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">Periode:</span>
          <select className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#D5CEBF] bg-white text-primary-container shadow-sm">
            <option>Hari Ini (24 Okt 2026)</option>
            <option>Minggu Ini</option>
            <option>Bulan Oktober 2026</option>
          </select>
        </div>
      </div>

      {/* Banner Kepatuhan Resmi (SKILL §6.12 & PRD FR-06.7) */}
      <section className="rounded-2xl p-4 bg-[#FEF7EA] border border-[#B7791F]/30 shadow-sm flex items-start gap-3 text-xs text-[#400200]">
        <span className="material-symbols-outlined text-[#B7791F] text-xl fill-icon mt-0.5 shrink-0">
          gavel
        </span>
        <p className="leading-relaxed">
          <strong>Perhatian Kepatuhan Keuangan:</strong> Seluruh angka yang ditampilkan merupakan nilai transaksi tercatat sistem. Nilai tersebut{" "}
          <strong className="text-brand-coral font-bold">belum diverifikasi sebagai penerimaan daerah resmi (PAD)</strong> sebelum proses rekonsiliasi harian dan validasi BPKAD (Cut-off 17:00 WIB).
        </p>
      </section>

      {/* 4 Kartu KPI Desktop (SKILL §6.12) */}
      <div className="grid grid-cols-4 gap-5">
        {/* KPI 1: Nilai Transaksi */}
        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-2">
          <div className="flex justify-between items-center text-xs text-on-surface-variant">
            <span className="font-bold uppercase tracking-wider">Nilai Transaksi Tercatat</span>
            <span className="material-symbols-outlined text-brand-teal text-xl">payments</span>
          </div>
          <div className="text-headline-lg font-extrabold text-primary-container">
            {formatRupiah(grossRecorded)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#1E7B4F] font-bold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+14.2% dibanding kemarin</span>
          </div>
        </div>

        {/* KPI 2: Total Pengunjung */}
        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-2">
          <div className="flex justify-between items-center text-xs text-on-surface-variant">
            <span className="font-bold uppercase tracking-wider">Total Pengunjung</span>
            <span className="material-symbols-outlined text-secondary text-xl">group</span>
          </div>
          <div className="text-headline-lg font-extrabold text-primary-container">
            {totalVisitors} <span className="text-sm font-normal text-on-surface-variant">Jiwa</span>
          </div>
          <span className="text-[11px] text-outline font-medium block">
            Kapasitas terisi 38%
          </span>
        </div>

        {/* KPI 3: Tiket Terpakai */}
        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-2">
          <div className="flex justify-between items-center text-xs text-on-surface-variant">
            <span className="font-bold uppercase tracking-wider">Tiket Terpakai</span>
            <span className="material-symbols-outlined text-[#1E7B4F] text-xl">verified</span>
          </div>
          <div className="text-headline-lg font-extrabold text-[#1E7B4F]">
            {validationRate}% <span className="text-xs font-normal text-on-surface-variant">({usedTickets}/{totalTickets} tiket)</span>
          </div>
          <span className="text-[11px] text-outline font-medium block">
            Divalidasi di Dermaga Ketapang
          </span>
        </div>

        {/* KPI 4: KARTU SIAGA - Perlu Ditinjau (SKILL §6.12) */}
        <div className="bg-[#FCECE9] rounded-2xl p-5 border-2 border-brand-coral shadow-coastal-1 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold text-brand-coral">
            <span className="uppercase tracking-wider">Perlu Ditinjau</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-coral text-white text-[10px] font-black">
              SIAGA
            </span>
          </div>
          <div className="text-headline-lg font-extrabold text-brand-coral">
            {totalIssuesNeedingReview} <span className="text-sm font-bold">Kasus</span>
          </div>
          <Link
            href="/admin/transaksi"
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-coral hover:underline"
          >
            <span>Tinjau Selisih & Konflik Sekarang</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Grid 8:4 Grafik Tren & Donut Metode Pembayaran (SKILL §5.2 & §6.12) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Grafik Tren 8 Kolom */}
        <div className="col-span-8 bg-white rounded-2xl p-6 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-headline-sm font-bold text-primary-container">
                Tren Transaksi Harian (Oktober 2026)
              </h3>
              <span className="text-xs text-on-surface-variant">
                Grafik volume reservasi dan arus kedatangan wisatawan ke Pahawang
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-brand-teal">
                <span className="w-3 h-3 rounded-full bg-brand-teal"></span>
                <span>Hari Kerja</span>
              </span>
              <span className="flex items-center gap-1 text-brand-coral">
                <span className="w-3 h-3 rounded-full bg-brand-coral"></span>
                <span>Puncak Akhir Pekan</span>
              </span>
            </div>
          </div>

          {/* SVG Grafik Kurva Halus (SKILL §6.12) */}
          <div className="relative h-64 w-full pt-4">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0FA3A3" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0FA3A3" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="40" x2="680" y2="40" stroke="#E6E2DA" strokeDasharray="3 3" />
              <line x1="50" y1="90" x2="680" y2="90" stroke="#E6E2DA" strokeDasharray="3 3" />
              <line x1="50" y1="140" x2="680" y2="140" stroke="#E6E2DA" strokeDasharray="3 3" />

              {/* Area Gradient */}
              <path
                d="M 50 160 C 130 150, 180 120, 240 130 C 310 140, 360 80, 420 85 C 480 90, 520 30, 580 35 C 620 40, 650 120, 680 150 L 680 180 L 50 180 Z"
                fill="url(#areaGradient)"
              />

              {/* Smooth Curve Line */}
              <path
                d="M 50 160 C 130 150, 180 120, 240 130 C 310 140, 360 80, 420 85 C 480 90, 520 30, 580 35 C 620 40, 650 120, 680 150"
                fill="none"
                stroke="#0FA3A3"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Normal Points */}
              <circle cx="50" cy="160" r="4.5" fill="#FFFFFF" stroke="#0FA3A3" strokeWidth="2.5" />
              <circle cx="240" cy="130" r="4.5" fill="#FFFFFF" stroke="#0FA3A3" strokeWidth="2.5" />
              <circle cx="420" cy="85" r="4.5" fill="#FFFFFF" stroke="#0FA3A3" strokeWidth="2.5" />
              <circle cx="680" cy="150" r="4.5" fill="#FFFFFF" stroke="#0FA3A3" strokeWidth="2.5" />

              {/* Puncak Akhir Pekan (TITIK KORAL + LABEL SKILL §6.12) */}
              <circle cx="580" cy="35" r="6" fill="#D94530" stroke="#FFFFFF" strokeWidth="2.5" />
              <text x="580" y="22" fill="#D94530" fontSize="11" fontWeight="800" textAnchor="middle">
                Sabtu (Puncak)
              </text>

              {/* Axis Labels */}
              <text x="50" y="196" fill="#72777E" fontSize="10" textAnchor="middle">Sen</text>
              <text x="150" y="196" fill="#72777E" fontSize="10" textAnchor="middle">Sel</text>
              <text x="250" y="196" fill="#72777E" fontSize="10" textAnchor="middle">Rab</text>
              <text x="350" y="196" fill="#72777E" fontSize="10" textAnchor="middle">Kam</text>
              <text x="450" y="196" fill="#72777E" fontSize="10" textAnchor="middle">Jum</text>
              <text x="580" y="196" fill="#D94530" fontWeight="bold" fontSize="11" textAnchor="middle">Sab (Puncak)</text>
              <text x="680" y="196" fill="#72777E" fontSize="10" textAnchor="middle">Min</text>
            </svg>
          </div>
        </div>

        {/* Donut Chart Metode Pembayaran 4 Kolom (SKILL §6.12) */}
        <div className="col-span-4 bg-white rounded-2xl p-6 border border-[#D5CEBF]/40 shadow-coastal-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-headline-sm font-bold text-primary-container">
              Metode Pembayaran
            </h3>
            <span className="text-xs text-on-surface-variant">
              Rasio adopsi digital QRIS vs Tunai Loket
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1EDE6" strokeWidth="4" />
                {/* Tunai Segment 38% Navy */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#0B3A5B"
                  strokeWidth="4"
                  strokeDasharray="38 62"
                  strokeDashoffset="0"
                />
                {/* QRIS Segment 62% Teal */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#0FA3A3"
                  strokeWidth="4"
                  strokeDasharray="62 38"
                  strokeDashoffset="-38"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-headline-md font-extrabold text-primary-container">62%</span>
                <span className="text-[10px] text-brand-teal font-bold uppercase">QRIS Digital</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#D5CEBF]/30 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-brand-teal"></span>
                <span className="font-semibold text-primary-container">QRIS Nasional (Bank Lampung)</span>
              </div>
              <span className="font-mono font-bold text-primary-container">62%</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-primary-container"></span>
                <span className="font-semibold text-primary-container">Tunai di Loket (BUMDes)</span>
              </div>
              <span className="font-mono font-bold text-primary-container">38%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Aktivitas Transaksi Terkini */}
      <section className="bg-white rounded-2xl p-6 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-headline-sm font-bold text-primary-container">
              Aktivitas Reservasi & Tiket Terbaru
            </h3>
            <span className="text-xs text-on-surface-variant">
              Log transaksi masuk secara real-time dari wisatawan dan loket dermaga
            </span>
          </div>

          <Link
            href="/admin/transaksi"
            className="text-xs font-bold text-[#0FA3A3] hover:underline flex items-center gap-1"
          >
            <span>Buka Jurnal Rekonsiliasi Penuh</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D5CEBF]/60 text-outline text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Kode Booking</th>
                <th className="py-3 px-3">Pemesan</th>
                <th className="py-3 px-3">Layanan</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Metode</th>
                <th className="py-3 px-3">Nominal</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CEBF]/30">
              {recentReservations.map((r) => {
                const pay = r.payments[0];
                const item = r.reservationItems[0];
                const isPaid = r.status === "CONFIRMED";

                return (
                  <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-brand-teal">
                      {r.reservationCode}
                    </td>
                    <td className="py-3 px-3 font-semibold text-primary-container">
                      {r.customerName}
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">
                      {item?.service?.name || "Wisata Bahari Pulau Pahawang"}
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">{r.serviceDate}</td>
                    <td className="py-3 px-3 font-bold text-primary-container">
                      {pay?.method || "QRIS"}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-primary-container">
                      {formatRupiah(r.totalAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid
                            ? "bg-[#E8F5EE] text-[#1E7B4F]"
                            : r.status === "PENDING_PAYMENT"
                            ? "bg-[#FEF7EA] text-[#B7791F]"
                            : "bg-[#FCECE9] text-brand-coral"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/admin/transaksi"
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary-container text-xs font-bold"
                      >
                        Tinjau
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
