# Pesawaran TourismPay — MVP Web Wisata Bahari Pulau Pahawang

Sistem Reservasi Terpadu, E-Tiket QR Digital, Pembayaran QRIS/Tunai, Rekonsiliasi Kas, dan Transparansi Pendapatan Asli Daerah (PAD) Wisata Bahari Pulau Pahawang, Kabupaten Pesawaran, Provinsi Lampung.

---

## 🌟 3 Permukaan Aplikasi

Aplikasi dibangun responsif untuk tiga target pengguna sesuai spesifikasi **PRD** dan **TourismPay Design System (SKILL.md)**:

1. **Wisatawan (`max-w-[420px]` Mobile)**
   - **Beranda (`/`)**: Hero wisata bahari resmi, peringatan sinyal lapangan laut, katalog layanan, kuota hari ini.
   - **Beli Tiket (`/pesan/[serviceId]`)**: Pemilih tanggal (chip 4 hari), stepper jumlah tiket 1-10, kalkulasi harga transparan (asuransi resmi gratis), pencegahan *oversell* atomik.
   - **Pembayaran QRIS (`/bayar/[code]`)**: Simulator QRIS Bank Lampung (*Mode Simulasi*), countdown 15 menit, penanganan 4 state (`MENUNGGU`, `BERHASIL`, `KEDALUWARSA`, `PAYMENT_UNKNOWN` "Jangan bayar ulang, cek status dulu").
   - **E-Tiket Boarding Pass (`/tiket/[ticketCode]`)**: Tiket digital dengan takik sobekan khas (*ticket notches*), modul QR navy beresolusi tinggi (hanya berisi hash token acak tanpa data pribadi terbuka), mode kecerahan 100%, 3 state visual (*Aktif*, *Terpakai* stempel miring -14°, *Dibatalkan/Refund*).
   - **Riwayat Transaksi (`/riwayat`)**: Daftar pesanan dengan strip warna status 6px di sisi kiri dan *bottom sheet* rincian transaksi.

2. **Petugas Dermaga (`max-w-[480px]` Mobile Luar Ruang)**
   - **Portal Petugas (`/petugas`)**: Dashboard operasional pos pintu dermaga.
   - **Pindai Tiket (`/petugas/scan`)**: *Viewfinder* kontras tinggi outdoor dengan reticle 240px sudut teal, laser animasi `#00F0FF`, 3 hasil pemindaian (*VALID*, *SUDAH DIPAKAI*, *TIDAK VALID*), serta modal manifes penumpang dan asuransi.
   - **Catat Kas Tunai (`/petugas/tunai`)**: Stepper besar 56px, tombol cepat `1 Org / +2 / +5 / +10`, kartu kalkulasi navy, kalkulator kembalian, deteksi pencegahan kas dobel, banner kepatuhan "*Tercatat ≠ Disetor*".
   - **Status Sinkronisasi (`/petugas/sinkron`)**: Manajemen PWA offline (Dexie IndexedDB), 4 state koneksi, metrik antrean, penanganan resolusi konflik (*SIAGA Koral "Perlu Ditinjau"*).
   - **Manifes Penumpang (`/petugas/manifest`)**: Daftar penumpang jadwal keberangkatan kapal rute Dermaga Ketapang ↔ Pulau Pahawang.

3. **Admin / Pemda / Auditor (Desktop 1440px)**
   - **Dashboard Eksekutif (`/admin`)**: 4 Kartu KPI, Kartu SIAGA Koral (*Perlu Ditinjau*), grafik kurva halus SVG dengan penanda puncak akhir pekan, donut chart rasio QRIS (62%) vs Tunai (38%), tabel aktivitas real-time.
   - **Transaksi & Rekonsiliasi (`/admin/transaksi`)**: Jurnal pencocokan sistem vs setoran fisik, baris selisih berdenyut merah, **Drawer Investigasi 410px** 3-tahap (*Belum Ditinjau*, *Diproses*, *Selesai*).
   - **Laporan Pendapatan Daerah (`/admin/laporan`)**: Pemisahan tegas antara Omzet Kotor, Refund, Pendapatan Bersih Mitra, dan Retribusi Daerah (PAD) berlabel kuning **"Menunggu Validasi BPKAD"**, tombol ekspor CSV resmi.
   - **Katalog & Tarif (`/admin/katalog`)**: Audit trail riwayat penetapan harga dan kuota.
   - **Pengguna & Peran (`/admin/pengguna`)**: Matriks RBAC dan batasan wewenang (*scope provider*).
   - **Audit Trail (`/admin/audit`)**: Log kronologis seluruh mutasi penting sistem.

