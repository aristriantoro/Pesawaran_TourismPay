---
name: tourismpay-design
description: Sistem desain "Pesawaran TourismPay" (tiket digital & pembayaran wisata bahari Pulau Pahawang, Kab. Pesawaran, Lampung). Gunakan skill ini setiap kali pengguna meminta layar, halaman, komponen, mockup, atau prototipe HTML/Tailwind untuk aplikasi tiket wisata, QRIS/tunai, e-tiket, pemindai tiket petugas dermaga, sinkronisasi offline, dashboard admin, rekonsiliasi kas, atau laporan pendapatan daerah/BUMDes - atau saat diminta "gaya yang sama dengan TourismPay", "desain wisata bahari", "aplikasi retribusi/tiket dermaga", meskipun tidak menyebut nama skill ini. Mencakup palet warna, tipografi, komponen, pola status, aturan UX lapangan (outdoor, offline-first), dan template kode.
---

# TourismPay Design System

Panduan membuat UI konsisten untuk **Pesawaran TourismPay**: super-app tiket & retribusi wisata bahari. Tiga permukaan produk:

| Permukaan | Pengguna | Perangkat | Lebar |
|---|---|---|---|
| **Wisatawan** | Pembeli tiket (mis. "Rina") | Ponsel | `max-w-[390px]`–`[480px]` |
| **Petugas Dermaga** | Pemindai tiket & kasir tunai (mis. "Budi Santoso") | Ponsel, di bawah terik matahari | `max-w-[420px]`–`[480px]` |
| **Admin / Keuangan** | Loket, Kasie Keuangan, BPKAD | Desktop | target 1440px, sidebar `w-64` |

Output default: **satu file HTML mandiri** + Tailwind CDN + Plus Jakarta Sans + Material Symbols Outlined. Seluruh teks UI dalam **Bahasa Indonesia**.

---

## 1. Prinsip Desain

1. **Terbaca di bawah matahari.** Kontras tinggi, teks gelap di atas permukaan terang, status selalu **ikon + teks** (jangan hanya warna). Anjurkan kecerahan 100% saat QR ditampilkan.
2. **Offline-first.** Sinyal di laut terbatas. Selalu tampilkan status koneksi, antrean sinkron, dan "Tersimpan di Perangkat". Aksi tidak boleh diblokir karena tidak ada sinyal.
3. **Satu aksi utama per layar** - tombol **koral** `#D94530`. Aksi sekunder: outline navy atau tonal teal.
4. **Sentuhan besar.** Min tinggi tombol 44px (sekunder), 48-56px (utama). Petugas: stepper 56px.
5. **Semua state dirancang:** normal, loading (skeleton), kosong, error/gagal, menunggu, berhasil, kedaluwarsa, belum pasti.
6. **Jujur soal uang.** Bedakan "tercatat" vs "terverifikasi sebagai penerimaan daerah"; tampilkan selisih kas dengan jelas; pencatatan tunai ≠ setoran.
7. **Nuansa pesisir resmi:** hangat (kanvas krem), tepercaya (navy), segar (teal), tegas (koral). Bukan dekoratif berlebihan.

---

## 2. Token Warna

### Inti merek
| Peran | Hex | Pemakaian |
|---|---|---|
| Kanvas | `#FBF7EF` | Latar layar ponsel |
| Surface | `#fdf9f1` | Latar desktop / body |
| Navy (primary-container) | `#0B3A5B` | Judul, ikon, kartu saldo, tombol sekunder, nav aktif |
| Navy gelap (primary) | `#00243d` | Sidebar admin, teks heading desktop |
| Teal merek | `#0FA3A3` | Ikon aksen, link, badge PWA, sudut pemindai |
| Teal tua (secondary) | `#006a6a` | Teks/ikon teal di atas putih (kontras), CTA admin |
| Teal muda | `#7ff5f4` (`secondary-container`) | Nav aktif wisatawan, highlight di atas navy |
| **Koral (CTA)** | `#D94530` | Tombol utama, peringatan penting, tanda "perlu ditinjau" |
| Koral hover / active | `#B93624` / `#a62e1e` | State tekan |
| Tepi input | `#D5CEBF` | Border kartu/input hangat |

