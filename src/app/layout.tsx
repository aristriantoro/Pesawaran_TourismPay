import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pesawaran TourismPay | Tiket & Pembayaran Wisata Bahari Pulau Pahawang",
  description:
    "Sistem reservasi, e-tiket QR, pembayaran QRIS & tunai, rekonsiliasi, dan transparansi pendapatan daerah wisata Pulau Pahawang, Kabupaten Pesawaran, Lampung.",
  applicationName: "Pesawaran TourismPay",
  authors: [{ name: "BUMDes Wisata Bahari & Pemkab Pesawaran" }],
  keywords: ["Pahawang", "Pesawaran", "TourismPay", "Tiket Wisata", "QRIS", "Dermaga Ketapang"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B3A5B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#FDF9F1] text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container">
        {children}
      </body>
    </html>
  );
}
