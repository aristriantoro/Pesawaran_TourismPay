import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskPhoneNumber } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Fetch active tickets for today
    const tickets = await prisma.ticket.findMany({
      where: {
        validDate: dateParam,
        status: { in: ["ACTIVE", "USED"] },
      },
      include: {
        reservation: {
          include: {
            reservationItems: {
              include: { service: true },
            },
          },
        },
      },
    });

    const cachedTickets = tickets.map((t) => {
      const firstItem = t.reservation.reservationItems[0];
      return {
        ticketTokenHash: t.ticketTokenHash,
        ticketCode: t.ticketCode,
        validDate: t.validDate,
        passengerCount: t.passengerCount,
        customerNameMasked: t.reservation.customerName,
        customerPhoneMasked: maskPhoneNumber(t.reservation.customerPhone),
        serviceName: firstItem?.service?.name || "Wisata Bahari Pulau Pahawang",
        status: t.status,
        cachedAt: new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: cachedTickets,
      totalCount: cachedTickets.length,
    });
  } catch (error: any) {
    console.error("Sync pull error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengunduh cache offline" },
      { status: 500 }
    );
  }
}
