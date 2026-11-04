import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateWIB } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function KatalogTarifPage() {
  const today = new Date().toISOString().split("T")[0];

  const services = await prisma.service.findMany({
    include: {
      provider: true,
      servicePrices: {
        orderBy: { validFrom: "desc" },
      },
      availabilitySlots: {
        where: { serviceDate: today },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-extrabold text-[#00243D] tracking-tight">
            Katalog Layanan & Riwayat Tarif
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Pengelolaan tarif resmi, kapasitas kuota harian, dan jejak audit perubahan harga (FR-01).
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-brand-coral hover:bg-[#B93624] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Tambah Layanan Wisata</span>
        </button>
      </div>

      {/* Daftar Layanan & Riwayat Harga */}
      <div className="space-y-4">
        {services.map((service) => {
          const activePrice = service.servicePrices[0];
          const priceVal = activePrice ? Number(activePrice.price) : 0;
          const slot = service.availabilitySlots[0];
          const capacity = slot?.capacity ?? 200;
          const reserved = slot?.reservedCount ?? 0;
          const remaining = Math.max(0, capacity - reserved);

          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-secondary-container/60 text-secondary">
                      {service.serviceType.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      Penyedia: {service.provider.name}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-lg font-bold text-primary-container">
                    {service.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-2xl">
                    {service.description}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-outline uppercase font-bold block">Tarif Aktif</span>
                  <span className="text-headline-md font-extrabold text-primary-container">
                    {formatRupiah(priceVal)}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    / {activePrice?.unit.toLowerCase() || "orang"}
                  </span>
                </div>
              </div>

              {/* Kuota & Status Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-[#FBF7EF] border border-[#D5CEBF]/40 text-xs">
                <div>
                  <span className="text-[10px] text-outline uppercase font-bold block">
                    Kapasitas Hari Ini
                  </span>
                  <span className="font-bold text-primary-container">{capacity} Kuota</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase font-bold block">
                    Tiket Terpesan
                  </span>
                  <span className="font-bold text-[#1E7B4F]">{reserved} Tiket</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase font-bold block">
                    Sisa Tersedia
                  </span>
                  <span className="font-bold text-brand-teal">{remaining} Kuota</span>
                </div>
              </div>

              {/* Riwayat Tarif Audit Trail (PRD FR-01.4) */}
              <div className="pt-2 border-t border-[#D5CEBF]/30 space-y-2">
                <span className="text-[11px] font-bold text-primary-container block uppercase tracking-wider">
                  Riwayat Perubahan Harga (Audit Trail FR-01.4)
                </span>
                <div className="space-y-1.5">
                  {service.servicePrices.map((sp, idx) => (
                    <div
                      key={sp.id}
                      className="flex items-center justify-between text-xs text-on-surface-variant py-1 px-2.5 rounded-lg bg-surface-container-low"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary-container">
                          {formatRupiah(Number(sp.price))} / {sp.unit.toLowerCase()}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.2 rounded bg-[#E8F5EE] text-[#1E7B4F] text-[10px] font-bold">
                            Berlaku Saat Ini
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-outline">
                        Berlaku sejak: {formatDateWIB(sp.validFrom)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