---

## 🔑 Akun & Kredensial Demo

| Peran | Nama Pengguna | Email | Password | Wewenang Utama |
|---|---|---|---|---|
| **Wisatawan** | Rina Wijaya | `rina@example.com` | `password123` | Beli tiket, bayar QRIS, lihat e-tiket & riwayat |
| **Petugas Dermaga** | Budi Santoso | `petugas@ketapang.id` | `password123` | Pindai tiket, catat kas tunai pos 1, sinkronisasi offline |
| **Pengelola BUMDes** | Pak Andi | `admin@bumdes.id` | `password123` | Atur kuota & tarif, rekonsiliasi kas BUMDes, laporan |
| **Admin Pemda / BPKAD** | Ibu Sri Rahayu | `pemda@pesawarankab.go.id` | `password123` | Validasi PAD, audit jurnal rekonsiliasi, ekspor laporan |
| **Auditor Inspektorat** | Hendra | `auditor@pesawarankab.go.id` | `password123` | Penelusuran audit log, integritas data mutasi |

---

## 🧪 10 Skenario Pengujian Wajib (Lulus 100%)

Semua 10 skenario pengujian bisnis kritis yang diwajibkan PRD telah diuji menggunakan **Vitest**:

```bash
npm test
```

Hasil eksekusi:
```text
 ✓ tests/mandatory_scenarios.test.ts (10 tests)
   ✓ Skenario 1: Rebutan kuota terakhir - hanya 1 yang berhasil, anti-oversell
   ✓ Skenario 2: Webhook notifikasi ganda - diproses idempoten tanpa tiket duplikat
   ✓ Skenario 3: Bayar setelah kedaluwarsa - tiket tidak otomatis terbit, masuk antrean
   ✓ Skenario 4: PAYMENT_UNKNOWN - status pesanan tetap pending dan tidak menerbitkan tiket
   ✓ Skenario 5: Scan ganda dua perangkat offline - terdeteksi konflik masuk antrean Perlu Ditinjau
   ✓ Skenario 6: Sinkron ulang antrean tanpa duplikasi data
   ✓ Skenario 7: Deteksi pencatatan tunai ganda dalam rentang waktu singkat
   ✓ Skenario 8: Perubahan tarif katalog tidak mengubah snapshot pesanan lama
   ✓ Skenario 9: Akses lintas peran (RBAC) dibatasi sesuai wewenang
   ✓ Skenario 10: Selisih rekonsiliasi kas terdeteksi dan memicu status DISCREPANCY

Test Files: 1 passed (1)
Tests:      10 passed (10)
```

---

## ⚙️ Penanganan Open Questions PRD §10 (`OQ-01` – `OQ-13`)