### Status (selalu pasangan latar + teks)
| Status | Teks/ikon | Latar | Dipakai untuk |
|---|---|---|---|
| Sukses | `#1E7B4F` | `#E8F5EE` | Aktif, Lunas, Valid, Cocok |
| Peringatan | `#B7791F` | `#FEF7EA` | Menunggu, Offline, Belum pasti, Diproses |
| Bahaya | `#D94530` | `#FCECE9` | Batal, Tidak valid, Selisih, Siaga |
| Netral/terpakai | `#64748B` | `#F1F5F9` | Terpakai, Kedaluwarsa |
| Info | `#0B3A5B` | `#CEE5FF` (`primary-fixed`) | Sedang berjalan, kategori |

### Netral hangat (Material-like)
`surface-container-lowest #fff` · `-low #f7f3eb` · `surface-container #f1ede6` · `-high #ece8e0` · `-highest #e6e2da` · `outline #72777e` · `outline-variant #c2c7cf` · `on-surface #1c1c17` · `on-surface-variant #42474e`.

Aturan: teks utama di kartu putih = navy `#0B3A5B`; teks sekunder = `on-surface-variant`; label kecil = `outline`. Jangan pakai hitam murni.

---

## 3. Tipografi

Font: **Plus Jakarta Sans** (400, 500, 600, 700, 800). Ikon: **Material Symbols Outlined**.

| Token Tailwind | Ukuran / line-height | Berat | Pemakaian |
|---|---|---|---|
| `headline-xl` | 32/40, -0.02em | 800 | Total kasir desktop/petugas |
| `headline-xl-mobile` | 26/34 | 800 | Total bayar mobile |
| `headline-lg` | 28/36 | 700 | Angka KPI desktop |
| `headline-lg-mobile` | 24/32 | 700 | Judul hero, saldo |
| `headline-md` | 22/28 | 700 | Judul seksi besar |
| `headline-sm` | 18/24 | 700 | Judul kartu & app bar |
| `body-lg` / `body-md` | 18/28 · 16/24 | 400 | Paragraf |
| `body-sm` | 14/20 | 500 | Deskripsi kartu |
| `label-lg` | 16/20 | 700 | Teks tombol utama |
| `label-md` | 14/18 | 600 | Tombol sekunder, label |
| `label-sm` | 12/16, +0.04em | 700 | Badge, caption, UPPERCASE kecil |

Kode & ID tiket: `font-mono font-bold` (mis. `PHW-20261024-0042`). Angka uang: `font-extrabold tracking-tight`. Teks mikro minimum 10-11px, hanya untuk metadata.

---

## 4. Bentuk, Jarak, Bayangan

- **Radius:** tombol/input `rounded-xl` (12px); kartu mobile `rounded-2xl` (16-20px); kartu besar/sheet `rounded-3xl`; bottom sheet atas `rounded-t-3xl` / `rounded-t-[28px]`; pil/badge `rounded-full`. Desktop kartu: `rounded-xl`/`rounded-2xl`.
- **Jarak:** padding layar `px-4`; antar kartu `gap-4` (mobile) / `gap-5`-`gap-6` (desktop); padding kartu `p-4` (mobile), `p-5`/`p-6` (desktop).
- **Bayangan "coastal"** (bernuansa navy, lembut):
  ```css
  .shadow-coastal-1 { box-shadow: 0 1px 3px rgba(11,58,91,.05), 0 4px 12px rgba(11,58,91,.04); }
  .shadow-coastal-2 { box-shadow: 0 4px 6px -1px rgba(11,58,91,.08), 0 10px 24px -3px rgba(11,58,91,.08); }
  .shadow-bottom-bar { box-shadow: 0 -4px 16px rgba(11,58,91,.08); }
  .outdoor-sheet { box-shadow: 0 -8px 28px rgba(11,58,91,.2); } /* sheet pemindai, kontras tinggi */
  ```
- **Mikro-interaksi:** `active:scale-95` (ikon/chip) atau `active:scale-[0.99]` (tombol lebar), `transition-all duration-150`. Skeleton: gradien `#ece8e0 → #f7f3eb` dengan animasi shimmer 1.5s.

---

## 5. Pola Layout

