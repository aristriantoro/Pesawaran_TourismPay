import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCashCode } from "@/lib/formatters";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId = "srv-tiket-masuk",
      quantity = 1,
      notes,
      recordedById = "user-petugas-budi",
      localEventId,
      paidAmount,
      customerName = "Pengunjung Tunai Loket",
    } = body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return NextResponse.json(
        { success: false, message: "Jumlah tiket tidak valid" },
        { status: 400 }
      );
    }

    // 1. Fetch service & price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        servicePrices: {
          orderBy: { validFrom: "desc" },
          take: 1,
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Layanan tidak ditemukan" },
        { status: 404 }
      );
    }

    const unitPrice = Number(service.servicePrices[0]?.price || 25000);
    const totalAmount = unitPrice * qty;

    // 2. Check for duplicate cash transaction (PRD FR-05.4 & Test #7)
    // Check if identical amount, notes, and recordedBy within last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 120000);
    const potentialDuplicate = await prisma.cashTransaction.findFirst({
      where: {
        amount: totalAmount,
        recordedById,
        recordedAt: { gte: twoMinutesAgo },
        notes: notes ? notes.trim() : undefined,
      },
    });

    if (potentialDuplicate && !body.forceDuplicate) {
      return NextResponse.json({
        success: false,
        isDuplicateWarning: true,
        message: "Peringatan: Transaksi tunai serupa baru saja tercatat dalam 2 menit terakhir!",
        data: {
          existingCode: potentialDuplicate.transactionCode,
          amount: Number(potentialDuplicate.amount),
          recordedAt: potentialDuplicate.recordedAt,
        },
      });
    }

    // 3. Generate unique transaction code
    const transactionCode = generateCashCode();

    // 4. Record cash transaction
    const cashTrx = await prisma.cashTransaction.create({
      data: {
        transactionCode,
        providerId: service.providerId,
        amount: totalAmount,
        recordedById,
        status: "RECORDED", // Tercatat, belum disetor (PRD FR-05.5)
        localEventId: localEventId || undefined,
        notes: notes ? `${notes} (Pemesan: ${customerName})` : `Pemesan: ${customerName}`,
      },
      include: {
        provider: true,
        recordedBy: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi tunai berhasil dicatat.",
      data: {
        transactionCode: cashTrx.transactionCode,
        amount: Number(cashTrx.amount),
        recordedBy: cashTrx.recordedBy.name,
        recordedAt: cashTrx.recordedAt.toISOString(),
        serviceName: service.name,
        quantity: qty,
        unitPrice,
        status: cashTrx.status,
      },
    });
  } catch (error: any) {
    console.error("Cash record error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mencatat transaksi tunai" },
      { status: 500 }
    );
  }
}