Seluruh pertanyaan terbuka dikonfigurasikan di [`src/config/tourismpay.config.ts`](file:///f:/Kuliah/Semester%205/PPSI/Aplikasi_Pesawaran_TourismPay/src/config/tourismpay.config.ts):

- `OQ-01`: Operator resmi: **BUMDes Wisata Bahari Pesawaran** & Pemkab Pesawaran.
- `OQ-02`: Titik pilot: **Dermaga Ketapang ↔ Pulau Pahawang Besar/Kecil, Pulau Kelagian, Dermaga Jelarangan**.
- `OQ-03`: Klasifikasi tiket: Retribusi Daerah (PAD 40%) vs Jasa Usaha Pengelola (60%).
- `OQ-04`: Adapter mock PJP berizin Bank Lampung (`Mode Simulasi`).
- `OQ-05`: Model pemesanan satu pintu terpadu.
- `OQ-06`: Pembatalan & refund dapat diajukan H-1 keberangkatan.
- `OQ-07`: Durasi penahanan kuota pesanan: 15 menit (900 detik hitung mundur).
- `OQ-08`: Lingkup offline dibatasi pada verifikasi tiket lokal, kasir tunai, dan manifes penumpang.
- `OQ-10`: Ekspor laporan resmi Pemda tersedia dalam format CSV berstandar audit.
- `OQ-11`: QR code hanya memuat token hash acak (SHA-256) tanpa NIK/data terbuka; nomor ponsel disamarkan (`0812-****-3310`).
- `OQ-13`: Jadwal operasional harian dengan cut-off rekonsiliasi kas pukul **17:00 WIB**.

---

## 🚀 Panduan Menjalankan Aplikasi

### Cara Tercepat di Windows:
Cukup klik ganda (double-click) file **`run.cmd`** di folder proyek ini, atau jalankan via terminal:
```cmd
run.cmd
```
*Script ini otomatis mendeteksi Node.js, menyiapkan database jika belum ada, membebaskan port bila terpakai, dan membuka browser di `http://localhost:3000`.*

---

### Manual Setup & Commands:
```bash
# 1. Setup Database & Seed
npx prisma db push
npx tsx prisma/seed.ts

# 2. Menjalankan Server Development
npm run dev

# 3. Menjalankan Server Production
npm run build
npm start
```

Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 📁 Struktur Direktori Utama

```
src/
├── config/
│   └── tourismpay.config.ts       # Konfigurasi OQ-01 s.d. OQ-13
├── lib/
│   ├── formatters.ts              # Format Rupiah, WIB, Phone masking (SKILL §8)
│   ├── prisma.ts                  # PrismaClient singleton
│   ├── payments/
│   │   └── provider.ts            # PaymentProvider mock adapter Bank Lampung
│   └── offline/
│       └── db.ts                  # Dexie.js IndexedDB schema
├── components/
│   ├── TouristHeader.tsx          # Top bar wisatawan & logo resmi
│   ├── TouristNavigation.tsx      # Bottom nav 3 item (Beranda, Tiket, Riwayat)
│   ├── FieldWarningBanner.tsx     # Banner tips lapangan sinyal laut
│   └── StatusBadge.tsx            # Badge status berstandar SKILL §2 & §6.2
└── app/
    ├── page.tsx                   # Wisatawan: Beranda & Katalog
    ├── pesan/[serviceId]/         # Wisatawan: Beli Tiket & Kuota Realtime
    ├── bayar/[code]/              # Wisatawan: QRIS Simulator 4 State
    ├── tiket/[ticketCode]/        # Wisatawan: E-Tiket Boarding Pass Sobekan
    ├── riwayat/                   # Wisatawan: Riwayat Strip 6px & Bottom Sheet
    ├── petugas/                   # Petugas: Shell & Portal Dermaga
    │   ├── scan/                  # Petugas: Viewfinder Reticle & Manifes
    │   ├── tunai/                 # Petugas: Kasir Stepper 56px & Deteksi Dobel
    │   ├── sinkron/               # Petugas: PWA Sync & Resolusi Konflik
    │   └── manifest/              # Petugas: Manifes Kapal Berangkat
    ├── admin/                     # Admin: Shell Desktop w-64 Sidebar
    │   ├── page.tsx               # Admin: Dashboard 4 KPI, SVG Curve, Donut
    │   ├── transaksi/             # Admin: Jurnal Rekonsiliasi & Drawer 410px
    │   ├── laporan/               # Admin: Laporan PAD "Menunggu Validasi"
    │   ├── katalog/               # Admin: Katalog & Riwayat Tarif
    │   ├── pengguna/              # Admin: RBAC & Provider Scoping
    │   └── audit/                 # Admin: Audit Log Mutasi Kritis
    └── api/                       # API Routes (Reservasi atomik, QRIS, Sinkronisasi)
```