### 5.1 Mobile (wisatawan & petugas)
- Wrapper: `w-full max-w-[390px|420px|480px] min-h-screen bg-[#FBF7EF] mx-auto`, body `flex justify-center`.
- **Top app bar:** sticky/fixed, `bg-surface`, `shadow-sm`, `px-4 py-3`. Kiri: logo bulat navy (ikon `sailing` teal) + "TourismPay" + sapaan ("Halo, Rina") atau lokasi (`location_on` teal). Kanan: lonceng notifikasi dengan titik koral.
- Halaman tugas (beli, bayar, scan): bar dengan tombol **kembali** bulat 40px + judul `headline-sm` navy + badge resmi kecil ("Resmi", "QRIS Nasional").
- **Bottom nav wisatawan - 3 item:** Beranda · Tiket · Riwayat. Item aktif: pil `bg-secondary-container text-on-secondary-container rounded-xl px-4 py-1.5 font-bold` + ikon `FILL 1`. Tidak aktif: `text-on-surface-variant`. (Varian lama 4 item "Tiket Saya/Bayar/Profil" memakai aktif `bg-primary-container text-white` - utamakan versi 3 item.)
- **Bar CTA lengket bawah** (halaman beli/bayar): `fixed bottom-0`, `bg-white/95 backdrop-blur-md`, `border-t`, `pb-safe` (`env(safe-area-inset-bottom)`), berisi ringkasan total + tombol koral 52px.
- Beri `pb-24`–`pb-36` pada konten agar tidak tertutup bar bawah.

### 5.2 Desktop admin
- **Sidebar** `fixed w-64 h-screen bg-primary text-white p-4`: merek (kotak 40px `bg-primary-container`/`bg-secondary` + ikon `sailing`/`anchor`, "TourismPay" + "Kabupaten Pesawaran"/"Admin Ketapang"), tombol cepat **"Validasi Tiket"** (koral/teal), nav 4 item (**Dashboard, Transaksi, Laporan, Pengaturan**), footer (Bantuan, Keluar - Keluar bernuansa `error-container`).
- Item aktif: `bg-primary-container text-secondary-fixed rounded-xl font-bold` + ikon FILL 1 (opsional garis kiri `border-l-4 border-secondary-fixed`).
- **Top bar** `fixed left-64 right-0 h-16 bg-white shadow-sm border-b`: breadcrumb kecil + judul, filter periode, tombol "Unduh Laporan", lonceng (titik koral), avatar + nama + pos.
- Konten: `ml-64 pt-16 p-8 max-w-[1440px]`, grid KPI 4 kolom (`gap-5`), grafik 8:4 (`grid-cols-12`), tabel penuh.

---

## 6. Komponen Kunci

### 6.1 Tombol
| Jenis | Kelas ringkas |
|---|---|
| **Utama (koral)** | `w-full min-h-[50-56px] bg-[#D94530] hover:bg-[#B93624] text-white rounded-xl font-label-lg flex items-center justify-center gap-2 shadow-md active:scale-[0.99]` + ikon 20-24px |
| Navy solid | `bg-primary-container text-white rounded-xl min-h-[48px]` |
| Outline navy | `bg-white border-2 border-[#0B3A5B] text-primary-container rounded-xl min-h-[44-50px]` |
| Tonal teal | `bg-[#0FA3A3]/10 text-[#0B3A5B] hover:bg-[#0FA3A3]/20 rounded-xl min-h-[44-46px]` (ikon teal) |
| Nonaktif | `bg-surface-container-highest text-outline cursor-not-allowed shadow-none` (ganti label menjelaskan alasannya: "Tiket Habis", "Pilih Tanggal Terlebih Dahulu") |
| Ikon bulat | `w-10 h-10 rounded-full hover:bg-surface-container` |

Label tombol = kata kerja Indonesia: *Beli Tiket, Lanjut Bayar, Cek Status Pembayaran, Lihat E-Tiket, Pindai Berikutnya, Simpan Catatan Tunai, Sinkronkan Sekarang (7)*.

### 6.2 Badge status
`inline-flex items-center gap-1 px-2.5-3 py-1 rounded-full text-label-sm font-bold` + ikon `check_circle`(FILL 1)/`schedule`/`cancel`/`timer_off`/`done_all`/`warning`. Warna dari tabel §2.

### 6.3 Kartu hero produk
Gambar `h-48 object-cover` dengan gradien `from-[#0B3A5B]/80 via-transparent to-black/20`, tag melayang kiri atas ("Wisata Bahari Resmi" + ikon `verified` teal, `bg-white/90 backdrop-blur`), caption lokasi kiri bawah. Isi: judul `headline-lg-mobile`, deskripsi, baris tarif (`Rp 25.000 / orang`), tombol koral.

### 6.4 Kartu saldo
`bg-primary-container text-white rounded-2xl p-4`; label `#A4CAF2` UPPERCASE kecil; angka `headline-lg-mobile font-extrabold`; ikon dompet dalam lingkaran `bg-white/10`; dua tombol: **Isi Saldo** (teal `#0FA3A3`) & **Riwayat Bayar** (`bg-white/10`).

