import Link from "next/link";
import { TouristHeader } from "@/components/TouristHeader";
import { TouristNavigation } from "@/components/TouristNavigation";
import { FieldWarningBanner } from "@/components/FieldWarningBanner";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date().toISOString().split("T")[0];

  const services = await prisma.service.findMany({
    where: { status: "ACTIVE" },
    include: {
      provider: true,
      servicePrices: {
        orderBy: { validFrom: "desc" },
        take: 1,
      },
      availabilitySlots: {
        where: { serviceDate: today },
        take: 1,
      },
    },
  });

  return (
    <div className="w-full min-h-screen bg-[#FBF7EF] flex justify-center">
      <main className="w-full max-w-[420px] min-h-screen bg-[#FBF7EF] relative flex flex-col pb-32 shadow-coastal-1">
        {/* Top App Bar */}
        <TouristHeader />

        <div className="p-4 space-y-4">
          {/* Peringatan Lapangan Sinyal Laut (SKILL §6.5 & §8) */}
          <FieldWarningBanner />

          {/* Hero Banner Wisata Bahari Resmi (SKILL §6.3) */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B3A5B] to-[#00243D] text-white shadow-coastal-2 p-5">
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#0FA3A3]/20 blur-xl"></div>
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-secondary-fixed">
                <span className="material-symbols-outlined text-sm fill-icon text-[#7ff5f4]">verified</span>
                <span>Wisata Bahari Resmi Pahawang</span>
              </div>

              <div>
                <h2 className="text-headline-lg-mobile font-bold tracking-tight leading-tight">
                  Eksplorasi Keindahan Bawah Laut Pahawang
                </h2>
                <p className="text-body-sm text-white/80 mt-1">
                  Reservasi tiket terpadu, asuransi resmi, dan penyeberangan aman dari Dermaga Ketapang.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-white/60 block">Mulai dari</span>
                  <span className="text-headline-sm font-extrabold text-[#7ff5f4]">
                    Rp 25.000 <span className="text-xs font-normal text-white/80">/ orang</span>
                  </span>
                </div>

                <Link
                  href="/pesan/srv-tiket-masuk"
                  className="px-4 py-2.5 rounded-xl bg-brand-coral hover:bg-[#B93624] active:scale-95 text-white text-label-md font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-lg">local_activity</span>
                  <span>Beli Tiket</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Akses Cepat Tiket Aktif & Simulasi (PRD FR-02 & FR-04) */}
          <section className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-teal text-[20px] fill-icon">
                  offline_pin
                </span>
                <h3 className="font-headline-sm text-primary-container text-[16px] font-bold">
                  Tiket Terakhir Anda
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5EE] text-[#1E7B4F]">
                Siap Dipakai
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FBF7EF] border border-[#D5CEBF]/40 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary-container block">
                  PHW-20261024-0042
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  2 Pengunjung · Dermaga Ketapang
                </span>
              </div>
              <Link
                href="/tiket/TKT-PHW-20261024-0042"
                className="px-3 py-1.5 rounded-lg bg-primary-container text-white text-xs font-bold hover:bg-primary transition-colors flex items-center gap-1"
              >
                <span>Buka QR</span>
                <span className="material-symbols-outlined text-sm">qr_code_2</span>
              </Link>
            </div>
          </section>

          {/* Daftar Layanan & Tarif Wisata (PRD FR-01) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-primary-container text-[17px] font-bold">
                Katalog Layanan & Penyeberangan
              </h3>
              <span className="text-xs text-[#0FA3A3] font-bold">Hari Ini · Aktif</span>
            </div>

            <div className="space-y-3">
              {services.map((service) => {
                const price = Number(service.servicePrices[0]?.price || 0);
                const unit = service.servicePrices[0]?.unit || "ORANG";
                const slot = service.availabilitySlots[0];
                const capacity = slot?.capacity ?? 100;
                const reserved = slot?.reservedCount ?? 0;
                const remaining = Math.max(0, capacity - reserved);
                const isSoldOut = remaining <= 0;

                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm hover:shadow-coastal-1 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container/60 text-secondary">
                            {service.serviceType.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {service.provider.name}
                          </span>
                        </div>
                        <h4 className="font-headline-sm text-primary-container text-[16px] font-bold leading-snug">
                          {service.name}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-headline-sm font-extrabold text-primary-container block">
                          {formatRupiah(price)}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          / {unit.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-body-sm text-on-surface-variant text-[13px] line-clamp-2">
                      {service.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-[#D5CEBF]/30">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSoldOut ? "bg-brand-coral" : remaining < 30 ? "bg-[#B7791F]" : "bg-[#1E7B4F]"
                          }`}
                        ></span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          {isSoldOut ? "Tiket Habis" : `Sisa ${remaining} kuota hari ini`}
                        </span>
                      </div>

                      {isSoldOut ? (
                        <button
                          disabled
                          className="px-3.5 py-1.5 rounded-xl bg-surface-container-highest text-outline text-label-md font-bold cursor-not-allowed text-xs"
                        >
                          Kuota Habis
                        </button>
                      ) : (
                        <Link
                          href={`/pesan/${service.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-brand-coral hover:bg-[#B93624] text-white text-label-md font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1"
                        >
                          <span>Pesan Tiket</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Bottom Navigation */}
        <TouristNavigation />
      </main>
    </div>
  );
}
