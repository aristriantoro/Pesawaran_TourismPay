/**
 * Formatters sesuai standar SKILL.md §8
 * Format mata uang, tanggal (WIB), nomor telepon disamarkan, dan kode tiket/transaksi.
 */

export function formatRupiah(amount: number | string | bigint | { toString(): string }): string {
  const num = typeof amount === "number" ? amount : Number(amount.toString());
  if (isNaN(num)) return "Rp 0";

  const isNegative = num < 0;
  const absValue = Math.abs(num);
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(absValue)
    .replace(/\s+/g, " ");

  return isNegative ? `−${formatted}` : formatted;
}

export function formatDateWIB(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTimeWIB(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const datePart = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart} · ${timePart} WIB`;
}

export function formatTimeWIB(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const timePart = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${timePart} WIB`;
}

export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "0812-****-3310";
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 8) return phone;
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}-****-${suffix}`;
}

export function generateReservationCode(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PHW-${yyyy}${mm}${dd}-${rand}`;
}

export function generateCashCode(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TUN-${rand}`;
}
