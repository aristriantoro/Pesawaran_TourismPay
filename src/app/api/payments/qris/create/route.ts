import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentProvider } from "@/lib/payments/provider";

export async function POST(request: NextRequest) {
  try {
    const { reservationCode } = await request.json();

    if (!reservationCode) {
      return NextResponse.json(
        { success: false, message: "Kode reservasi diperlukan" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { reservationCode },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(reservation.expiresAt) < new Date() && reservation.status === "PENDING_PAYMENT") {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { success: false, message: "Batas waktu pembayaran pesanan telah habis" },
        { status: 400 }
      );
    }

    const amount = Number(reservation.totalAmount);
    const qrisData = await paymentProvider.createQris(reservationCode, amount);

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { providerReference: qrisData.providerReference },
      update: {
        amount,
        status: "PENDING",
      },
      create: {
        reservationId: reservation.id,
        method: "QRIS",
        providerReference: qrisData.providerReference,
        amount,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...qrisData,
        paymentId: payment.id,
        reservationCode: reservation.reservationCode,
        customerName: reservation.customerName,
      },
    });
  } catch (error: any) {
    console.error("QRIS create error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat QRIS" },
      { status: 500 }
    );
  }
}