### 6.5 Tiket digital / boarding pass
- Kartu putih `rounded-3xl` (atau `2xl`), bagian atas: kategori UPPERCASE teal, rute "Dermaga Ketapang → Pulau Pahawang", badge status, kode.
- **Garis sobekan:** `border-b-2 border-dashed` dengan dua **takik** lingkaran 24px (`-left-12px` / `-right-12px`) berwarna sama dengan latar kanvas:
  ```css
  .ticket-notch-l,.ticket-notch-r{position:absolute;top:50%;transform:translateY(-50%);width:24px;height:24px;border-radius:9999px;background:#FBF7EF}
  .ticket-notch-l{left:-12px}.ticket-notch-r{right:-12px}
  ```
- **QR:** di kotak putih berpadding `p-3`, border `surface-container-high`, warna modul navy `#0B3A5B` (opsional aksen teal), emblem pusat dengan border teal; ukuran 176-208px; kode pemesanan mono di bawahnya + tombol "Perbesar".
- Grid detail 2 kolom (Tanggal, Waktu/Titik Kumpul, Jumlah Pengunjung, Nama Pemesan).
- Chip **"Tersimpan di Perangkat · Siap Pakai"** (teal muda `#e4f7f7`, border `#a1e5e5`, ikon `offline_pin`).
- Banner tips luar ruang (kuning `#FEF7EA`): "Naikkan kecerahan layar ke 100%".
- **State tiket:** Aktif (hijau) · Terpakai (stempel miring `-14deg` "TERPAKAI" + waktu & petugas, QR `opacity-40`) · Dibatalkan (stempel koral "DIBATALKAN / REFUND TERPROSES", kartu `grayscale-[35%] opacity-80`).
- Aksi: "Tampilkan Layar Penuh (Max Kecerahan)" koral; "Simpan Gambar Tiket ke Galeri" outline navy.

### 6.6 Beli tiket
Kartu layanan (thumbnail 96px + badge "Wisata Bahari Resmi" & "Termasuk Asuransi" + harga teal) → pemilih tanggal (kartu tanggal terpilih + **kuota** badge hijau "Sisa 120 tiket", chip cepat 4 kolom; chip aktif `bg-primary-container text-white`) → **stepper** jumlah (min 1, maks 10, tombol 44px; plus = navy solid, minus = putih) → rincian harga (baris label/nilai, "Biaya Layanan & Asuransi: Rp 0 (Termasuk)" hijau, total `headline-xl-mobile`) → tautan "Ketentuan pembatalan" → bar CTA lengket. State demo: **Tersedia / Kuota Habis / Belum Pilih Tanggal**.

### 6.7 Pembayaran QRIS
- Kartu status + **hitung mundur** (`bg-[#FCECE9]`, teks koral, format `MM:SS`, 15 menit).
- Kartu QR putih: logo "QRIS" merah `#ED1C24`, NMID, QR navy, total besar, **Kode Pesanan** pil mono + tombol salin (toast hijau "Kode pesanan berhasil disalin!"), tombol *Simpan QR* & *Bagikan*.
- "Cara Pembayaran Cepat" 3 langkah (lingkaran navy bernomor).
- **Empat state:** Menunggu · Berhasil (centang besar hijau, ID transaksi) · Kedaluwarsa (QR buram + overlay, info refund 1x24 jam, tombol *Pesan Ulang*) · **Belum Pasti** (kuning, peringatan **"Jangan bayar ulang, cek status dulu"**, tombol *Muat Ulang Status* + *Hubungi Petugas Loket*).

### 6.8 Pemindai tiket petugas
- Susunan atas→bawah: bar simulasi (opsional, `#061826`) → **banner offline amber** (`#FFF3DC`, "Offline · Data tersimpan di perangkat", "Belum tersinkron (3 tiket menunggu sinyal)", tombol *Sinkron*) → header navy (nama dermaga, pintu, petugas, tombol senter & ganti kamera 40px) → viewfinder penuh dengan vinyet, **reticle 240px** bersudut teal 4px, garis laser animasi `#00F0FF`, pil instruksi "Arahkan ke kode QR tiket", label "Database Lokal Siap" → **bottom result sheet** `rounded-t-3xl`.
- **Hasil pindai (3 state):**
  - **VALID** - hijau `#1E7B4F`, kotak ikon 44px, judul "TIKET VALID" 22px/800, badge "Sah Masuk", detail layanan/jumlah/tanggal/pemesan (nomor disamarkan `0812-****-3310`)/kode; catatan "Disimpan Lokal"; tombol koral **Pindai Berikutnya**; sekunder *Lihat Detail Penumpang & Dokumen* (modal manifest + NIK + asuransi).
  - **SUDAH DIPAKAI** - amber; waktu validasi, petugas, ID; tombol *Laporkan Duplikasi / Investigasi* (outline koral).
  - **TIDAK VALID** - koral; "Kode QR Tidak Dikenali Sistem"; *Coba Pindai Ulang* + *Input Kode Tiket Manual*.

