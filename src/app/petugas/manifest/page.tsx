import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateWIB, maskPhoneNumber } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function ManifestPenumpangPage() {
  const today = new Date().toISOString().split("T")[0];

  const tickets = await prisma.ticket.findMany({
    where: {
      validDate: today,
    },
    include: {
      reservation: {
        include: {
          reservationItems: {
            include: { service: true },
          },
        },
      },
      ticketScans: {
        orderBy: { scannedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPassengers = tickets.reduce((acc, t) => acc + t.passengerCount, 0);
  const boardedCount = tickets
    .filter((t) => t.status === "USED")
    .reduce((acc, t) => acc + t.passengerCount, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-sm text-primary-container text-[17px] font-bold">
            Manifes Penumpang Kapal
          </h2>
          <span className="text-xs text-on-surface-variant font-medium">
            Rute: Dermaga Ketapang ➔ Pulau Pahawang
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E8F5EE] text-[#1E7B4F]">
          Hari Ini
        </span>
      </div>

      {/* Rangkuman Kapasitas Kapal */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-[#D5CEBF]/40 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
            Total Terdaftar
          </span>
          <span className="text-headline-lg font-extrabold text-primary-container">
            {totalPassengers}
          </span>
          <span className="text-[11px] text-outline block">Orang / Jiwa</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-[#D5CEBF]/40 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#1E7B4F] block">
            Sudah Naik Kapal
          </span>
          <span className="text-headline-lg font-extrabold text-[#1E7B4F]">
            {boardedCount}
          </span>
          <span className="text-[11px] text-outline block">
            {totalPassengers > 0 ? Math.round((boardedCount / totalPassengers) * 100) : 0}% Terverifikasi
          </span>
        </div>
      </div>

      {/* Daftar Rombongan & Tiket */}
      <section className="space-y-3">
        <h3 className="text-label-md text-primary-container font-bold">
          Daftar Rombongan Penumpang
        </h3>

        <div className="space-y-2.5">
          {tickets.map((t, idx) => {
            const isBoarded = t.status === "USED";
            const firstItem = t.reservation.reservationItems[0];

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-headline-sm text-sm font-bold text-primary-container">
                      {t.reservation.customerName}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isBoarded
                        ? "bg-[#E8F5EE] text-[#1E7B4F]"
                        : "bg-[#FEF7EA] text-[#B7791F]"
                    }`}
                  >
                    {isBoarded ? "SUDAH NAIK" : "MENUNGGU DERMAGA"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant bg-[#FBF7EF] p-2.5 rounded-xl border border-[#D5CEBF]/40">
                  <div>
                    <span className="text-[10px] text-outline uppercase font-bold block">
                      Rombongan
                    </span>
                    <span className="font-bold text-primary-container">
                      {t.passengerCount} Orang
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-outline uppercase font-bold block">
                      Kontak
                    </span>
                    <span className="font-mono text-primary-container">
                      {maskPhoneNumber(t.reservation.customerPhone)}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] text-outline uppercase font-bold block">
                      Layanan
                    </span>
                    <span className="text-primary-container font-medium">
                      {firstItem?.service?.name || "Wisata Bahari Pulau Pahawang"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                  <span className="font-mono">Tiket: {t.ticketCode}</span>
                  <span className="text-[#1E7B4F] font-bold">Asuransi Terdaftar</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
