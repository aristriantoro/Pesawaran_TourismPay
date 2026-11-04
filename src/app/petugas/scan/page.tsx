"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDateTimeWIB, maskPhoneNumber } from "@/lib/formatters";

interface ScanResultData {
  result: "VALID" | "ALREADY_USED" | "INVALID";
  ticketCode?: string;
  passengerCount?: number;
  customerName?: string;
  customerPhone?: string;
  serviceName?: string;
  scannedAt?: string;
  previouslyUsedAt?: string;
  validatedByStaff?: string;
  deviceId?: string;
  message?: string;
}

export default function TicketScannerPage() {
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [showManifestModal, setShowManifestModal] = useState(false);

  // Scan handler
  const handleProcessScan = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setScanning(true);
    try {
      const res = await fetch("/api/tickets/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenOrCode: codeToVerify.trim(),
          deviceId: "POS-DERMAGA-KETAPANG-01",
          staffUserId: "user-petugas-budi",
        }),
      });

      const json = await res.json();
      if (json.result) {
        setScanResult({
          result: json.result,
          ...json.data,
          message: json.message,
        });
      } else {
        setScanResult({
          result: "INVALID",
          message: json.message || "Kode QR tidak dikenali.",
        });
      }
    } catch (e: any) {
      setScanResult({
        result: "INVALID",
        message: "Gagal memproses pemindaian: " + e.message,
      });
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setManualCode("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#001726] text-white relative">
      {/* Viewfinder Area (SKILL §6.8) */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 min-h-[420px]">
        {/* Background Camera Simulation Viewport */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00243D]/90 via-[#001726]/70 to-[#001726] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#7ff5f4_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        {/* Reticle 240px dengan Sudut Teal 4px & Laser Animation (SKILL §6.8) */}
        <div className="relative w-64 h-64 rounded-3xl border-2 border-white/20 flex items-center justify-center shadow-2xl">
          {/* 4 Sudut Teal */}
          <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-brand-teal rounded-tl-xl"></div>
          <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-brand-teal rounded-tr-xl"></div>
          <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-brand-teal rounded-bl-xl"></div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-brand-teal rounded-br-xl"></div>

          {/* Animasi Garis Laser Cyan */}
          <div className="absolute left-2 right-2 h-0.5 bg-[#00F0FF] shadow-[0_0_12px_#00F0FF] animate-laser"></div>

          {/* Central Target Icon */}
          <span className="material-symbols-outlined text-4xl text-white/30">
            qr_code_2
          </span>
        </div>

        {/* Pil Instruksi Pemindaian */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping"></span>
          <span>Arahkan ke kode QR tiket wisatawan</span>
        </div>

        {/* Quick Simulator Buttons for Demo Testing */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-xs text-xs">
          <button
            type="button"
            onClick={() => handleProcessScan("hash_token_demo_rina_valid_0042")}
            className="px-2.5 py-1 rounded-lg bg-[#1E7B4F] text-white font-bold hover:bg-[#165e3c] transition-all"
          >
            Uji: Tiket Valid
          </button>
          <button
            type="button"
            onClick={() => handleProcessScan("hash_token_demo_used_0018")}
            className="px-2.5 py-1 rounded-lg bg-[#B7791F] text-white font-bold hover:bg-[#915f17] transition-all"
          >
            Uji: Sudah Terpakai
          </button>
          <button
            type="button"
            onClick={() => handleProcessScan("INVALID_CODE_9999")}
            className="px-2.5 py-1 rounded-lg bg-brand-coral text-white font-bold hover:bg-[#B93624] transition-all"
          >
            Uji: Tidak Valid
          </button>
        </div>
      </div>

      {/* Manual Input Bar */}
      <div className="p-4 bg-[#00243D] border-t border-white/10 space-y-2">
        <label className="text-xs text-white/70 font-medium block">
          Input Kode Tiket atau Hash Manual (Bila QR Rusak)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Contoh: TKT-PHW-20261024-0042"
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-teal font-mono"
          />
          <button
            type="button"
            disabled={scanning || !manualCode.trim()}
            onClick={() => handleProcessScan(manualCode)}
            className="px-4 py-2 bg-brand-teal text-white rounded-xl text-xs font-bold hover:bg-secondary transition-all disabled:opacity-40"
          >
            {scanning ? "Memeriksa..." : "Verifikasi"}
          </button>
        </div>
      </div>

      {/* Bottom Result Sheet 3 State (SKILL §6.8) */}
      {scanResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6 text-on-surface outdoor-sheet space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-[#D5CEBF] rounded-full mx-auto"></div>

            {/* STATE 1: VALID (HIJAU #1E7B4F) */}
            {scanResult.result === "VALID" && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#E8F5EE] text-[#1E7B4F] flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-4xl fill-icon">check_circle</span>
                </div>

                <div>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-[#E8F5EE] text-[#1E7B4F] text-xs font-extrabold uppercase tracking-wide">
                    Sah Masuk Kawasan
                  </div>
                  <h3 className="text-headline-md font-extrabold text-[#1E7B4F] mt-1">
                    TIKET VALID
                  </h3>
                  <span className="font-mono text-xs font-bold text-primary-container block">
                    {scanResult.ticketCode}
                  </span>
                </div>

                <div className="bg-[#FBF7EF] rounded-2xl p-4 border border-[#D5CEBF]/40 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Layanan:</span>
                    <span className="font-bold text-primary-container">{scanResult.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Jumlah Rombongan:</span>
                    <span className="font-extrabold text-primary-container text-sm">
                      {scanResult.passengerCount} Orang
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Nama Pemesan:</span>
                    <span className="font-bold text-primary-container">{scanResult.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Nomor Kontak:</span>
                    <span className="font-mono text-primary-container">
                      {maskPhoneNumber(scanResult.customerPhone)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="w-full min-h-[52px] bg-brand-coral hover:bg-[#B93624] text-white font-label-lg rounded-xl flex items-center justify-center gap-2 shadow-md font-bold"
                  >
                    <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                    <span>Pindai Berikutnya</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManifestModal(true)}
                    className="w-full min-h-[44px] bg-white border border-[#0B3A5B] text-primary-container font-label-md rounded-xl flex items-center justify-center gap-1.5 font-bold hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    <span>Lihat Detail Penumpang & Dokumen</span>
                  </button>
                </div>
              </div>
            )}

            {/* STATE 2: SUDAH DIPAKAI (AMBER #B7791F) */}
            {scanResult.result === "ALREADY_USED" && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FEF7EA] text-[#B7791F] flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-4xl fill-icon">warning</span>
                </div>

                <div>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-[#FEF7EA] text-[#B7791F] text-xs font-extrabold uppercase tracking-wide">
                    Peringatan Duplikasi
                  </div>
                  <h3 className="text-headline-md font-extrabold text-[#B7791F] mt-1">
                    TIKET SUDAH DIPAKAI
                  </h3>
                  <span className="font-mono text-xs font-bold text-primary-container block">
                    {scanResult.ticketCode}
                  </span>
                </div>

                <div className="bg-[#FEF7EA]/60 rounded-2xl p-4 border border-[#B7791F]/30 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Divalidasi Pada:</span>
                    <span className="font-bold text-[#B7791F]">
                      {scanResult.previouslyUsedAt ? formatDateTimeWIB(scanResult.previouslyUsedAt) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Petugas Validasi:</span>
                    <span className="font-bold text-primary-container">{scanResult.validatedByStaff}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Titik / Pos:</span>
                    <span className="font-mono text-primary-container">{scanResult.deviceId}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="w-full min-h-[50px] bg-brand-coral hover:bg-[#B93624] text-white font-label-lg rounded-xl flex items-center justify-center gap-2 shadow-md font-bold"
                  >
                    <span>Lanjutkan Pindai Tiket Lain</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert("Laporan duplikasi dicatat dan diteruskan ke supervisor BUMDes.");
                      resetScanner();
                    }}
                    className="w-full min-h-[44px] bg-white border border-brand-coral text-brand-coral font-label-md rounded-xl font-bold flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">report</span>
                    <span>Laporkan Duplikasi / Investigasi</span>
                  </button>
                </div>
              </div>
            )}

            {/* STATE 3: TIDAK VALID (KORAL #D94530) */}
            {scanResult.result === "INVALID" && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FCECE9] text-brand-coral flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-4xl">cancel</span>
                </div>

                <div>
                  <h3 className="text-headline-md font-extrabold text-brand-coral">
                    TIKET TIDAK VALID
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {scanResult.message || "Kode QR tidak dikenali sistem TourismPay."}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="w-full min-h-[50px] bg-brand-coral hover:bg-[#B93624] text-white font-label-lg rounded-xl flex items-center justify-center gap-2 shadow-md font-bold"
                  >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                    <span>Coba Pindai Ulang</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Manifes Penumpang & Dokumen Asuransi (SKILL §6.8) */}
      {showManifestModal && scanResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-on-surface space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D5CEBF]/40 pb-3">
              <div className="flex items-center gap-2 text-primary-container font-bold text-sm">
                <span className="material-symbols-outlined text-[#0FA3A3]">verified_user</span>
                <span>Dokumen Manifest & Asuransi</span>
              </div>
              <button
                type="button"
                onClick={() => setShowManifestModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#E8F5EE] border border-[#1E7B4F]/30 text-[#1E7B4F] flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-lg fill-icon">shield</span>
                <span>Asuransi Wisata Bahari Jasa Raharja Putra Aktif</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                  Data Rombongan Terdaftar
                </span>
                <div className="p-2.5 rounded-xl bg-[#FBF7EF] border border-[#D5CEBF]/40 space-y-1">
                  <div className="flex justify-between font-bold text-primary-container">
                    <span>1. {scanResult.customerName} (Ketua Rombongan)</span>
                    <span className="text-[11px] text-secondary font-mono">NIK: Terverifikasi</span>
                  </div>
                  {scanResult.passengerCount && scanResult.passengerCount > 1 && (
                    <div className="text-on-surface-variant text-[11px] pl-3 border-l-2 border-[#D5CEBF] space-y-0.5">
                      {Array.from({ length: scanResult.passengerCount - 1 }).map((_, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>Anggota Rombongan #{idx + 2}</span>
                          <span className="font-mono text-outline">Keluarga/Grup</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowManifestModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary-container text-white text-xs font-bold"
            >
              Tutup Dokumen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