### 6.9 Catat pembayaran tunai (petugas)
Kartu layanan + tarif dasar → stepper **besar** (56px) + tombol cepat `1 Org / +2 / +5 / +10` → kartu navy kalkulasi (`2 × Rp 25.000`, TOTAL PEMBAYARAN TUNAI `headline-xl`, pilihan *Uang Pas* / *Uang Rp 100.000* + kembalian) → input Kode Pesanan (+ tombol *Pindai*) & Catatan Lapangan → blok audit (inisial petugas, ID Kasir, waktu sistem, **Perhatian Kepatuhan**: belum disetor ke kas) → footer lengket koral "Simpan Catatan Tunai · Rp …". State: **Form · Tersimpan (resi "Menunggu Sinkron · TUN-0007", QR sementara, cetak Bluetooth) · Peringatan duplikat** (banner amber "Mungkin Sudah Tercatat!", *Tetap Simpan* / *Cek Riwayat*).

### 6.10 Status sinkronisasi
Banner status dinamis + metrik 3 kolom (Antrean / Gagal Kirim / Terakhir) + daftar antrean (ikon `qr_code_scanner` navy / `payments` teal, badge "Menunggu", item konflik berbingkai merah "Perlu Ditinjau") + CTA lengket. **Empat state:** Offline (amber) · Proses (teal, progress bar, spinner, tombol nonaktif "Mengunggah Berkas (4/7)…") · Lunas/Tersinkron (hijau, antrean `opacity-40`) · Putus Total (merah, tombol nonaktif, auto-aktif saat sinyal pulih). Hitung mundur "Pemeriksaan ulang otomatis 00:18" + tautan *Cek Sekarang*.

### 6.11 Riwayat transaksi (wisatawan)
Kartu `rounded-[20px]` dengan **strip warna kiri 6px** sesuai status: Menunggu `#B7791F` (+ countdown & tombol *Bayar* koral) · Lunas `#1E7B4F` · Dibatalkan `#D94530` (nominal dicoret) · Kedaluwarsa `#64748B` (`opacity-90`). Tap → **bottom sheet "Rincian Transaksi"** (badge status, layanan, kode booking mono teal, waktu, metode, total) dengan aksi menyesuaikan status. State kosong: ikon `receipt_long` di lingkaran krem + "Belum ada transaksi" + tombol *Jelajahi Wisata Pahawang*. Footer: "Dikelola resmi oleh BUMDes Wisata Bahari Pesawaran".

### 6.12 Dashboard admin
- **4 KPI** (`rounded-2xl p-5 shadow-coastal-1`): Nilai Transaksi Tercatat (+ tren hijau), Pengunjung, Tiket Terpakai (% divalidasi), **Perlu Ditinjau** (latar `#FCECE9`, border koral 2px, badge **SIAGA**, ikon `warning` transparan di sudut).
- **Grafik tren** (SVG kurva halus, garis teal 3px, gradien area `#0FA3A3` 30%→0, titik putih border teal; **puncak akhir pekan = titik koral** + label), donut metode bayar (QRIS teal 62% / Tunai navy 38%) dengan rincian nominal.
- Banner kepatuhan resmi ("Nilai tercatat, belum diverifikasi sebagai penerimaan daerah sebelum rekonsiliasi - cut-off 17.00 WIB").
- Tabel aktivitas: header `text-xs uppercase`, baris `hover:bg-surface-container-low`, baris bermasalah `bg-[#FCECE9]/40` + tombol koral *Verifikasi*.
- State: **Data Normal · Memuat (Skeleton) · Data Kosong**.

