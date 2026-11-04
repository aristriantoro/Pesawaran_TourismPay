"use client";

import { useState, useEffect } from "react";
import { formatRupiah, formatDateTimeWIB } from "@/lib/formatters";

interface ReconcileItem {
  id: string;
  code: string;
  time: string;
  method: string;
  partner: string;
  systemAmount: number;
  actualAmount: number;
  difference: number;
  status: "MATCHED" | "DISCREPANCY" | "UNDER_INVESTIGATION" | "RESOLVED";
  actionStatus: "BELUM_DITINJAU" | "DIPROSES" | "SELESAI";
  staffName?: string;
  notes?: string;
}

export default function TransaksiRekonsiliasiPage() {
  const [items, setItems] = useState<ReconcileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState("SEMUA");
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<ReconcileItem | null>(null);

  // Drawer Form States
  const [drawerActionStatus, setDrawerActionStatus] = useState<"BELUM_DITINJAU" | "DIPROSES" | "SELESAI">("BELUM_DITINJAU");
  const [drawerNotes, setDrawerNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch("/api/reconciliation");
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDrawer = (item: ReconcileItem) => {
    setSelectedDrawerItem(item);
    setDrawerActionStatus(item.actionStatus || "BELUM_DITINJAU");
    setDrawerNotes(item.notes || "");
  };

  const handleSaveInvestigation = async () => {
    if (!selectedDrawerItem) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/reconciliation/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reconciliationId: selectedDrawerItem.id,
          actionStatus: drawerActionStatus,
          notes: drawerNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Catatan investigasi berhasil disimpan.");
        setSelectedDrawerItem(null);
        await loadData();
      }
    } catch (e: any) {
      alert("Gagal menyimpan: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations
  const totalSystem = items.reduce((acc, i) => acc + i.systemAmount, 0);
  const totalActual = items.reduce((acc, i) => acc + i.actualAmount, 0);
  const totalDiff = items.reduce((acc, i) => acc + i.difference, 0);
  const matchedCount = items.filter((i) => i.status === "MATCHED" || i.status === "RESOLVED").length;
  const matchPercentage = items.length > 0 ? Math.round((matchedCount / items.length) * 100) : 100;

  const filteredItems = items.filter((item) => {
    if (filterMethod === "SEMUA") return true;
    if (filterMethod === "QRIS") return item.method === "QRIS";
    if (filterMethod === "TUNAI") return item.method === "CASH";
    if (filterMethod === "SELISIH") return item.difference !== 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-extrabold text-[#00243D] tracking-tight">
            Transaksi & Rekonsiliasi Kas
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Pencocokan mutasi QRIS mitra bank dan setoran fisik loket dermaga secara terperinci.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1.5 rounded-xl border border-[#D5CEBF] bg-white text-primary-container text-xs font-bold hover:bg-surface-container flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
            <span>Cocokkan Sekarang</span>
          </button>
        </div>
      </div>

      {/* KPI Rekonsiliasi (SKILL §6.13) */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
            Transaksi Sistem
          </span>
          <span className="text-headline-lg font-extrabold text-primary-container block">
            {formatRupiah(totalSystem)}
          </span>
          <span className="text-[11px] text-outline font-medium block">Tercatat di aplikasi</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
            Settlement / Setoran Fisik
          </span>
          <span className="text-headline-lg font-extrabold text-[#006a6a] block">
            {formatRupiah(totalActual)}
          </span>
          <span className="text-[11px] text-[#1E7B4F] font-bold block">Masuk ke rekening/kasir</span>
        </div>

        {/* Total Selisih Kas (Merah) */}
        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-coral block">
            Total Selisih Kas
          </span>
          <span className="text-headline-lg font-extrabold text-brand-coral block">
            {formatRupiah(totalDiff)}
          </span>
          <span className="text-[11px] text-brand-coral font-bold block">Perlu investigasi kasir</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D5CEBF]/40 shadow-coastal-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
            Tingkat Kecocokan
          </span>
          <span className="text-headline-lg font-extrabold text-[#1E7B4F] block">
            {matchPercentage}% Cocok
          </span>
          <div className="w-full bg-surface-container rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-[#1E7B4F] h-1.5 rounded-full" style={{ width: `${matchPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filter Bar (SKILL §6.13) */}
      <div className="p-4 bg-white rounded-2xl border border-[#D5CEBF]/40 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMethod("SEMUA")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMethod === "SEMUA"
                ? "bg-primary-container text-white"
                : "bg-surface-container text-primary-container hover:bg-surface-container-high"
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMethod("QRIS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMethod === "QRIS"
                ? "bg-primary-container text-white"
                : "bg-surface-container text-primary-container hover:bg-surface-container-high"
            }`}
          >
            Bank Lampung (QRIS)
          </button>
          <button
            type="button"
            onClick={() => setFilterMethod("TUNAI")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMethod === "TUNAI"
                ? "bg-primary-container text-white"
                : "bg-surface-container text-primary-container hover:bg-surface-container-high"
            }`}
          >
            BUMDes Tunai Pos 1
          </button>
          <button
            type="button"
            onClick={() => setFilterMethod("SELISIH")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMethod === "SELISIH"
                ? "bg-brand-coral text-white"
                : "bg-[#FCECE9] text-brand-coral hover:bg-[#ffdad6]"
            }`}
          >
            Hanya Selisih Kas
          </button>
        </div>
      </div>

      {/* Tabel Jurnal Rekonsiliasi (SKILL §6.13) */}
      <section className="bg-white rounded-2xl border border-[#D5CEBF]/40 shadow-coastal-1 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#FBF7EF] border-b border-[#D5CEBF]/60 text-outline text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Kode Transaksi</th>
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4">Mitra & Metode</th>
              <th className="py-3 px-4">Nominal Sistem</th>
              <th className="py-3 px-4">Settlement / Fisik</th>
              <th className="py-3 px-4">Selisih</th>
              <th className="py-3 px-4">Status Rekon</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5CEBF]/30">
            {filteredItems.map((item) => {
              const hasDiff = item.difference !== 0;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    hasDiff
                      ? "bg-[#FFF5F4] border-l-4 border-l-[#D94530]"
                      : "hover:bg-surface-container-low"
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-primary-container">
                    {item.code}
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">{item.time}</td>
                  <td className="py-3.5 px-4 font-semibold text-primary-container">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container mr-1.5">
                      {item.method}
                    </span>
                    {item.partner}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-primary-container">
                    {formatRupiah(item.systemAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary-container">
                    {formatRupiah(item.actualAmount)}
                  </td>
                  <td className="py-3.5 px-4">
                    {hasDiff ? (
                      <span className="font-extrabold text-brand-coral inline-flex items-center gap-1 font-mono">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>{formatRupiah(item.difference)}</span>
                      </span>
                    ) : (
                      <span className="text-[#1E7B4F] font-bold font-mono">Rp 0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {hasDiff ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-coral text-white text-[10px] font-extrabold animate-pulse">
                        INVESTIGASI AKTIF
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#1E7B4F] text-[10px] font-bold">
                        <span className="material-symbols-outlined text-xs fill-icon">check_circle</span>
                        <span>Cocok 100%</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => openDrawer(item)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        hasDiff
                          ? "bg-brand-coral text-white hover:bg-[#B93624]"
                          : "bg-primary-container text-white hover:bg-primary"
                      }`}
                    >
                      {hasDiff ? "Tinjau Selisih" : "Rincian"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Drawer Investigasi Selisih 410px (SKILL §6.13) */}
      {selectedDrawerItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-[410px] h-full bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#D5CEBF]/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-coral text-xl">gavel</span>
                  <h3 className="font-headline-sm text-primary-container font-bold text-base">
                    Investigasi Selisih Transaksi
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDrawerItem(null)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Box Perbandingan Nominal */}
              <div className="bg-[#FFF5F4] rounded-2xl p-4 border border-brand-coral/40 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Nominal Tercatat di Sistem:</span>
                  <span className="font-extrabold text-primary-container">
                    {formatRupiah(selectedDrawerItem.systemAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Uang Fisik / Settlement Bank:</span>
                  <span className="font-extrabold text-primary-container">
                    {formatRupiah(selectedDrawerItem.actualAmount)}
                  </span>
                </div>
                <div className="pt-2 border-t border-brand-coral/20 flex justify-between items-center text-sm">
                  <span className="font-bold text-brand-coral">Total Selisih Kas:</span>
                  <span className="text-headline-sm font-extrabold text-brand-coral">
                    {formatRupiah(selectedDrawerItem.difference)}
                  </span>
                </div>
              </div>

              {/* Metadata Petugas & Pos */}
              <div className="space-y-2 text-xs bg-[#FBF7EF] p-3.5 rounded-2xl border border-[#D5CEBF]/40">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Kode Jurnal:</span>
                  <span className="font-mono font-bold text-primary-container">
                    {selectedDrawerItem.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Waktu Transaksi:</span>
                  <span className="font-medium text-primary-container">{selectedDrawerItem.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Petugas Kasir:</span>
                  <span className="font-bold text-primary-container">
                    {selectedDrawerItem.staffName || "Budi Santoso (Pos 1)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Mitra Terkait:</span>
                  <span className="text-primary-container">{selectedDrawerItem.partner}</span>
                </div>
              </div>

              {/* 3-Segment Selector Status Tindak Lanjut (SKILL §6.13) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary-container block">
                  Status Tindak Lanjut Investigasi
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDrawerActionStatus("BELUM_DITINJAU")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      drawerActionStatus === "BELUM_DITINJAU"
                        ? "bg-white text-primary-container shadow-sm"
                        : "text-on-surface-variant"
                    }`}
                  >
                    Belum Ditinjau
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerActionStatus("DIPROSES")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      drawerActionStatus === "DIPROSES"
                        ? "bg-[#B7791F] text-white shadow-sm"
                        : "text-on-surface-variant"
                    }`}
                  >
                    Diproses
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerActionStatus("SELESAI")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      drawerActionStatus === "SELESAI"
                        ? "bg-[#1E7B4F] text-white shadow-sm"
                        : "text-on-surface-variant"
                    }`}
                  >
                    Selesai
                  </button>
                </div>
              </div>

              {/* Textarea Catatan Investigasi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary-container block">
                  Catatan Lapangan & Rekomendasi Audit
                </label>
                <textarea
                  rows={4}
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  placeholder="Tuliskan temuan investigasi, penjelasan kasir, atau nomor bukti setoran fisik..."
                  className="w-full p-3 text-xs rounded-xl border border-[#D5CEBF] bg-[#FBF7EF] focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>

            {/* Tombol Aksi Drawer */}
            <div className="space-y-2 pt-4 border-t border-[#D5CEBF]/40">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveInvestigation}
                className="w-full min-h-[48px] bg-brand-coral hover:bg-[#B93624] text-white font-label-md rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                <span>{isSaving ? "Menyimpan..." : "Simpan Catatan & Tindak Lanjut"}</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setDrawerActionStatus("SELESAI");
                  setTimeout(handleSaveInvestigation, 100);
                }}
                className="w-full min-h-[44px] bg-white border border-primary-container text-primary-container font-label-md rounded-xl font-bold hover:bg-surface-container transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-lg">check</span>
                <span>Tandai Selesai / Rekon Sah</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
