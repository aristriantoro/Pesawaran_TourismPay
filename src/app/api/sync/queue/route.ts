import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const queue = await prisma.syncQueue.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: queue.map((q) => ({
        id: q.id,
        deviceId: q.deviceId,
        localEventId: q.localEventId,
        eventType: q.eventType,
        syncStatus: q.syncStatus,
        errorMessage: q.errorMessage,
        createdAt: q.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Sync queue error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat antrean sinkronisasi" },
      { status: 500 }
    );
  }
}
