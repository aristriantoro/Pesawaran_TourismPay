import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;

    const reservation = await prisma.reservation.findUnique({
      where: { reservationCode: code },
      include: {
        reservationItems: {
          include: {
            service: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        tickets: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check expiration dynamically if status is PENDING_PAYMENT
    let currentStatus = reservation.status;
    const isExpired =
      currentStatus === "PENDING_PAYMENT" && new Date(reservation.expiresAt) < new Date();

    if (isExpired && currentStatus !== "EXPIRED") {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: "EXPIRED" },
      });
      currentStatus = "EXPIRED";
    }

    const firstItem = reservation.reservationItems[0];
    const latestPayment = reservation.payments[0];

    return NextResponse.json({
      success: true,
      data: {
        id: reservation.id,
        reservationCode: reservation.reservationCode,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        serviceDate: reservation.serviceDate,
        totalAmount: Number(reservation.totalAmount),
        status: currentStatus,
        expiresAt: reservation.expiresAt,
        createdAt: reservation.createdAt,
        serviceName: firstItem?.service?.name || "Layanan Wisata Bahari",
        quantity: firstItem?.quantity || 1,
        unitPrice: firstItem?.unitPrice ? Number(firstItem.unitPrice) : 0,
        payment: latestPayment
          ? {
              id: latestPayment.id,
              method: latestPayment.method,
              status: latestPayment.status,
              providerReference: latestPayment.providerReference,
              paidAt: latestPayment.paidAt,
            }
          : null,
        tickets: reservation.tickets.map((t) => ({
          id: t.id,
          ticketCode: t.ticketCode,
          ticketTokenHash: t.ticketTokenHash,
          validDate: t.validDate,
          status: t.status,
          passengerCount: t.passengerCount,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat rincian pesanan" },
      { status: 500 }
    );
  }
}
