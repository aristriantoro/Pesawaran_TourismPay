interface StatusBadgeProps {
  status:
    | "SUCCESS"
    | "WARNING"
    | "DANGER"
    | "NEUTRAL"
    | "INFO"
    | "LUNAS"
    | "MENUNGGU"
    | "BELUM_PASTI"
    | "TERPAKAI"
    | "BATAL"
    | "KEDALUWARSA"
    | "VALID"
    | "TIDAK_VALID"
    | "SELISIH";
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  let textClass = "text-[#1E7B4F]";
  let bgClass = "bg-[#E8F5EE]";
  let icon = "check_circle";
  let defaultLabel = "Sukses";

  switch (status) {
    case "SUCCESS":
    case "LUNAS":
    case "VALID":
      textClass = "text-[#1E7B4F]";
      bgClass = "bg-[#E8F5EE]";
      icon = "check_circle";
      defaultLabel = status === "VALID" ? "Tiket Valid" : "Lunas";
      break;

    case "WARNING":
    case "MENUNGGU":
    case "BELUM_PASTI":
      textClass = "text-[#B7791F]";
      bgClass = "bg-[#FEF7EA]";
      icon = status === "BELUM_PASTI" ? "priority_high" : "schedule";
      defaultLabel = status === "BELUM_PASTI" ? "Belum Pasti" : "Menunggu";
      break;

    case "DANGER":
    case "BATAL":
    case "TIDAK_VALID":
    case "SELISIH":
      textClass = "text-[#D94530]";
      bgClass = "bg-[#FCECE9]";
      icon = status === "SELISIH" ? "warning" : "cancel";
      defaultLabel =
        status === "BATAL"
          ? "Dibatalkan"
          : status === "TIDAK_VALID"
          ? "Tidak Valid"
          : "Selisih Kas";
      break;

    case "NEUTRAL":
    case "TERPAKAI":
    case "KEDALUWARSA":
      textClass = "text-[#64748B]";
      bgClass = "bg-[#F1F5F9]";
      icon = status === "TERPAKAI" ? "done_all" : "timer_off";
      defaultLabel = status === "TERPAKAI" ? "Terpakai" : "Kedaluwarsa";
      break;

    case "INFO":
      textClass = "text-[#0B3A5B]";
      bgClass = "bg-[#CEE5FF]";
      icon = "info";
      defaultLabel = "Informasi";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-bold ${bgClass} ${textClass} ${className}`}
    >
      <span className="material-symbols-outlined text-[15px] fill-icon">{icon}</span>
      <span>{label || defaultLabel}</span>
    </span>
  );
}
