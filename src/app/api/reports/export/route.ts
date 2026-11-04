import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        payments: true,
        reservationItems: { include: { service: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV content
    const headers = [
      "No",
      "Kode Reservasi",
      "Tanggal Layanan",
      "Nama Pemesan",
      "Layanan",
      "Volume",
      "Total Bruto (Rp)",
      "Metode Bayar",
      "Status Pembayaran",
      "Alokasi PAD 40% (Rp)",
      "Status Validasi PAD",
    ];

    const rows = reservations.map((r, idx) => {
      const pay = r.payments[0];
      const item = r.reservationItems[0];
      const total = Number(r.totalAmount);
      const pad = Math.round(total * 0.4);

      return [
        idx + 1,
        `"${r.reservationCode}"`,
        `"${r.serviceDate}"`,
        `"${r.customerName}"`,
        `"${item?.service?.name || "Wisata Bahari"}"`,
        item?.quantity || 1,
        total,
        `"${pay?.method || "QRIS"}"`,
        `"${pay?.status || r.status}"`,
        pad,
        `"${r.status === "CONFIRMED" ? "Menunggu Validasi BPKAD" : "Belum Lunas"}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Laporan_PAD_Pesawaran_TourismPay.csv"',
      },
    });
  } catch (error) {
    console.error("Export CSV error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengekspor laporan" }, { status: 500 });
  }
}
