"use client";

import { useState, useEffect } from "react";
import { formatRupiah, formatDateTimeWIB } from "@/lib/formatters";

interface QueueItem {
  id: string;
  localEventId: string;
  eventType: string;
  syncStatus: "PENDING_SYNC" | "SYNCED" | "CONFLICT";
  errorMessage?: string;
  createdAt: string;
  details?: any;
}

export default function StatusSinkronPage() {
  const [syncState, setSyncState] = useState<"IDLE" | "SYNCING" | "SUCCESS" | "OFFLINE">("IDLE");
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Hari ini · 14:30 WIB");

  const loadQueue = async () => {
    try {
      const res = await fetch("/api/sync/queue");
      const json = await res.json();
      if (json.success) {
        setQueueItems(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleSyncNow = async () => {
    setSyncState("SYNCING");
    try {
      // Simulate pushing pending items
      const pendingScans = [
        {
          localId: `scan-offline-${Date.now()}`,
          ticketTokenHash: "hash_token_demo_rina_valid_0042",
          scannedAt: new Date().toISOString(),
          staffUserId: "user-petugas-budi",
        },
      ];

      const res = await fetch("/api/sync/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: "POS-DERMAGA-KETAPANG-01",
          scans: pendingScans,
          cashRecords: [],
        }),
      });

      const json = await res.json();
      setLastSyncTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB");
      setSyncState("SUCCESS");
      await loadQueue();
    } catch (e) {
      setSyncState("OFFLINE");
    } finally {
      setTimeout(() => {
        setSyncState("IDLE");
      }, 3000);
    }
  };

  const pendingCount = queueItems.filter((i) => i.syncStatus === "PENDING_SYNC").length;
  const conflictCount = queueItems.filter((i) => i.syncStatus === "CONFLICT").length;

  return (
    <div className="p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-sm text-primary-container text-[17px] font-bold">
            Status Sinkronisasi
          </h2>
          <span className="text-xs text-on-surface-variant font-medium">
            Pengelolaan data offline dermaga
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E4F7F7] text-secondary">
          PWA Offline-First
        </span>
      </div>

      {/* Dynamic Status Banner (SKILL §6.10) */}
      {syncState === "SYNCING" ? (
        <div className="rounded-2xl p-4 bg-[#CEE5FF] border border-[#0B3A5B]/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl animate-spin text-[#0B3A5B]">sync</span>
          <div>
            <h4 className="text-xs font-bold text-[#0B3A5B]">Sedang Mengunggah Berkas...</h4>
            <p className="text-[11px] text-on-surface-variant">Menyinkronkan data pemindaian ke server pusat</p>
          </div>
        </div>
      ) : syncState === "SUCCESS" ? (
        <div className="rounded-2xl p-4 bg-[#E8F5EE] border border-[#1E7B4F]/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl fill-icon text-[#1E7B4F]">check_circle</span>
          <div>
            <h4 className="text-xs font-bold text-[#1E7B4F]">Sinkronisasi Berhasil</h4>
            <p className="text-[11px] text-on-surface-variant">Seluruh transaksi lokal telah tersinkronkan</p>
          </div>
        </div>
      ) : conflictCount > 0 ? (
        <div className="rounded-2xl p-4 bg-[#FCECE9] border-2 border-brand-coral flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-brand-coral fill-icon">warning</span>
          <div>
            <h4 className="text-xs font-bold text-brand-coral">Perlu Ditinjau: Ada Konflik Data!</h4>
            <p className="text-[11px] text-on-surface-variant">Tiket yang sama divalidasi di perangkat lain saat offline</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-4 bg-[#FEF7EA] border border-[#B7791F]/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-[#B7791F]">offline_pin</span>
          <div>
            <h4 className="text-xs font-bold text-[#7A4F00]">Database Lokal Aktif</h4>
            <p className="text-[11px] text-on-surface-variant">Pemeriksaan tiket tetap dapat berjalan tanpa koneksi</p>
          </div>
        </div>
      )}

      {/* Metrik 3 Kolom (SKILL §6.10) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 bg-white rounded-2xl border border-[#D5CEBF]/40 text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Antrean</span>
          <span className="text-headline-sm font-extrabold text-primary-container">{pendingCount}</span>
          <span className="text-[10px] text-outline block">Menunggu</span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-[#D5CEBF]/40 text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-brand-coral block">Konflik</span>
          <span className="text-headline-sm font-extrabold text-brand-coral">{conflictCount}</span>
          <span className="text-[10px] text-outline block">Perlu Tinjau</span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-[#D5CEBF]/40 text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Terakhir</span>
          <span className="text-xs font-bold text-primary-container block truncate">{lastSyncTime}</span>
          <span className="text-[10px] text-[#1E7B4F] block">Terkoneksi</span>
        </div>
      </div>

      {/* Daftar Antrean & Peristiwa Konflik (SKILL §6.10) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-md text-primary-container font-bold">
            Antrean Peristiwa Lokal
          </h3>
          <button
            type="button"
            onClick={loadQueue}
            className="text-xs text-[#0FA3A3] font-bold flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Segarkan</span>
          </button>
        </div>

        {queueItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-on-surface-variant border border-[#D5CEBF]/40 space-y-2">
            <span className="material-symbols-outlined text-3xl text-outline">done_all</span>
            <p className="font-bold text-primary-container">Tidak Ada Antrean Tertunda</p>
            <p>Seluruh pemindaian tiket dan catatan tunai telah tersinkronkan ke server pusat.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {queueItems.map((item) => {
              const isConflict = item.syncStatus === "CONFLICT";
              const isSynced = item.syncStatus === "SYNCED";

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-3.5 border transition-all ${
                    isConflict
                      ? "border-2 border-brand-coral bg-[#FFF5F4]"
                      : isSynced
                      ? "border-[#D5CEBF]/40 opacity-70"
                      : "border-[#D5CEBF]/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isConflict
                            ? "bg-[#FCECE9] text-brand-coral"
                            : item.eventType.includes("SCAN")
                            ? "bg-primary-container text-white"
                            : "bg-[#0FA3A3]/20 text-brand-teal"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {item.eventType.includes("SCAN") ? "qr_code_scanner" : "payments"}
                        </span>
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-primary-container block">
                          {item.eventType}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          ID: {item.localEventId}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isConflict
                          ? "bg-brand-coral text-white"
                          : isSynced
                          ? "bg-[#E8F5EE] text-[#1E7B4F]"
                          : "bg-[#FEF7EA] text-[#B7791F]"
                      }`}
                    >
                      {isConflict ? "PERLU DITINJAU" : isSynced ? "TERSINKRON" : "MENUNGGU"}
                    </span>
                  </div>

                  {item.errorMessage && (
                    <div className="mt-2 p-2 rounded-xl bg-white/80 border border-brand-coral/30 text-xs text-brand-coral font-medium">
                      ⚠️ {item.errorMessage}
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-[#D5CEBF]/30 flex items-center justify-between text-[11px] text-outline">
                    <span>Waktu: {formatDateTimeWIB(item.createdAt)}</span>
                    {isConflict && (
                      <span className="font-bold text-brand-coral">Status: SIAGA Lapangan</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sticky Coral Sync Button (SKILL §6.10) */}
      <div className="pt-2">
        <button
          type="button"
          disabled={syncState === "SYNCING"}
          onClick={handleSyncNow}
          className="w-full min-h-[52px] bg-brand-coral hover:bg-[#B93624] text-white font-label-lg rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.99] font-bold transition-all disabled:opacity-40"
        >
          {syncState === "SYNCING" ? (
            <>
              <span className="material-symbols-outlined text-xl animate-spin">sync</span>
              <span>Menyinkronkan Antrean...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">cloud_sync</span>
              <span>Sinkronkan Sekarang ({queueItems.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
