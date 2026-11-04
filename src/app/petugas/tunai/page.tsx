"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah, formatDateTimeWIB } from "@/lib/formatters";

export default function CatatTunaiPage() {
  const [quantity, setQuantity] = useState(2);
  const [unitPrice, setUnitPrice] = useState(25000);
  const [serviceName, setServiceName] = useState("Tiket Masuk Wisata Bahari Pulau Pahawang");
  const [serviceId, setServiceId] = useState("srv-tiket-masuk");
  const [cashReceived, setCashReceived] = useState<number>(100000);
  const [customerName, setCustomerName] = useState("Rombongan Keluarga");
  const [notes, setNotes] = useState("Loket Pintu 1 Ketapang");

  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [savedReceipt, setSavedReceipt] = useState<any | null>(null);

  const totalAmount = unitPrice * quantity;
  const changeAmount = Math.max(0, cashReceived - totalAmount);

  const handleIncrement = (step: number) => {
    setQuantity((prev) => Math.min(50, prev + step));
  };

  const handleDecrement = (step: number) => {
    setQuantity((prev) => Math.max(1, prev - step));
  };

  const handleSubmitCash = async (force: boolean = false) => {
    setLoading(true);
    setDuplicateWarning(null);
    try {
      const res = await fetch("/api/cash-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          quantity,
          customerName,
          notes,
          forceDuplicate: force,
        }),
      });

      const json = await res.json();
      if (json.isDuplicateWarning) {
        setDuplicateWarning(json);
      } else if (json.success) {
        setSavedReceipt({
          ...json.data,
          cashReceived,
          changeAmount,
        });
      } else {
        alert(json.message || "Gagal mencatat kas tunai");
      }
    } catch (e: any) {
      alert("Terjadi kesalahan: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSavedReceipt(null);
    setDuplicateWarning(null);
    setQuantity(2);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-sm text-primary-container text-[17px] font-bold">
            Catat Pembayaran Tunai
          </h2>
          <span className="text-xs text-on-surface-variant font-medium">
            Kasir loket tiket langsung di dermaga
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF7EA] text-[#B7791F]">
          Tercatat ≠ Disetor
        </span>
      </div>

      {/* STATE 2: STRUK TERSIMPAN (SKILL §6.9) */}
      {savedReceipt ? (
        <section className="bg-white rounded-3xl p-6 border border-[#D5CEBF]/40 shadow-coastal-2 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F5EE] text-[#1E7B4F] flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-4xl fill-icon">check_circle</span>
          </div>

          <div>
            <span className="px-3 py-0.5 rounded-full bg-[#FEF7EA] text-[#B7791F] text-xs font-bold uppercase">
              Menunggu Setoran Kas Harian
            </span>
            <h3 className="text-headline-md font-extrabold text-primary-container mt-1">
              Kasir Tunai Berhasil Dicatat
            </h3>
            <span className="font-mono text-sm font-bold text-brand-teal block">
              {savedReceipt.transactionCode}
            </span>
          </div>

          <div className="bg-[#FBF7EF] rounded-2xl p-4 border border-[#D5CEBF]/40 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Layanan:</span>
              <span className="font-bold text-primary-container">{savedReceipt.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Volume:</span>
              <span className="font-bold text-primary-container">{savedReceipt.quantity} Orang</span>
            </div>
            <div className="flex justify-between text-sm pt-1 border-t border-[#D5CEBF]/30 font-bold">
              <span>Total Tagihan:</span>
              <span className="text-primary-container">{formatRupiah(savedReceipt.amount)}</span>
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>Uang Diterima:</span>
              <span>{formatRupiah(savedReceipt.cashReceived)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#1E7B4F] font-bold">
              <span>Kembalian:</span>
              <span>{formatRupiah(savedReceipt.changeAmount)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-outline pt-1 border-t border-[#D5CEBF]/30">
              <span>Petugas Loket:</span>
              <span>{savedReceipt.recordedBy}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="w-full min-h-[50px] bg-brand-coral hover:bg-[#B93624] text-white font-label-lg rounded-xl font-bold shadow-md"
            >
              Catat Transaksi Tunai Berikutnya
            </button>
            <button
              type="button"
              onClick={() => alert("Perintah cetak struk Bluetooth thermal dikirim.")}
              className="w-full min-h-[44px] bg-white border border-primary-container text-primary-container font-label-md rounded-xl font-bold flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              <span>Cetak Struk Bluetooth</span>
            </button>
          </div>
        </section>
      ) : (
        /* STATE 1: FORM INPUT TUNAI */
        <div className="space-y-4">
          {/* Peringatan Duplikasi (STATE 3 & PRD FR-05.4 & Test #7) */}
          {duplicateWarning && (
            <div className="rounded-2xl p-4 bg-[#FEF7EA] border-2 border-[#B7791F] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#B7791F] font-bold">
                <span className="material-symbols-outlined text-xl fill-icon">warning</span>
                <span>Peringatan: Potensi Transaksi Dobel!</span>
              </div>
              <p className="text-on-surface-variant">
                Transaksi dengan nominal serupa baru saja tercatat dengan kode{" "}
                <strong className="font-mono text-primary font-bold">
                  {duplicateWarning.data?.existingCode}
                </strong>
                . Apakah Anda yakin ingin tetap menyimpan?
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmitCash(true)}
                  className="px-3 py-1.5 rounded-xl bg-brand-coral text-white font-bold"
                >
                  Tetap Simpan Transaksi
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateWarning(null)}
                  className="px-3 py-1.5 rounded-xl bg-surface-container text-primary-container font-bold"
                >
                  Batal / Periksa Lagi
                </button>
              </div>
            </div>
          )}

          {/* Kartu Layanan Terpilih */}
          <div className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-2">
            <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">
              Pilih Layanan Wisata
            </label>
            <select
              value={serviceId}
              onChange={(e) => {
                const val = e.target.value;
                setServiceId(val);
                if (val === "srv-tiket-masuk") {
                  setServiceName("Tiket Masuk Wisata Bahari Pulau Pahawang");
                  setUnitPrice(25000);
                } else if (val === "srv-retribusi") {
                  setServiceName("Retribusi Pengelolaan Sampah & Konservasi Laut");
                  setUnitPrice(15000);
                } else {
                  setServiceName("Paket Snorkeling Spot Nemo");
                  setUnitPrice(35000);
                }
              }}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-[#D5CEBF] bg-[#FBF7EF] text-primary-container"
            >
              <option value="srv-tiket-masuk">Tiket Masuk Pulau Pahawang (Rp 25.000 / orang)</option>
              <option value="srv-retribusi">Retribusi Konservasi & Sampah (Rp 15.000 / orang)</option>
              <option value="srv-snorkeling">Paket Snorkeling Nemo (Rp 35.000 / orang)</option>
            </select>
          </div>

          {/* Stepper BESAR 56px (SKILL §6.9) */}
          <section className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-label-md text-primary-container font-bold block">
                  Jumlah Pengunjung
                </label>
                <span className="text-xs text-on-surface-variant font-medium">
                  Atur jumlah tiket tunai
                </span>
              </div>

              {/* Stepper 56px */}
              <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => handleDecrement(1)}
                  disabled={quantity <= 1}
                  className="w-14 h-14 rounded-xl bg-white text-primary-container shadow-sm flex items-center justify-center font-bold text-xl active:scale-95 transition-transform disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-2xl">remove</span>
                </button>

                <span className="w-12 text-center font-headline-xl text-primary-container font-extrabold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => handleIncrement(1)}
                  className="w-14 h-14 rounded-xl bg-primary-container text-white shadow-sm flex items-center justify-center font-bold text-xl active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-2xl">add</span>
                </button>
              </div>
            </div>

            {/* Tombol Cepat Stepper: 1 Org / +2 / +5 / +10 (SKILL §6.9) */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setQuantity(1)}
                className="py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary-container transition-colors"
              >
                1 Org
              </button>
              <button
                type="button"
                onClick={() => handleIncrement(2)}
                className="py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary-container transition-colors"
              >
                +2
              </button>
              <button
                type="button"
                onClick={() => handleIncrement(5)}
                className="py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary-container transition-colors"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => handleIncrement(10)}
                className="py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary-container transition-colors"
              >
                +10
              </button>
            </div>
          </section>

          {/* Kartu Navy Kalkulasi Tagihan (SKILL §6.9) */}
          <section className="bg-primary-container rounded-2xl p-5 text-white shadow-md space-y-3">
            <div className="flex justify-between items-center text-xs text-white/80">
              <span>
                {quantity} orang × {formatRupiah(unitPrice)}
              </span>
              <span className="font-mono text-[#7ff5f4]">Tarif Resmi BUMDes</span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-white/70 block">
                Total Pembayaran Tunai
              </span>
              <span className="text-headline-xl font-extrabold text-[#7ff5f4]">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            {/* Pilihan Nominal Uang Cepat & Kembalian */}
            <div className="pt-3 border-t border-white/15 space-y-2">
              <span className="text-xs text-white/80 font-medium block">
                Uang Tunai Diterima:
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCashReceived(totalAmount)}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    cashReceived === totalAmount
                      ? "bg-secondary text-white ring-2 ring-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Uang Pas
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived(50000)}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    cashReceived === 50000
                      ? "bg-secondary text-white ring-2 ring-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Rp 50.000
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived(100000)}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    cashReceived === 100000
                      ? "bg-secondary text-white ring-2 ring-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Rp 100.000
                </button>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-white/80">Kembalian:</span>
                <span className="text-headline-sm font-extrabold text-white">
                  {formatRupiah(changeAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Form Keterangan Lapangan */}
          <section className="bg-white rounded-2xl p-4 border border-[#D5CEBF]/40 shadow-sm space-y-3">
            <div>
              <label className="text-xs text-on-surface-variant font-medium block mb-1">
                Catatan Rombongan / Wisatawan
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Rombongan Keluarga Jakarta (6 org)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CEBF] bg-[#FBF7EF]"
              />
            </div>
          </section>

          {/* Blok Kepatuhan & Audit (SKILL §6.9 & PRD FR-05.5) */}
          <section className="rounded-2xl p-3.5 bg-[#FEF7EA] border border-[#B7791F]/30 text-xs text-[#400200] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#B7791F]">
              <span className="material-symbols-outlined text-base fill-icon">gavel</span>
              <span>Perhatian Kepatuhan Keuangan</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Catatan tunai ini berstatus <strong className="font-bold">TERCATAT</strong> dan belum dianggap sebagai setoran kas resmi sebelum rekonsiliasi dan verifikasi fisik pukul 17:00 WIB.
            </p>
          </section>

          {/* Tombol Simpan Kasir Koral Lengket (SKILL §6.9) */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmitCash(false)}
            className="w-full min-h-[54px] bg-brand-coral hover:bg-[#B93624] text-white font-label-lg rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all font-bold"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                <span>Menyimpan ke Database Loket...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">save</span>
                <span>Simpan Catatan Tunai · {formatRupiah(totalAmount)}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
