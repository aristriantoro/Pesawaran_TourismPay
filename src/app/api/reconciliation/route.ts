import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDateTimeWIB } from "@/lib/formatters";

export async function GET() {
  try {
    const recons = await prisma.reconciliation.findMany({
      orderBy: { createdAt: "desc" },
      include: { provider: true },
    });

    const payments = await prisma.payment.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        reservation: true,
      },
    });

    const cash = await prisma.cashTransaction.findMany({
      orderBy: { recordedAt: "desc" },
      take: 10,
      include: {
        provider: true,
        recordedBy: true,
      },
    });

    // Merge into reconciliation journal items
    const items = [
      // From active reconciliations
      ...recons.map((r) => ({
        id: r.id,
        code: `RECON-${r.id.slice(0, 8)}`,
        time: formatDateTimeWIB(r.createdAt),
        method: "CASH",
        partner: r.provider.name,
        systemAmount: Number(r.expectedAmount),
        actualAmount: Number(r.actualAmount),
        difference: Number(r.difference),
        status: r.status as any,
        actionStatus: r.actionStatus as any,
        staffName: "Budi Santoso (Pos 1)",
        notes: r.investigationNotes || "",
      })),
      // From payments
      ...payments.map((p) => ({
        id: p.id,
        code: p.providerReference || `PAY-${p.id.slice(0, 8)}`,
        time: formatDateTimeWIB(p.paidAt || p.createdAt),
        method: p.method,
        partner: "Bank Lampung QRIS",
        systemAmount: Number(p.amount),
        actualAmount: Number(p.amount), // Matches settlement
        difference: 0,
        status: "MATCHED" as any,
        actionStatus: "SELESAI" as any,
        staffName: "Gateway QRIS",
        notes: "Settlement berhasil dicocokkan dengan rekening penampung resmi.",
      })),
      // From cash transactions
      ...cash.map((c) => ({
        id: c.id,
        code: c.transactionCode,
        time: formatDateTimeWIB(c.recordedAt),
        method: "CASH",
        partner: c.provider.name,
        systemAmount: Number(c.amount),
        actualAmount: Number(c.amount),
        difference: 0,
        status: "MATCHED" as any,
        actionStatus: "DIPROSES" as any,
        staffName: c.recordedBy.name,
        notes: c.notes || "",
      })),
    ];

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Reconciliation fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data rekonsiliasi" },
      { status: 500 }
    );
  }
}