### 6.13 Transaksi & rekonsiliasi
KPI (Transaksi Sistem · Settlement/Setoran · **Total Selisih Kas** merah · Status Rekon "99.8% Cocok" + progress) → bar filter (cari, periode, metode, status, *Ekspor*, *Cocokkan*; chip mitra: Bank Lampung (QRIS), BUMDes Tunai Pos 1/2) → tabel jurnal (kolom: Kode, Waktu, Metode, Nominal Sistem, Settlement, Selisih, Status Rekon, Aksi). **Baris selisih:** `bg-[#FFF5F4] border-l-4 border-[#D94530]`, ikon `warning`, label "INVESTIGASI AKTIF", selisih `-Rp 25.000` koral, badge berdenyut, tombol *Tinjau* → **drawer investigasi 410px** (perbandingan sistem vs fisik, metadata petugas/waktu, selektor Status Tindak Lanjut 3 segmen *Belum Ditinjau/Diproses/Selesai*, catatan investigasi, tombol *Simpan Catatan & Tindak Lanjut* koral + *Tandai Selesai* outline). State kosong: "Data Rekonsiliasi Tidak Ditemukan" + *Reset Semua Filter*.

### 6.14 Laporan pendapatan
Filter (periode, kategori, metode) + **Ekspor CSV** (outline) + **Ekspor PDF Resmi** (koral) → 4 kartu (Nilai Transaksi Tercatat · Pengembalian Dana · Nilai Bersih · **Verifikasi Penerimaan Daerah = "Menunggu Validasi"** kuning) → tabel mingguan (QRIS & Tunai nominal + volume, Total Kotor, Potongan/Refund, Total Bersih, Status Rekonsiliasi: hijau "Terekonsiliasi 100%", kuning "94% Cocok (Selisih Ditinjau)", biru "Sedang Berjalan"; `<tfoot>` total kumulatif) → footer sumber & waktu pembaruan.

---

## 7. Ikon yang Dipakai (Material Symbols)

`sailing` (logo) · `anchor` · `location_on` · `confirmation_number` · `qr_code_scanner` · `qr_code_2` · `receipt_long` · `payments` · `account_balance_wallet` · `home` · `history` · `offline_pin` · `cloud_off` · `cloud_done` · `sync` · `wifi_off` · `verified` · `verified_user` · `check_circle` · `cancel` · `timer` · `timer_off` · `schedule` · `hourglass_top` · `warning` · `priority_high` · `info` · `directions_boat` · `scuba_diving` · `water_drop` · `calendar_today` · `download` · `share` · `content_copy` · `flash_on/off` · `flip_camera_ios` · `support_agent` · `dashboard` · `bar_chart` · `settings` · `notifications` · `group`.
Default `font-variation-settings: 'FILL' 0,'wght' 500,'GRAD' 0,'opsz' 24`; gunakan `FILL 1` untuk ikon status/nav aktif.

---

## 8. Konten & Format Data

- **Mata uang:** `Rp 25.000`, `Rp 18.450.000` (titik ribuan, `toLocaleString('id-ID')`); negatif `-Rp 25.000` atau `−Rp 25.000`.
- **Tanggal:** `Sabtu, 24 Okt 2026`, `24 Okt 2026 · 08:30 WIB` (selalu **WIB**), periode `Okt 2026`, rentang `1 - 7 Okt 2026`.
- **Kode:** tiket/pesanan `PHW-YYYYMMDD-NNNN` (mis. `PHW-20261024-0042`); tunai `TUN-YYYYMMDD-NNNN` (tampilan singkat `TUN-0007`); ID dialog `#TK-88391`, `TRX-77491-ID`; singkat `PHW-…0042`.
- **Data pribadi:** samarkan nomor ponsel (`0812-****-3310`); NIK hanya di modal manifest untuk petugas.
- **Lokasi/produk contoh:** Dermaga Ketapang → Pulau Pahawang (Besar/Kecil), Pulau Kelagian, Dermaga Jelarangan; Tiket Masuk Rp 25.000/orang; Snorkeling Rp 35.000; Sewa Alat & Life Jacket Rp 50.000; Retribusi Konservasi Laut Rp 15.000. Lembaga: Pemkab Pesawaran, BUMDes, Bank Lampung, BPKAD, Jasa Raharja Putra.
- **Nada bahasa:** ringkas, ramah-resmi, kalimat aktif ("Simpan tiket ke galeri sebelum menyeberang karena sinyal di tengah laut terbatas."). Pesan error menjelaskan **apa yang terjadi + langkah selanjutnya**.
- **Peringatan lapangan** (kuning, ikon `warning` koral): ditaruh paling atas beranda.

---

## 9. Pola State (wajib dipertimbangkan)

