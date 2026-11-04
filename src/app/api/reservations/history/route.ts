import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        reservationItems: {
          include: { service: true },
        },
        tickets: true,
      },
    });

    const formatted = reservations.map((r) => {
      const firstItem = r.reservationItems[0];
      return {
        id: r.id,
        reservationCode: r.reservationCode,
        serviceDate: r.serviceDate,
        totalAmount: Number(r.totalAmount),
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        serviceName: firstItem?.service?.name || "Wisata Bahari Pulau Pahawang",
        quantity: firstItem?.quantity || 1,
        ticketCode: r.tickets[0]?.ticketCode,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching reservation history:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat riwayat reservasi" },
      { status: 500 }
    );
  }
}
