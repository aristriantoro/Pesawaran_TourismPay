interface FieldWarningBannerProps {
  message?: string;
  className?: string;
}

export function FieldWarningBanner({
  message = "Simpan tiket ke galeri sebelum menyeberang karena sinyal di tengah laut terbatas.",
  className = "",
}: FieldWarningBannerProps) {
  return (
    <section
      className={`rounded-2xl p-3.5 bg-[#FEF7EA] border border-[#B7791F]/30 shadow-sm flex items-start gap-3 ${className}`}
    >
      <span className="material-symbols-outlined fill-icon text-[#D94530] text-xl mt-0.5 shrink-0">
        warning
      </span>
      <p className="text-body-sm text-[#400200]">
        <strong className="text-[#D94530] font-bold">Perhatian:</strong> {message}
      </p>
    </section>
  );
}
