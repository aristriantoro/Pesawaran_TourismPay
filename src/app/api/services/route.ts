import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const services = await prisma.service.findMany({
      where: { status: "ACTIVE" },
      include: {
        provider: { select: { id: true, name: true, providerType: true } },
        servicePrices: {
          orderBy: { validFrom: "desc" },
          take: 1,
        },
        availabilitySlots: {
          where: { serviceDate: dateParam },
          take: 1,
        },
      },
    });

    const formatted = services.map((s) => {
      const currentPrice = s.servicePrices[0]?.price ? Number(s.servicePrices[0].price) : 0;
      const unit = s.servicePrices[0]?.unit || "ORANG";
      const slot = s.availabilitySlots[0];
      const capacity = slot?.capacity ?? 100;
      const reservedCount = slot?.reservedCount ?? 0;
      const remainingQuota = Math.max(0, capacity - reservedCount);

      return {
        id: s.id,
        name: s.name,
        serviceType: s.serviceType,
        description: s.description,
        location: s.location,
        provider: s.provider,
        price: currentPrice,
        unit,
        date: dateParam,
        capacity,
        reservedCount,
        remainingQuota,
        isSoldOut: remainingQuota <= 0,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat katalog layanan" },
      { status: 500 }
    );
  }
}
