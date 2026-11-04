"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TouristHeader } from "@/components/TouristHeader";
import { TouristNavigation } from "@/components/TouristNavigation";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRupiah, formatDateTimeWIB } from "@/lib/formatters";

interface HistoryItem {
  id: string;
  reservationCode: string;
  serviceDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  serviceName: string;
  quantity: number;
  ticketCode?: string;
}

export default function TransactionHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/reservations/history");
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#FBF7EF] flex justify-center">
      <main className="w-full max-w-[420px] min-h-screen bg-[#FBF7EF] relative flex flex-col pb-36 shadow-coastal-1">
        {/* Header */}
        <TouristHeader title="Riwayat Pesanan" showBack={false} />

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-primary-container text-[17px] font-bold">
              Daftar Transaksi Tiket
            </h2>
            <span className="text-xs text-on-surface-variant font-medium">
              {items.length} Transaksi
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-4xl animate-spin text-brand-teal">sync</span>
              <p className="text-body-sm font-medium">Memuat riwayat transaksi...</p>
            </div>
          ) : items.length === 0 ? (
            /* State Kosong (SKILL §6.11) */
            <div className="bg-white rounded-3xl p-8 border border-[#D5CEBF]/40 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#FEF7EA] text-[#B7791F] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">receipt_long</span>
              </div>
              <h3 className="font-headline-sm text-primary-container font-bold text-base">
                Belum Ada Transaksi
              </h3>
              <p className="text-body-sm text-on-surface-variant text-xs">
                Anda belum memiliki pesanan tiket wisata bahari atau penyeberangan kapal.
              </p>
              <Link
                href="/"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-brand-coral hover:bg-[#B93624] text-white text-xs font-bold shadow-md transition-all"
              >
                Jelajahi Wisata Pahawang
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const isConfirmed = item.status === "CONFIRMED";
                const isPending = item.status === "PENDING_PAYMENT";
                const isCancelled = item.status === "CANCELLED";
                const isExpired = item.status === "EXPIRED";

                // Strip warna kiri 6px (SKILL §6.11)
                const stripColor = isConfirmed
                  ? "border-l-[#1E7B4F]"
                  : isPending
                  ? "border-l-[#B7791F]"
                  : isCancelled
                  ? "border-l-brand-coral"
                  : "border-l-[#64748B]";

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`bg-white rounded-[20px] p-4 border border-[#D5CEBF]/40 border-l-[6px] ${stripColor} shadow-sm hover:shadow-coastal-1 transition-all cursor-pointer space-y-2.5 active:scale-[0.99]`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary-container">
                        {item.reservationCode}
                      </span>
                      <StatusBadge
                        status={
                          isConfirmed
                            ? "LUNAS"
                            : isPending
                            ? "MENUNGGU"
                            : isCancelled
                            ? "BATAL"
                            : "KEDALUWARSA"
                        }
                      />
                    </div>

                    <div>
                      <h4 className="font-headline-sm text-primary-container text-[15px] font-bold leading-snug">
                        {item.serviceName}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {item.quantity} Pengunjung · Tanggal: {item.serviceDate}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D5CEBF]/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-on-surface-variant block uppercase font-bold">
                          Nominal
                        </span>
                        <span
                          className={`font-headline-sm text-sm font-extrabold ${
                            isCancelled ? "line-through text-outline" : "text-primary-container"
                          }`}
                        >
                          {formatRupiah(item.totalAmount)}
                        </span>
                      </div>

                      {isConfirmed && item.ticketCode && (
                        <Link
                          href={`/tiket/${item.ticketCode}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-xl bg-primary-container text-white text-xs font-bold hover:bg-primary transition-all flex items-center gap-1"
                        >
                          <span>Buka Tiket</span>
                          <span className="material-symbols-outlined text-sm">confirmation_number</span>
                        </Link>
                      )}

                      {isPending && (
                        <Link
                          href={`/bayar/${item.reservationCode}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3.5 py-1.5 rounded-xl bg-brand-coral text-white text-xs font-bold hover:bg-[#B93624] shadow-sm flex items-center gap-1"
                        >
                          <span>Bayar Sekarang</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      )}

                      {isExpired && (
                        <Link
                          href="/"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-xl bg-surface-container-high text-primary-container text-xs font-bold"
                        >
                          Pesan Ulang
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Kemitraan Resmi (SKILL §6.11) */}
          <footer className="pt-4 text-center text-xs text-on-surface-variant space-y-1">
            <p className="font-medium">
              Dikelola resmi oleh <strong className="text-primary font-bold">BUMDes Wisata Bahari Pesawaran</strong>
            </p>
            <p className="text-[11px] text-outline">
              Bekerja sama dengan Pemerintah Kabupaten Pesawaran & Bank Lampung
            </p>
          </footer>
        </div>

        {/* Bottom Sheet Rincian Transaksi (SKILL §6.11) */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
            <div className="w-full max-w-[420px] bg-white rounded-t-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="w-12 h-1.5 bg-[#D5CEBF] rounded-full mx-auto"></div>

              <div className="flex items-center justify-between border-b border-[#D5CEBF]/40 pb-3">
                <h3 className="font-headline-sm text-primary-container font-bold text-base">
                  Rincian Transaksi
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Status Pesanan:</span>
                  <StatusBadge
                    status={
                      selectedItem.status === "CONFIRMED"
                        ? "LUNAS"
                        : selectedItem.status === "PENDING_PAYMENT"
                        ? "MENUNGGU"
                        : "BATAL"
                    }
                  />
                </div>

                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Kode Booking:</span>
                  <span className="font-mono font-bold text-brand-teal">{selectedItem.reservationCode}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Layanan:</span>
                  <span className="font-bold text-primary-container text-right">{selectedItem.serviceName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tanggal Layanan:</span>
                  <span className="font-medium text-primary-container">{selectedItem.serviceDate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Jumlah Tiket:</span>
                  <span className="font-bold text-primary-container">{selectedItem.quantity} Orang</span>
                </div>

                <div className="pt-2 border-t border-[#D5CEBF]/40 flex justify-between items-center">
                  <span className="text-sm font-bold text-primary-container">Total Pembayaran</span>
                  <span className="text-headline-sm font-extrabold text-primary-container">
                    {formatRupiah(selectedItem.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                {selectedItem.status === "CONFIRMED" && selectedItem.ticketCode ? (
                  <Link
                    href={`/tiket/${selectedItem.ticketCode}`}
                    className="w-full min-h-[48px] bg-brand-coral hover:bg-[#B93624] text-white font-label-md rounded-xl flex items-center justify-center gap-2 font-bold shadow-md"
                  >
                    <span>Buka E-Tiket Digital</span>
                    <span className="material-symbols-outlined text-lg">qr_code_2</span>
                  </Link>
                ) : selectedItem.status === "PENDING_PAYMENT" ? (
                  <Link
                    href={`/bayar/${selectedItem.reservationCode}`}
                    className="w-full min-h-[48px] bg-brand-coral hover:bg-[#B93624] text-white font-label-md rounded-xl flex items-center justify-center gap-2 font-bold shadow-md"
                  >
                    <span>Lanjutkan Pembayaran QRIS</span>
                    <span className="material-symbols-outlined text-lg">payments</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="w-full min-h-[44px] bg-surface-container text-primary-container font-label-md rounded-xl font-bold"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <TouristNavigation />
      </main>
    </div>
  );
}
