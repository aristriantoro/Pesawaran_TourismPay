import { prisma } from "@/lib/prisma";
import { formatDateTimeWIB } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actor: true,
    },
    take: 30,
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-extrabold text-[#00243D] tracking-tight">
            Audit Trail & Log Perubahan Sistem
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Rekam jejak mutasi kritis: perubahan tarif, pembatalan tiket, koreksi kasir, dan penyesuaian data (FR-09.3).
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#E8F5EE] text-[#1E7B4F] text-xs font-bold">
          Integritas Data Terjamin
        </span>
      </div>

      {/* Tabel Log Audit */}
      <section className="bg-white rounded-2xl border border-[#D5CEBF]/40 shadow-coastal-1 overflow-hidden">
        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-4xl text-outline">history</span>
            <p className="font-bold text-primary-container">Belum Ada Catatan Mutasi</p>
            <p>Seluruh tindakan penting administratif akan tercatat otomatis di sini.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FBF7EF] border-b border-[#D5CEBF]/60 text-outline text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Aktor Pengguna</th>
                <th className="py-3 px-4">Aksi / Tindakan</th>
                <th className="py-3 px-4">Entitas Terkait</th>
                <th className="py-3 px-4">Nilai Sebelum</th>
                <th className="py-3 px-4">Nilai Sesudah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CEBF]/30">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                    {formatDateTimeWIB(log.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary-container">
                    {log.actor?.name || "Sistem Otomatis"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#CEE5FF] text-[#0B3A5B]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                    {log.entityType} ({log.entityId.slice(0, 8)})
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-outline max-w-xs truncate">
                    {log.beforeValue || "-"}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-brand-teal max-w-xs truncate">
                    {log.afterValue || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
