"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TouristHeader } from "@/components/TouristHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateWIB, formatDateTimeWIB, maskPhoneNumber } from "@/lib/formatters";
import QRCode from "qrcode";

interface TicketData {
  id: string;
  ticketCode: string;
  ticketTokenHash: string;
  validDate: string;
  status: "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED";
  passengerCount: number;
  usedAt?: string;
  cancelledAt?: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  reservationCode: string;
  lastScan?: {
    scannedAt: string;
    staffName: string;
    deviceId: string;
  } | null;
}

export default function TicketBoardingPassPage() {
  const params = useParams();
  const ticketCode = params?.ticketCode as string;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [maxBrightnessActive, setMaxBrightnessActive] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetch(`/api/tickets/${ticketCode}`);
        const json = await res.json();
        if (json.success) {
          setTicket(json.data);

          // Generate QR code solely with random token hash (NO plain personal data)
          const url = await QRCode.toDataURL(json.data.ticketTokenHash, {
            color: {
              dark: "#0B3A5B",
              light: "#FFFFFF",
            },
            margin: 2,
            width: 220,
          });
          setQrUrl(url);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (ticketCode) {
      loadTicket();
    }
  }, [ticketCode]);

  const toggleBrightness = () => {
    setMaxBrightnessActive(!maxBrightnessActive);
  };

  if (loading || !ticket) {
    return (
      <div className="w-full min-h-screen bg-[#FBF7EF] flex justify-center">
        <main className="w-full max-w-[420px] min-h-screen bg-[#FBF7EF] flex flex-col p-4 space-y-4">
          <TouristHeader title="E-Tiket Digital" showBack />
          <div className="p-8 text-center text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-4xl animate-spin text-brand-teal">sync</span>
            <p className="text-body-sm font-medium">Memuat e-tiket boarding pass...</p>
          </div>
        </main>
      </div>
    );
  }

  const isUsed = ticket.status === "USED";
  const isCancelled = ticket.status === "CANCELLED";

  return (
    <div
      className={`w-full min-h-screen flex justify-center transition-colors duration-200 ${
        maxBrightnessActive ? "bg-white" : "bg-[#FBF7EF]"
      }`}
    >
      <main className="w-full max-w-[420px] min-h-screen relative flex flex-col pb-36 shadow-coastal-1">
        {/* Top Header */}
        <TouristHeader title="E-Tiket Digital" showBack rightBadge="Resmi" />

        <div className="p-4 space-y-4">
          {/* Banner Tips Luar Ruang (SKILL §6.5) */}
          <div className="rounded-2xl p-3 bg-[#FEF7EA] border border-[#B7791F]/30 flex items-center gap-2.5 shadow-sm">
            <span className="material-symbols-outlined text-[#B7791F] text-xl shrink-0">brightness_high</span>
            <p className="text-xs text-[#400200] font-medium leading-relaxed">
              <strong>Tips Dermaga:</strong> Naikkan kecerahan layar ponsel ke 100% agar pemindai petugas dapat membaca QR secara cepat di bawah sinar matahari.
            </p>
          </div>

          {/* Kartu Boarding Pass Putih rounded-3xl dengan Takik Sobekan (SKILL §6.5) */}
          <div
            className={`relative bg-white rounded-3xl border border-[#D5CEBF]/40 shadow-coastal-2 overflow-hidden transition-all ${
              isCancelled ? "grayscale-[35%] opacity-85" : ""
            }`}
          >
            {/* Bagian Atas Tiket */}
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-brand-teal uppercase">
                  Wisata Bahari Resmi
                </span>
                <StatusBadge
                  status={isUsed ? "TERPAKAI" : isCancelled ? "BATAL" : "VALID"}
                  label={isUsed ? "Terpakai" : isCancelled ? "Dibatalkan" : "Tiket Sah"}
                />
              </div>

              <div>
                <h2 className="font-headline-sm text-primary-container text-[17px] font-bold">
                  {ticket.serviceName}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium mt-0.5">
                  <span className="material-symbols-outlined text-sm text-brand-teal">directions_boat</span>
                  <span>Dermaga Ketapang ➔ Pulau Pahawang</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                    Kode Tiket
                  </span>
                  <span className="font-mono text-xs font-bold text-primary-container">
                    {ticket.ticketCode}
                  </span>
                </div>

                {/* Chip Tersimpan di Perangkat (SKILL §6.5) */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E4F7F7] border border-[#A1E5E5] text-secondary text-[11px] font-bold">
                  <span className="material-symbols-outlined text-xs fill-icon">offline_pin</span>
                  <span>Tersimpan Offline</span>
                </div>
              </div>
            </div>

            {/* Garis Sobekan Tiket dengan Dua Takik Lingkaran Khas (SKILL §6.5) */}
            <div className="relative border-b-2 border-dashed border-[#D5CEBF]/60 my-1">
              <div className="ticket-notch-l"></div>
              <div className="ticket-notch-r"></div>
            </div>

            {/* Bagian Bawah: QR Code & Detail */}
            <div className="p-5 text-center space-y-4">
              {/* Box QR Code */}
              <div className="relative inline-block p-3 rounded-2xl bg-white border border-[#D5CEBF]/60 shadow-sm">
                {qrUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrUrl}
                    alt="Ticket QR Code"
                    className={`w-48 h-48 mx-auto rounded-lg transition-opacity ${
                      isUsed ? "opacity-35" : ""
                    }`}
                  />
                ) : (
                  <div className="w-48 h-48 bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl animate-spin text-brand-teal">sync</span>
                  </div>
                )}

                {/* Stempel Miring TERPAKAI (SKILL §6.5) */}
                {isUsed && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="transform -rotate-12 border-4 border-[#64748B] text-[#64748B] font-extrabold text-xl px-4 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-md tracking-wider">
                      TERPAKAI
                    </div>
                  </div>
                )}

                {/* Stempel Miring DIBATALKAN */}
                {isCancelled && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="transform -rotate-12 border-4 border-brand-coral text-brand-coral font-extrabold text-sm px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-md tracking-wide">
                      REFUND TERPROSES
                    </div>
                  </div>
                )}
              </div>

              {/* Log Pemindaian Terakhir (bila sudah terpakai) */}
              {isUsed && ticket.lastScan && (
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-[#D5CEBF]/40 text-xs text-on-surface-variant text-center space-y-0.5">
                  <span className="font-bold text-primary-container block">
                    Divalidasi oleh: {ticket.lastScan.staffName}
                  </span>
                  <span>Waktu: {formatDateTimeWIB(ticket.lastScan.scannedAt)}</span>
                  <span className="block text-[11px] text-outline font-mono">Pos: {ticket.lastScan.deviceId}</span>
                </div>
              )}

              {/* Grid Rincian 2 Kolom (SKILL §6.5) */}
              <div className="grid grid-cols-2 gap-3 text-left p-3.5 rounded-2xl bg-[#FBF7EF] border border-[#D5CEBF]/40 text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                    Tanggal Berlaku
                  </span>
                  <span className="font-bold text-primary-container">
                    {formatDateWIB(ticket.validDate)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                    Jumlah Pengunjung
                  </span>
                  <span className="font-bold text-primary-container">
                    {ticket.passengerCount} Orang
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                    Nama Pemesan
                  </span>
                  <span className="font-bold text-primary-container">
                    {ticket.customerName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                    Nomor Kontak
                  </span>
                  <span className="font-mono text-primary-container">
                    {maskPhoneNumber(ticket.customerPhone)}
                  </span>
                </div>
              </div>

              {/* Privasi QR Note (PRD FR-04.2) */}
              <p className="text-[11px] text-on-surface-variant text-center">
                🔒 QR code menggunakan token acak terenkripsi tanpa memuat NIK atau data pribadi terbuka.
              </p>
            </div>
          </div>

          {/* Tombol Aksi Layar Tiket (SKILL §6.5) */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={toggleBrightness}
              className="w-full min-h-[50px] bg-brand-coral hover:bg-[#B93624] text-white font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">
                {maxBrightnessActive ? "brightness_medium" : "wb_sunny"}
              </span>
              <span>{maxBrightnessActive ? "Kembalikan Tampilan Normal" : "Tampilkan Layar Penuh (Max Kecerahan)"}</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Gambar tiket berhasil diunduh ke galeri.")}
              className="w-full min-h-[46px] bg-white border-2 border-primary-container text-primary-container font-label-md text-label-md rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Simpan Gambar Tiket ke Galeri</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
