/**
 * Konfigurasi Utama Pesawaran TourismPay
 * Mengakomodasi Open Questions (PRD §10) sebagai opsi konfigurasi eksplisit dengan default yang aman.
 */

export const TOURISM_PAY_CONFIG = {
  // OQ-01: Operator resmi sistem (Menentukan kontrak, tata kelola, dan kewenangan)
  OPERATOR_NAME: "BUMDes Wisata Bahari Pesawaran",
  PEMDA_NAME: "Pemerintah Kabupaten Pesawaran",
  BPKAD_DEPARTMENT: "Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD) Pesawaran",

  // OQ-02: Destinasi, titik tiket, dan jenis layanan yang masuk pilot Pahawang
  PILOT_LOCATIONS: [
    { id: "ketapang", name: "Dermaga Ketapang", type: "PORT_ORIGIN" },
    { id: "phw-besar", name: "Pulau Pahawang Besar", type: "DESTINATION" },
    { id: "phw-kecil", name: "Pulau Pahawang Kecil", type: "DESTINATION" },
    { id: "kelagian", name: "Pulau Kelagian", type: "DESTINATION" },
    { id: "jelarangan", name: "Dermaga Jelarangan", type: "PORT_DESTINATION" },
  ],

  // OQ-03: Klasifikasi tiket resmi (Retribusi resmi PAD vs Tiket jasa usaha)
  REVENUE_CLASSIFICATION_DEFAULT: "RETRIBUSI_DAN_JASA_TERPADU",
  PAD_RETRIBUTION_PERCENTAGE: 40, // 40% dialokasikan untuk retribusi PAD daerah, 60% jasa operasional BUMDes/Mitra

  // OQ-04: Mitra PJP / Bank QRIS
  PAYMENT_PROVIDER_MODE: "MOCK_SIMULATION",
  PAYMENT_PROVIDER_NAME: "Bank Lampung QRIS Adapter (Mode Simulasi)",
  QRIS_NMID: "ID1020268849102",

  // OQ-05: Model pembayaran (Pemesanan satu pintu terpadu)
  PAYMENT_MODEL: "SINGLE_INTEGRATED_CHECKOUT",

  // OQ-06: Kebijakan pembatalan dan pengembalian dana (Refund)
  CANCELLATION_DEADLINE_HOURS: 24, // Maksimal H-1 sebelum tanggal layanan
  ALLOW_ONLINE_REFUND: true,
  REFUND_ADMIN_FEE_IDR: 0, // Bebas biaya admin selama masa uji coba

  // OQ-07: Durasi penahanan kuota pesanan belum bayar (Hold Timeout)
  RESERVATION_HOLD_TIMEOUT_SECONDS: 900, // 15 Menit (15:00)

  // OQ-08: Cakupan fungsional mode offline
  OFFLINE_CAPABILITIES: [
    "TICKET_VERIFICATION",
    "CASH_RECORDING",
    "PASSENGER_MANIFEST",
  ] as const,

  // OQ-09: Platform target
  PLATFORM_TARGET: "RESPONSIVE_WEB_PWA",

  // OQ-10: Format ekspor laporan resmi Pemda
  REPORT_EXPORT_FORMATS: ["CSV", "EXCEL_CSV", "PRINT_PDF"] as const,

  // OQ-11: Privasi data & retensi
  MASK_PHONE_NUMBERS: true, // Format 0812-****-3310
  TICKET_QR_ALGORITHM: "SHA256_TOKEN_HASH", // Hanya hash token acak, tanpa NIK/data terbuka
  DATA_RETENTION_MONTHS: 24,

  // OQ-12: Target evaluasi pilot (PRD §9)
  PILOT_TARGET_MIN_RESERVATIONS: 100,
  PILOT_TARGET_MIN_PROVIDERS: 20,

  // OQ-13: Jadwal operasional dan cut-off harian
  DAILY_RECONCILIATION_CUTOFF_WIB: "17:00",
} as const;
