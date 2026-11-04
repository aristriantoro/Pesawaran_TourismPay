import Link from "next/link";

interface TouristHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightBadge?: string;
}

export function TouristHeader({
  title,
  showBack = false,
  backHref = "/",
  rightBadge,
}: TouristHeaderProps) {
  if (showBack) {
    return (
      <header className="sticky top-0 z-40 bg-[#FDF9F1]/95 backdrop-blur-md border-b border-[#D5CEBF]/40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="w-10 h-10 rounded-full bg-white border border-[#D5CEBF]/50 flex items-center justify-center text-primary-container shadow-sm active:scale-95 transition-transform"
            aria-label="Kembali"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="font-headline-sm text-primary-container font-bold">{title || "Pemesanan"}</h1>
        </div>
        {rightBadge && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold">
            <span className="material-symbols-outlined text-xs fill-icon">verified</span>
            {rightBadge}
          </span>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FDF9F1]/95 backdrop-blur-md border-b border-[#D5CEBF]/40 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-secondary-container shadow-sm">
          <span className="material-symbols-outlined text-[22px] fill-icon">sailing</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-headline-sm text-primary font-extrabold tracking-tight">TourismPay</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F5EE] text-[#1E7B4F]">Resmi</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-sm text-[#0FA3A3]">location_on</span>
            <span>Dermaga Ketapang · Pahawang</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/petugas"
          className="px-2.5 py-1 rounded-lg bg-primary-container/10 text-primary-container text-[11px] font-bold hover:bg-primary-container/20 transition-colors"
          title="Beralih ke Portal Petugas"
        >
          Portal Petugas
        </Link>
        <button
          className="w-10 h-10 rounded-full bg-white border border-[#D5CEBF]/40 flex items-center justify-center text-primary-container relative active:scale-95 transition-transform"
          aria-label="Notifikasi"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-coral"></span>
        </button>
      </div>
    </header>
  );
}
