import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reconciliationId, actionStatus, notes } = body;

    if (!reconciliationId) {
      return NextResponse.json(
        { success: false, message: "ID rekonsiliasi diperlukan" },
        { status: 400 }
      );
    }

    const updated = await prisma.reconciliation.update({
      where: { id: reconciliationId },
      data: {
        actionStatus: actionStatus || "DIPROSES",
        investigationNotes: notes || undefined,
        status: actionStatus === "SELESAI" ? "RESOLVED" : "UNDER_INVESTIGATION",
      },
    });

    // Record in audit log (PRD FR-09.3)
    await prisma.auditLog.create({
      data: {
        actorId: "user-pemda-sri",
        action: "RECONCILIATION_INVESTIGATION_UPDATE",
        entityType: "RECONCILIATION",
        entityId: reconciliationId,
        beforeValue: JSON.stringify({ status: "DISCREPANCY" }),
        afterValue: JSON.stringify({ actionStatus, notes, status: updated.status }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Catatan investigasi rekonsiliasi berhasil diperbarui.",
      data: updated,
    });
  } catch (error: any) {
    console.error("Reconciliation update error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui investigasi" },
      { status: 500 }
    );
  }
}