Sediakan **pengalih state demo** di bagian atas prototipe (segmented control kecil) agar semua state bisa diperiksa:
- Wisatawan: Aktif/Kosong; Tersedia/Kuota Habis/Belum Pilih; Menunggu/Berhasil/Kedaluwarsa/Belum Pasti; Aktif/Terpakai/Dibatalkan.
- Petugas: Valid/Dipakai/Tidak Valid; Form/Tersimpan/Peringatan; Offline/Proses/Lunas/Putus Total.
- Admin: Normal/Memuat/Kosong.

Setiap state kosong = ikon dalam lingkaran + judul + 1 kalimat penjelas + 1 tombol aksi.

---

## 10. Aksesibilitas & Kualitas

- `lang="id"`, `aria-label` pada tombol ikon ("Kembali", "Notifikasi", "Kurangi Pengunjung").
- Viewport mobile: `width=device-width, initial-scale=1.0` (+ `viewport-fit=cover` untuk layar berponi).
- Kontras: teks teal di atas putih gunakan `#006a6a`; `#0FA3A3` hanya untuk ikon/aksen/latar tipis.
- Jangan mengandalkan warna saja; hindari teks < 11px kecuali metadata.
- Hindari `localStorage` bila di lingkungan artifact; simpan di variabel JS. Untuk produk nyata, rancang penyimpanan offline (IndexedDB/SQLite) dan tampilkan statusnya.
- Hindari kesalahan konsistensi data pada contoh (mis. total tiket & nominal harus cocok: 2 × Rp 25.000 = Rp 50.000).

---

## 11. Template Awal (salin)

```html
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>Pesawaran TourismPay</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
tailwind.config = {
  darkMode: "class",
  theme: { extend: {
    colors: {
      "primary":"#00243d","primary-container":"#0b3a5b","on-primary":"#ffffff","on-primary-container":"#7ea4cb",
      "primary-fixed":"#cee5ff","primary-fixed-dim":"#a4caf2",
      "secondary":"#006a6a","secondary-container":"#7ff5f4","on-secondary-container":"#007070",
      "secondary-fixed":"#7ff5f4","secondary-fixed-dim":"#60d8d8","on-secondary":"#ffffff",
      "tertiary":"#4c0200","tertiary-container":"#740600","on-tertiary-fixed-variant":"#900d02",
      "error":"#ba1a1a","error-container":"#ffdad6","on-error-container":"#93000a",
      "background":"#fdf9f1","surface":"#fdf9f1","on-surface":"#1c1c17","on-surface-variant":"#42474e",
      "surface-container-lowest":"#ffffff","surface-container-low":"#f7f3eb","surface-container":"#f1ede6",
      "surface-container-high":"#ece8e0","surface-container-highest":"#e6e2da","surface-variant":"#e6e2da",
      "outline":"#72777e","outline-variant":"#c2c7cf","inverse-surface":"#31302b",
      "brand-navy":"#0B3A5B","brand-teal":"#0FA3A3","brand-coral":"#D94530",
      "status-success":"#1E7B4F","status-warning":"#B7791F","status-danger":"#D94530","status-used":"#64748B"
    },
    borderRadius: { DEFAULT:"0.25rem", lg:"0.5rem", xl:"0.75rem", "2xl":"1.25rem", "3xl":"1.5rem", full:"9999px" },
    fontFamily: Object.fromEntries(
      ["headline-xl","headline-xl-mobile","headline-lg","headline-lg-mobile","headline-md","headline-sm",
       "body-lg","body-md","body-sm","label-lg","label-md","label-sm"].map(k=>[k,["Plus Jakarta Sans"]])),
    fontSize: {
      "headline-xl":["32px",{lineHeight:"40px",letterSpacing:"-0.02em",fontWeight:"800"}],
      "headline-xl-mobile":["26px",{lineHeight:"34px",letterSpacing:"-0.02em",fontWeight:"800"}],
      "headline-lg":["28px",{lineHeight:"36px",letterSpacing:"-0.015em",fontWeight:"700"}],
      "headline-lg-mobile":["24px",{lineHeight:"32px",letterSpacing:"-0.015em",fontWeight:"700"}],
      "headline-md":["22px",{lineHeight:"28px",fontWeight:"700"}],
      "headline-sm":["18px",{lineHeight:"24px",fontWeight:"700"}],
      "body-lg":["18px",{lineHeight:"28px",fontWeight:"400"}],
      "body-md":["16px",{lineHeight:"24px",fontWeight:"400"}],
      "body-sm":["14px",{lineHeight:"20px",fontWeight:"500"}],
      "label-lg":["16px",{lineHeight:"20px",fontWeight:"700"}],
      "label-md":["14px",{lineHeight:"18px",fontWeight:"600"}],
      "label-sm":["12px",{lineHeight:"16px",letterSpacing:"0.04em",fontWeight:"700"}]
    }
  }}
}
</script>
<style>
  body{font-family:'Plus Jakarta Sans',sans-serif;-webkit-tap-highlight-color:transparent}
  .material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 500,'GRAD' 0,'opsz' 24;display:inline-block;vertical-align:middle;line-height:1}
  .fill-icon{font-variation-settings:'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 24}
  .shadow-coastal-1{box-shadow:0 1px 3px rgba(11,58,91,.05),0 4px 12px rgba(11,58,91,.04)}
  .shadow-coastal-2{box-shadow:0 4px 6px -1px rgba(11,58,91,.08),0 10px 24px -3px rgba(11,58,91,.08)}
  .pb-safe{padding-bottom:env(safe-area-inset-bottom,16px)}
</style>
</head>
<body class="bg-[#FBF7EF] text-on-surface antialiased min-h-screen flex justify-center">
  <main class="w-full max-w-[420px] min-h-screen bg-[#FBF7EF] relative flex flex-col pb-28">
    <!-- header → konten → CTA/bottom nav sesuai §5-§6 -->
  </main>
</body>
</html>
```

