"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TouristNavigation() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isTicket = pathname.startsWith("/tiket");
  const isHistory = pathname.startsWith("/riwayat");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D5CEBF]/40 py-2 px-4 shadow-bottom-bar flex justify-center pb-safe">
      <div className="w-full max-w-[420px] flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center px-4 py-1.5 rounded-xl transition-all ${
            isHome
              ? "bg-secondary-container text-on-secondary-container font-bold"
              : "text-on-surface-variant hover:text-primary font-medium"
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${isHome ? "fill-icon" : ""}`}>home</span>
          <span className="text-label-sm mt-0.5">Beranda</span>
        </Link>

        <Link
          href="/tiket/TKT-PHW-20261024-0042"
          className={`flex flex-col items-center px-4 py-1.5 rounded-xl transition-all ${
            isTicket
              ? "bg-secondary-container text-on-secondary-container font-bold"
              : "text-on-surface-variant hover:text-primary font-medium"
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${isTicket ? "fill-icon" : ""}`}>
            confirmation_number
          </span>
          <span className="text-label-sm mt-0.5">Tiket</span>
        </Link>

        <Link
          href="/riwayat"
          className={`flex flex-col items-center px-4 py-1.5 rounded-xl transition-all ${
            isHistory
              ? "bg-secondary-container text-on-secondary-container font-bold"
              : "text-on-surface-variant hover:text-primary font-medium"
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${isHistory ? "fill-icon" : ""}`}>
            receipt_long
          </span>
          <span className="text-label-sm mt-0.5">Riwayat</span>
        </Link>
      </div>
    </nav>
  );
}
