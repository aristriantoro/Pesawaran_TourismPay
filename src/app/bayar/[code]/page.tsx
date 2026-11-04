"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TouristHeader } from "@/components/TouristHeader";
import { formatRupiah } from "@/lib/formatters";
import QRCode from "qrcode";

interface ReservationDetail {
  reservationCode: string;
  customerName: string;
  customerPhone: string;
  serviceDate: string;
  totalAmount: number;
  status: string;
  expiresAt: string;
  serviceName: string;
  quantity: number;
  payment: {
    id: string;
    status: string;
    providerReference: string;
  } | null;
  tickets: Array<{
    ticketCode: string;
    ticketTokenHash: string;
  }>;
}

export default function PaymentQrisPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  const [data, setData] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins
  const [actionLoading, setActionLoading] = useState(false);

  // Load reservation data
  const loadData = async () => {
    try {
      const res = await fetch(`/api/reservations/${code}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);

        // Generate QR code image
        const qrContent = `00020101021226600014ID.LINKAJA.WWW011893600998${json.data.reservationCode}520458125303360540${json.data.totalAmount}5802ID5914PESAWARAN_TOUR6007LAMPUNG6304`;
        const url = await QRCode.toDataURL(qrContent, {
          color: {
            dark: "#0B3A5B",
            light: "#FFFFFF",
          },
          margin: 2,
          width: 240,
        });
        setQrDataUrl(url);

        // Calculate remaining seconds
        const expires = new Date(json.data.expiresAt).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((expires - now) / 1000));
        setTimeLeft(diff);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      loadData();
    }
  }, [code]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const copyCode = () => {
    if (data?.reservationCode) {
      navigator.clipboard.writeText(data.reservationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Simulation handler for Webhook
  const handleSimulateWebhook = async (targetStatus: "PAID" | "FAILED" | "PAYMENT_UNKNOWN") => {
    if (!data) return;
    setActionLoading(true);
    try {
      const providerRef = `QRIS-SIM-${data.reservationCode}`;
      const res = await fetch("/api/payments/qris/simulate-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerReference: providerRef,
          targetStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (targetStatus === "PAID" && json.data?.ticketCode) {
          router.push(`/tiket/${json.data.ticketCode}`);
        } else {
          await loadData();
        }
      } else {
        alert(json.message);
        await loadData();
      }
    } catch (e: any) {
      alert("Gagal memproses simulasi: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="w-full min-h-screen bg-[#FBF7EF] flex justify-center">
        <main className="w-full max-w-[420px] min-h-screen bg-[#FBF7EF] flex flex-col p-4 space-y-4">
          <TouristHeader title="Pembayaran QRIS" showBack />
          <div className="p-8 text-center text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-4xl animate-spin text-brand-teal">sync</span>
            <p className="text-body-sm font-medium">Memuat instruksi QRIS...</p>
          </div>
        </main>
      </div>
    );
  }

  const isPaid = data.status === "CONFIRMED" || data.payment?.status === "PAID";
  const isUnknown = data.payment?.status === "PAYMENT_UNKNOWN";
  const isExpired = data.status === "EXPIRED" || timeLeft <= 0;

  return (
    <div className="w-full min-h-screen bg-[#FBF7EF] flex justify-center">
      <main className="w-full max-w-[420px] min-h-screen bg-[#FBF7EF] relative flex flex-col pb-36 shadow-coastal-1">
        {/* Header */}
        <TouristHeader title="Pembayaran QRIS" showBack rightBadge="Mode Simulasi" />

        <div className="p-4 space-y-4">
          {/* STATE 4: PAYMENT_UNKNOWN Warning Banner (SKILL §6.7 & PRD FR-03.7) */}
          {isUnknown && (
            <div className="rounded-2xl p-4 bg-[#FEF7EA] border-2 border-[#B7791F] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#B7791F]">
                <span className="material-symbols-outlined fill-icon text-xl">priority_high</span>
                <span className="font-headline-sm text-sm font-bold">Status Pembayaran Belum Pasti</span>
              </div>
              <p className="text-body-sm text-[#400200] text-[13px] font-semibold">
                ⚠️ Jangan bayar ulang! Sistem sedang memverifikasi respons dari gateway Bank Lampung.
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={loadData}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#B7791F] text-xs font-bold text-[#B7791F] hover:bg-[#FEF7EA]"
                >
                  Muat Ulang Status
                </button>
                <a
                  href="tel:081278901234"
                  className="px-3 py-1.5 rounded-xl bg-[#0B3A5B] text-white text-xs font-bold"
                >
                  Hubungi Petugas Loket
                </a>
              </div>
            </div>
          )}

          {/* STATE 3: KEDALUWARSA Banner */}
          {isExpired && !isPaid && !isUnknown && (
            <div className="rounded-2xl p-4 bg-[#FCECE9] border-2 border-brand-coral shadow-sm space-y-2 text-center">
              <span className="material-symbols-outlined text-3xl text-brand-coral">timer_off</span>
              <h3 className="font-headline-sm text-sm font-bold text-brand-coral">
                Waktu Pembayaran Telah Habis
              </h3>
              <p className="text-body-sm text-on-surface-variant text-[13px]">
                Batas waktu reservasi 15 menit telah terlewati. Kuota telah dikembalikan ke sistem.
              </p>
              <Link
                href="/"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-brand-coral text-white text-xs font-bold"
              >
                Pesan Tiket Ulang
              </Link>
            </div>
          )}

          {/* STATE 2: BERHASIL Banner */}
          {isPaid && (
            <div className="rounded-2xl p-4 bg-[#E8F5EE] border-2 border-[#1E7B4F] shadow-sm space-y-2 text-center">
              <span className="material-symbols-outlined text-4xl text-[#1E7B4F] fill-icon">
                check_circle
              </span>
              <h3 className="font-headline-sm text-[16px] font-bold text-[#1E7B4F]">
                Pembayaran Sukses Terverifikasi!
              </h3>
              <p className="text-body-sm text-on-surface-variant text-xs">
                E-Tiket digital resmi Anda telah terbit dan siap digunakan di Dermaga Ketapang.
              </p>
              {data.tickets[0] && (
                <Link
                  href={`/tiket/${data.tickets[0].ticketCode}`}
                  className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#1E7B4F] text-white text-label-md font-bold shadow-md"
                >
                  Buka E-Tiket Sekarang
                </Link>
              )}
            </div>
          )}

          {/* Hitung Mundur Pembayaran (SKILL §6.7) */}
          {!isPaid && !isExpired && (
            <section className="rounded-2xl p-3 bg-[#FCECE9] border border-brand-coral/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-coral text-xl">timer</span>
                <span className="text-xs text-on-surface-variant font-medium">
                  Selesaikan pembayaran dalam
                </span>
              </div>
              <span className="font-mono text-headline-sm font-extrabold text-brand-coral">
                {timeFormatted}
              </span>
            </section>
          )}

          {/* Kartu QRIS Putih Kontras Tinggi (SKILL §6.7) */}
          <section className="bg-white rounded-3xl p-5 border border-[#D5CEBF]/40 shadow-coastal-2 text-center space-y-4">
            {/* Header QRIS Resmi */}
            <div className="flex items-center justify-between border-b border-[#D5CEBF]/30 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-xs font-black tracking-widest bg-[#ED1C24] text-white">
                  QRIS
                </span>
                <span className="text-[11px] font-bold text-primary-container">QR Standar Nasional</span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono">
                NMID: ID1020268849102
              </span>
            </div>

            {/* Total Pembayaran Besar */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">
                Total Tagihan
              </span>
              <span className="text-headline-xl-mobile font-extrabold text-primary-container">
                {formatRupiah(data.totalAmount)}
              </span>
              <span className="text-xs text-on-surface-variant block mt-0.5">
                {data.serviceName} ({data.quantity} orang)
              </span>
            </div>

            {/* Display QR Code */}
            <div className="relative inline-block p-3 rounded-2xl bg-white border border-[#D5CEBF]/50 shadow-sm">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QRIS Code"
                  className={`w-52 h-52 mx-auto rounded-lg transition-all ${
                    isExpired ? "blur-sm opacity-40" : ""
                  }`}
                />
              ) : (
                <div className="w-52 h-52 bg-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl animate-spin text-[#0FA3A3]">sync</span>
                </div>
              )}

              {isExpired && !isPaid && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-brand-coral text-white font-bold text-xs shadow-md">
                    KEDALUWARSA
                  </span>
                </div>
              )}
            </div>

            {/* Kode Pesanan + Copy Button */}
            <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#D5CEBF]/40 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold">
                  Kode Pesanan
                </span>
                <span className="font-mono text-xs font-bold text-primary-container">
                  {data.reservationCode}
                </span>
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#D5CEBF]/50 text-xs font-bold text-primary-container hover:bg-surface transition-all flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                <span>{copied ? "Tersalin!" : "Salin"}</span>
              </button>
            </div>

            {copied && (
              <div className="text-xs font-bold text-[#1E7B4F] flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm fill-icon">check_circle</span>
                <span>Kode pesanan berhasil disalin!</span>
              </div>
            )}
          </section>

          {/* Cara Pembayaran Cepat 3 Langkah (SKILL §6.7) */}
          <section className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-3">
            <h4 className="text-label-md text-primary-container font-bold">
              Cara Pembayaran Cepat
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-body-sm text-on-surface-variant text-[13px]">
                  Buka aplikasi mobile banking (Bank Lampung, BCA, Mandiri, BRI) atau e-wallet pilihan Anda.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-body-sm text-on-surface-variant text-[13px]">
                  Pindai kode QRIS di atas dan pastikan nama merchant adalah <strong className="text-primary font-bold">TourismPay Pesawaran</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-body-sm text-on-surface-variant text-[13px]">
                  Konfirmasi nominal tagihan dan simpan bukti transaksi digital Anda.
                </p>
              </div>
            </div>
          </section>

          {/* Panel Kontrol Simulasi Pembayaran (Khusus Prototype & Pengujian) */}
          <section className="rounded-2xl p-4 bg-[#061826] text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7ff5f4]">
                  Simulasi Gateway Bank Lampung
                </span>
              </div>
              <span className="text-[10px] text-white/60">Uji Coba Alur</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={actionLoading || isPaid}
                onClick={() => handleSimulateWebhook("PAID")}
                className="p-2.5 rounded-xl bg-brand-coral hover:bg-[#B93624] text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Bayar Sukses (Webhook)</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSimulateWebhook("PAYMENT_UNKNOWN")}
                className="p-2.5 rounded-xl bg-[#B7791F] hover:bg-[#9a6416] text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">help</span>
                <span>Status Belum Pasti</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