### Cuplikan komponen

```html
<!-- Tombol utama koral -->
<button class="w-full min-h-[52px] bg-[#D94530] hover:bg-[#B93624] active:scale-[0.99] text-white font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-2 shadow-md transition-all">
  <span class="material-symbols-outlined text-[22px]">local_activity</span><span>Beli Tiket</span>
</button>

<!-- Badge sukses -->
<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F5EE] text-[#1E7B4F] font-label-sm text-label-sm">
  <span class="material-symbols-outlined text-base fill-icon">check_circle</span>Lunas
</span>

<!-- Banner peringatan lapangan -->
<section class="rounded-2xl p-3.5 bg-[#FEF7EA] border border-[#B7791F]/30 shadow-sm flex items-start gap-3">
  <span class="material-symbols-outlined fill-icon text-[#D94530] text-xl mt-0.5">warning</span>
  <p class="font-body-sm text-body-sm text-[#400200]"><strong class="text-[#D94530]">Perhatian:</strong> Simpan tiket ke galeri sebelum menyeberang karena sinyal di tengah laut terbatas.</p>
</section>

<!-- Item bottom nav aktif / tidak aktif (wisatawan) -->
<a class="flex flex-col items-center bg-secondary-container text-on-secondary-container rounded-xl px-4 py-1.5 font-bold" href="#">
  <span class="material-symbols-outlined fill-icon text-[22px]">home</span><span class="text-label-sm font-label-sm mt-0.5">Beranda</span>
</a>
<a class="flex flex-col items-center text-on-surface-variant hover:text-primary px-4 py-1.5 font-medium" href="#">
  <span class="material-symbols-outlined text-[22px]">confirmation_number</span><span class="text-label-sm font-label-sm mt-0.5">Tiket</span>
</a>

<!-- Stepper jumlah pengunjung -->
<div class="flex items-center gap-2 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/30">
  <button class="w-11 h-11 rounded-xl bg-white text-primary-container shadow-sm disabled:opacity-40" aria-label="Kurangi Pengunjung"><span class="material-symbols-outlined">remove</span></button>
  <span class="w-9 text-center font-headline-sm text-primary-container">2</span>
  <button class="w-11 h-11 rounded-xl bg-primary-container text-white shadow-sm disabled:opacity-40" aria-label="Tambah Pengunjung"><span class="material-symbols-outlined">add</span></button>
</div>
```

---

## 12. Alur Kerja saat Memakai Skill Ini

1. Tentukan **permukaan** (wisatawan / petugas / admin) → pilih lebar & pola nav (§5).
2. Daftar **state** yang perlu ada (§9) dan sertakan pengalih demo.
3. Susun layar dari komponen §6; pakai token §2-§4 (jangan mengarang warna baru).
4. Pastikan satu CTA koral, status berikon+teks, data terformat Indonesia (§8).
5. Tambahkan interaksi ringan dengan JS vanilla (hitung total, ganti state, toast, hitung mundur) - tanpa penyimpanan browser.
6. Periksa daftar: kontras luar ruang · target sentuh ≥44px · konsistensi angka · teks Indonesia · kondisi offline terlihat.
