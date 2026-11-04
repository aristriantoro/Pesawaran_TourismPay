import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketCode: string } }
) {
  try {
    const code = params.ticketCode;

    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode: code },
      include: {
        reservation: {
          include: {
            reservationItems: {
              include: { service: true },
            },
            payments: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        ticketScans: {
          orderBy: { scannedAt: "desc" },
          take: 1,
          include: { staff: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Tiket tidak ditemukan" },
        { status: 404 }
      );
    }

    const firstItem = ticket.reservation.reservationItems[0];
    const lastScan = ticket.ticketScans[0];

    return NextResponse.json({
      success: true,
      data: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        ticketTokenHash: ticket.ticketTokenHash,
        validDate: ticket.validDate,
        status: ticket.status,
        passengerCount: ticket.passengerCount,
        usedAt: ticket.usedAt,
        cancelledAt: ticket.cancelledAt,
        createdAt: ticket.createdAt,
        customerName: ticket.reservation.customerName,
        customerPhone: ticket.reservation.customerPhone,
        serviceName: firstItem?.service?.name || "Wisata Bahari Pulau Pahawang",
        reservationCode: ticket.reservation.reservationCode,
        lastScan: lastScan
          ? {
              scannedAt: lastScan.scannedAt,
              staffName: lastScan.staff.name,
              deviceId: lastScan.deviceId,
              result: lastScan.result,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat informasi tiket" },
      { status: 500 }
    );
  }
}
