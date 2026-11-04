import { prisma } from "@/lib/prisma";
import { formatDateWIB, maskPhoneNumber } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function PenggunaPeranPage() {
  const users = await prisma.user.findMany({
    include: {
      userRoles: {
        include: {
          role: true,
          provider: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-extrabold text-[#00243D] tracking-tight">
            Pengguna & Hak Akses (RBAC)
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manajemen peran pengguna, batasan wewenang (scope provider), dan audit akun resmi (FR-09).
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-brand-coral hover:bg-[#B93624] text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          <span>Tambah Akun Petugas</span>
        </button>
      </div>

      {/* Tabel Pengguna */}
      <section className="bg-white rounded-2xl border border-[#D5CEBF]/40 shadow-coastal-1 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#FBF7EF] border-b border-[#D5CEBF]/60 text-outline text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Nama Pengguna</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Nomor Kontak</th>
              <th className="py-3 px-4">Peran (Role)</th>
              <th className="py-3 px-4">Lingkup (Scope)</th>
              <th className="py-3 px-4">Status Akun</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5CEBF]/30">
            {users.map((u) => {
              const userRole = u.userRoles[0];
              const roleName = userRole?.role?.name || "WISATAWAN";
              const providerName = userRole?.provider?.name || "Umum / Semua";
              const isActive = u.status === "ACTIVE";

              return (
                <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3.5 px-4 font-bold text-primary-container">
                    {u.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-on-surface-variant">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-on-surface-variant">
                    {maskPhoneNumber(u.phone)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        roleName === "ADMIN_PEMDA"
                          ? "bg-[#0FA3A3]/20 text-[#006a6a]"
                          : roleName === "PENGELOLA_BUMDES"
                          ? "bg-primary-container text-white"
                          : roleName === "PETUGAS_DERMAGA"
                          ? "bg-[#FEF7EA] text-[#B7791F]"
                          : "bg-surface-container text-primary-container"
                      }`}
                    >
                      {roleName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">
                    {providerName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-[#E8F5EE] text-[#1E7B4F]"
                          : "bg-[#FCECE9] text-brand-coral"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{isActive ? "Aktif" : "Nonaktif"}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary-container text-xs font-bold"
                    >
                      Kelola Hak
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
