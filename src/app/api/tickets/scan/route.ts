import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tokenOrCode,
      deviceId = "POS-KETAPANG-01",
      staffUserId = "user-petugas-budi",
      localId,
    } = body;

    if (!tokenOrCode) {
      return NextResponse.json(
        { success: false, message: "Token hash atau kode tiket diperlukan" },
        { status: 400 }
      );
    }

    // 1. Find ticket by token hash or ticketCode
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ ticketTokenHash: tokenOrCode }, { ticketCode: tokenOrCode }],
      },
      include: {
        reservation: {
          include: {
            reservationItems: {
              include: { service: true },
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
        {
          success: false,
          result: "INVALID",
          message: "Kode QR tidak dikenali sistem. Pastikan tiket diterbitkan resmi dari TourismPay.",
        },
        { status: 404 }
      );
    }

    // 2. Check if already USED (FR-04.5 & Test #5)
    if (ticket.status === "USED") {
      const lastScan = ticket.ticketScans[0];

      // Record duplicate scan attempt
      await prisma.ticketScan.create({
        data: {
          ticketId: ticket.id,
          staffUserId,
          deviceId,
          scannedAt: new Date(),
          result: "ALREADY_USED",
          syncStatus: "CONFLICT",
          localId: localId || undefined,
        },
      });

      return NextResponse.json({
        success: false,
        result: "ALREADY_USED",
        message: "Tiket ini sudah pernah dipindai sebelumnya!",
        data: {
          ticketCode: ticket.ticketCode,
          passengerCount: ticket.passengerCount,
          customerName: ticket.reservation.customerName,
          serviceName: ticket.reservation.reservationItems[0]?.service?.name,
          previouslyUsedAt: ticket.usedAt,
          validatedByStaff: lastScan?.staff?.name || "Petugas Loket",
          deviceId: lastScan?.deviceId || "POS-KETAPANG-01",
        },
      });
    }

    // 3. Check if CANCELLED
    if (ticket.status === "CANCELLED") {
      return NextResponse.json({
        success: false,
        result: "INVALID",
        message: "Tiket telah dibatalkan / dana telah dikembalikan (Refund).",
        data: {
          ticketCode: ticket.ticketCode,
          status: "CANCELLED",
        },
      });
    }

    // 4. Ticket is VALID: Mark as USED atomically (FR-04.4 & FR-04.5)
    const now = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          status: "USED",
          usedAt: now,
        },
      });

      await tx.ticketScan.create({
        data: {
          ticketId: ticket.id,
          staffUserId,
          deviceId,
          scannedAt: now,
          result: "VALID",
          syncStatus: "SYNCED",
          localId: localId || undefined,
        },
      });
    });

    const firstItem = ticket.reservation.reservationItems[0];

    return NextResponse.json({
      success: true,
      result: "VALID",
      message: "Tiket VALID. Penumpang sah masuk kawasan penyeberangan.",
      data: {
        ticketCode: ticket.ticketCode,
        passengerCount: ticket.passengerCount,
        validDate: ticket.validDate,
        customerName: ticket.reservation.customerName,
        customerPhone: ticket.reservation.customerPhone,
        serviceName: firstItem?.service?.name || "Wisata Bahari Pulau Pahawang",
        scannedAt: now.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses pemindaian tiket" },
      { status: 500 }
    );
  }
}
