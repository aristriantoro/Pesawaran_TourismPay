"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/transaksi", label: "Transaksi & Rekonsiliasi", icon: "receipt_long" },
    { href: "/admin/laporan", label: "Laporan Pendapatan", icon: "bar_chart" },
    { href: "/admin/katalog", label: "Katalog & Tarif", icon: "sell" },
    { href: "/admin/pengguna", label: "Pengguna & Peran", icon: "group" },
    { href: "/admin/audit", label: "Audit Trail", icon: "history" },
  ];

  return (
    <div className="min-h-screen bg-[#FDF9F1] flex text-on-surface">
      {/* Sidebar Desktop w-64 bg-primary (SKILL §5.2) */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#00243D] text-white p-4 flex flex-col justify-between z-50 shadow-xl">
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-secondary-container shadow-md">
              <span className="material-symbols-outlined text-2xl fill-icon">sailing</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-base font-extrabold tracking-tight text-white">
                  TourismPay
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0FA3A3]/20 text-[#7ff5f4]">
                  Pemda
                </span>
              </div>
              <span className="text-[11px] text-white/70 block">Kabupaten Pesawaran</span>
            </div>
          </div>

          {/* Quick Button ke Portal Petugas Mobile */}
          <Link
            href="/petugas"
            className="w-full py-2.5 px-3 rounded-xl bg-[#0B3A5B] hover:bg-[#00375e] text-white text-xs font-bold transition-all flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-secondary-container">
                qr_code_scanner
              </span>
              <span>Portal Petugas Dermaga</span>
            </div>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>

          {/* Navigasi Utama */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary-container text-secondary-fixed shadow-sm border-l-4 border-secondary-fixed"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? "fill-icon" : ""}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">
              SR
            </div>
            <div className="text-left overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">Ibu Sri Rahayu</span>
              <span className="text-[10px] text-[#7ff5f4] block">BPKAD Kab. Pesawaran</span>
            </div>
          </div>

          <Link
            href="/"
            className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white/90 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Kembali ke Beranda Wisatawan</span>
          </Link>
        </div>
      </aside>

      {/* Top Bar Desktop left-64 right-0 h-16 (SKILL §5.2) */}
      <header className="fixed left-64 right-0 top-0 h-16 bg-white border-b border-[#D5CEBF]/40 px-8 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-on-surface-variant font-medium">TourismPay</span>
          <span className="text-outline">/</span>
          <span className="text-primary-container font-bold capitalize">
            {pathname.replace("/admin/", "").replace("/admin", "Dashboard")}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-full bg-[#E8F5EE] text-[#1E7B4F] text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1E7B4F]"></span>
            <span>Cut-Off Rekonsiliasi: 17:00 WIB</span>
          </span>

          <Link
            href="/admin/laporan"
            className="px-3.5 py-1.5 rounded-xl border border-primary-container text-primary-container text-xs font-bold hover:bg-surface-container flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Unduh Laporan</span>
          </Link>

          <div className="relative">
            <button className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-coral"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Konten Utama Desktop ml-64 pt-16 (SKILL §5.2) */}
      <div className="ml-64 pt-16 flex-1 min-h-screen">
        <main className="p-8 max-w-[1440px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
