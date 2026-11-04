"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TouristHeader } from "@/components/TouristHeader";
import { FieldWarningBanner } from "@/components/FieldWarningBanner";
import { formatRupiah } from "@/lib/formatters";

interface ServiceData {
  id: string;
  name: string;
  serviceType: string;
  description: string;
  price: number;
  unit: string;
  provider: { name: string };
  capacity: number;
  remainingQuota: number;
  isSoldOut: boolean;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.serviceId as string;

  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("Rina Wijaya");
  const [customerPhone, setCustomerPhone] = useState("081234563310");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate 4 quick date options (Hari ini, Besok, +2, +3)
  const dateOptions = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split("T")[0];
    const label =
      offset === 0
        ? "Hari Ini"
        : offset === 1
        ? "Besok"
        : new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" }).format(d);
    return { dateStr, label };
  });

  useEffect(() => {
    async function loadService() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/services?date=${selectedDate}`);
        const data = await res.json();
        if (data.success) {
          const found = data.data.find((s: ServiceData) => s.id === serviceId);
          if (found) {
            setService(found);
          } else {
            setError("Layanan tidak ditemukan");
          }
        } else {
          setError(data.message || "Gagal memuat layanan");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan koneksi");
      } finally {
        setLoading(false);
      }
    }

    if (serviceId) {
      loadService();
    }
  }, [serviceId, selectedDate]);

  const unitPrice = service?.price || 0;
  const totalPrice = unitPrice * quantity;
  const remaining = service?.remainingQuota ?? 100;
  const isAvailable = remaining >= quantity;

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < 10 && quantity < remaining) {
      setQuantity(quantity + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Harap lengkapi nama dan nomor WhatsApp/telepon.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          serviceDate: selectedDate,
          quantity,
          customerName,
          customerPhone,
        }),
      });

      const json = await res.json();
      if (json.success) {
        router.push(`/bayar/${json.data.reservationCode}`);
      } else {
        alert(json.message || "Gagal membuat reservasi.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FBF7EF] flex justify-center">
        <main className="w-full max-w-[420px] min-h-screen bg-[#FBF7EF] flex flex-col p-4 space-y-4">
          <TouristHeader title="Beli Tiket" showBack />
          <div className="p-8 text-center text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-4xl animate-spin text-brand-teal">sync</span>
            <p className="text-body-sm font-medium">Memuat informasi layanan dan kuota...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="w-full min-h-screen bg-[#FBF7EF] flex justify-center">
        <main className="w-full max-w-[420px] min-h-screen bg-[#FBF7EF] flex flex-col p-4 space-y-4">
          <TouristHeader title="Beli Tiket" showBack />
          <div className="p-6 bg-white rounded-2xl text-center space-y-3 border border-[#D5CEBF]/40">
            <span className="material-symbols-outlined text-4xl text-brand-coral">error</span>
            <p className="text-headline-sm font-bold text-primary-container">Layanan Tidak Ditemukan</p>
            <p className="text-body-sm text-on-surface-variant">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-xl bg-primary-container text-white text-label-md font-bold"
            >
              Kembali ke Beranda
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FBF7EF] flex justify-center">
      <main className="w-full max-w-[420px] min-h-screen bg-[#FBF7EF] relative flex flex-col pb-36 shadow-coastal-1">
        {/* Top App Bar */}
        <TouristHeader title="Beli Tiket" showBack rightBadge="Resmi" />

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <FieldWarningBanner />

          {/* Kartu Layanan Terpilih (SKILL §6.6) */}
          <section className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5EE] text-[#1E7B4F]">
                Termasuk Asuransi Resmi
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {service.provider.name}
              </span>
            </div>

            <h2 className="font-headline-sm text-primary-container text-[17px] font-bold leading-tight">
              {service.name}
            </h2>

            <p className="text-body-sm text-on-surface-variant text-[13px]">
              {service.description}
            </p>

            <div className="pt-2 border-t border-[#D5CEBF]/30 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">Tarif Resmi</span>
              <span className="text-headline-sm font-extrabold text-[#006a6a]">
                {formatRupiah(unitPrice)} <span className="text-xs font-normal">/ {service.unit.toLowerCase()}</span>
              </span>
            </div>
          </section>

          {/* Pemilih Tanggal Kunjungan (SKILL §6.6) */}
          <section className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-label-md text-primary-container font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#0FA3A3]">calendar_today</span>
                <span>Pilih Tanggal Kunjungan</span>
              </label>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  remaining > 30 ? "bg-[#E8F5EE] text-[#1E7B4F]" : "bg-[#FEF7EA] text-[#B7791F]"
                }`}
              >
                <span className="material-symbols-outlined text-xs fill-icon">check_circle</span>
                <span>Sisa {remaining} kuota</span>
              </span>
            </div>

            {/* Chip Cepat 4 Kolom */}
            <div className="grid grid-cols-4 gap-2">
              {dateOptions.map((opt) => {
                const isActive = selectedDate === opt.dateStr;
                return (
                  <button
                    type="button"
                    key={opt.dateStr}
                    onClick={() => setSelectedDate(opt.dateStr)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? "bg-primary-container text-white border-primary-container shadow-sm"
                        : "bg-surface-container-low text-primary-container border-transparent hover:bg-surface-container"
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-[#D5CEBF] bg-[#FBF7EF] text-primary-container font-medium"
            />
          </section>

          {/* Stepper Jumlah Pengunjung (SKILL §6.6 & §11) */}
          <section className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-label-md text-primary-container font-bold block">
                  Jumlah Pengunjung
                </label>
                <span className="text-[12px] text-on-surface-variant font-medium">
                  Maksimal 10 tiket per transaksi
                </span>
              </div>

              {/* Stepper besar */}
              <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/30">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  aria-label="Kurangi Pengunjung"
                  className="w-11 h-11 rounded-xl bg-white text-primary-container shadow-sm flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>

                <span className="w-9 text-center font-headline-sm text-primary-container font-extrabold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= 10 || quantity >= remaining}
                  aria-label="Tambah Pengunjung"
                  className="w-11 h-11 rounded-xl bg-primary-container text-white shadow-sm flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>
          </section>

          {/* Data Pemesan */}
          <section className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-3">
            <h3 className="text-label-md text-primary-container font-bold">
              Informasi Kontak Pemesan
            </h3>

            <div className="space-y-2">
              <div>
                <label className="text-xs text-on-surface-variant font-medium block mb-1">
                  Nama Lengkap Pemesan
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Rina Wijaya"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5CEBF] focus:outline-none focus:ring-2 focus:ring-[#0FA3A3] bg-[#FBF7EF]"
                />
              </div>

              <div>
                <label className="text-xs text-on-surface-variant font-medium block mb-1">
                  Nomor WhatsApp / Ponsel
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234563310"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#D5CEBF] focus:outline-none focus:ring-2 focus:ring-[#0FA3A3] bg-[#FBF7EF]"
                />
                <span className="text-[11px] text-on-surface-variant block mt-1">
                  Nomor akan disamarkan pada tampilan publik sesuai ketentuan privasi.
                </span>
              </div>
            </div>
          </section>

          {/* Rincian Harga Transparan (PRD FR-02.6 & SKILL §6.6) */}
          <section className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-2">
            <h3 className="text-label-md text-primary-container font-bold">
              Rincian Pembayaran
            </h3>

            <div className="space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>
                  {quantity} × {formatRupiah(unitPrice)}
                </span>
                <span className="font-semibold text-primary-container">{formatRupiah(totalPrice)}</span>
              </div>

              <div className="flex justify-between items-center text-[#1E7B4F]">
                <span>Biaya Layanan & Asuransi Resmi</span>
                <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-[#E8F5EE]">
                  Rp 0 (Termasuk)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D5CEBF]/40 flex justify-between items-center">
              <span className="text-sm font-bold text-primary-container">Total Tagihan</span>
              <span className="text-headline-xl-mobile font-extrabold text-[#0B3A5B]">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </section>

          <p className="text-[11px] text-center text-on-surface-variant">
            Pembatalan dapat diajukan maksimal H-1 sebelum keberangkatan sesuai ketentuan pilot.
          </p>

          {/* Sticky CTA Bar Lengket Bawah (SKILL §5.1 & §6.6) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D5CEBF]/40 p-4 shadow-bottom-bar flex justify-center pb-safe">
            <div className="w-full max-w-[420px] flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-on-surface-variant block uppercase font-bold tracking-wider">
                  Total Bayar
                </span>
                <span className="text-headline-sm font-extrabold text-primary-container">
                  {formatRupiah(totalPrice)}
                </span>
              </div>

              <button
                type="submit"
                disabled={!isAvailable || isSubmitting}
                className="flex-1 min-h-[50px] bg-brand-coral hover:bg-[#B93624] disabled:bg-surface-container-highest disabled:text-outline active:scale-[0.99] text-white font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                    <span>Memproses...</span>
                  </>
                ) : !isAvailable ? (
                  <span>Kuota Habis</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                    <span>Lanjut Bayar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
