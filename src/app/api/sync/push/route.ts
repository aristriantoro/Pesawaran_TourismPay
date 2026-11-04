import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId = "POS-KETAPANG-OFFLINE-01", scans = [], cashRecords = [] } = body;

    const results = {
      scansProcessed: 0,
      cashProcessed: 0,
      conflictsFound: 0,
      idempotentSkips: 0,
      details: [] as any[],
    };

    // 1. Process offline scans
    for (const scan of scans) {
      const { localId, ticketTokenHash, scannedAt, staffUserId = "user-petugas-budi" } = scan;

      // Check idempotency via localId (Test #6)
      const existingScan = await prisma.ticketScan.findUnique({
        where: { localId },
      });

      if (existingScan) {
        results.idempotentSkips++;
        results.details.push({
          localId,
          type: "SCAN",
          status: "ALREADY_SYNCED",
        });
        continue;
      }

      // Find ticket on server
      const ticket = await prisma.ticket.findFirst({
        where: { ticketTokenHash },
      });

      if (!ticket) {
        results.conflictsFound++;
        await prisma.syncQueue.upsert({
          where: { localEventId: localId },
          update: {},
          create: {
            deviceId,
            localEventId: localId,
            eventType: "TICKET_SCAN",
            payloadReference: JSON.stringify(scan),
            syncStatus: "CONFLICT",
            errorMessage: "Tiket dengan hash ini tidak ditemukan di server.",
          },
        });
        results.details.push({
          localId,
          type: "SCAN",
          status: "CONFLICT_NOT_FOUND",
        });
        continue;
      }

      // Conflict Check: Ticket was already USED on another device (Test #5)
      if (ticket.status === "USED") {
        results.conflictsFound++;

        // Record scan conflict without losing data
        await prisma.ticketScan.create({
          data: {
            ticketId: ticket.id,
            staffUserId,
            deviceId,
            scannedAt: new Date(scannedAt || Date.now()),
            result: "ALREADY_USED",
            syncStatus: "CONFLICT",
            localId,
          },
        });

        // Add to "Perlu Ditinjau" queue (SIAGA)
        await prisma.syncQueue.upsert({
          where: { localEventId: localId },
          update: {},
          create: {
            deviceId,
            localEventId: localId,
            eventType: "TICKET_SCAN_CONFLICT",
            payloadReference: JSON.stringify({
              ticketId: ticket.id,
              ticketCode: ticket.ticketCode,
              scannedAt,
              deviceId,
              conflictReason: "Tiket sudah berstatus TERPAKAI saat disinkronkan dari perangkat offline.",
            }),
            syncStatus: "CONFLICT",
            errorMessage: `Konflik: Tiket ${ticket.ticketCode} dipindai di 2 perangkat berbeda.`,
          },
        });

        results.details.push({
          localId,
          ticketCode: ticket.ticketCode,
          type: "SCAN",
          status: "CONFLICT",
        });
      } else {
        // Normal valid offline scan: update to USED
        await prisma.$transaction([
          prisma.ticket.update({
            where: { id: ticket.id },
            data: { status: "USED", usedAt: new Date(scannedAt || Date.now()) },
          }),
          prisma.ticketScan.create({
            data: {
              ticketId: ticket.id,
              staffUserId,
              deviceId,
              scannedAt: new Date(scannedAt || Date.now()),
              result: "VALID",
              syncStatus: "SYNCED",
              localId,
            },
          }),
        ]);

        results.scansProcessed++;
        results.details.push({
          localId,
          ticketCode: ticket.ticketCode,
          type: "SCAN",
          status: "SYNCED",
        });
      }
    }

    // 2. Process offline cash records
    for (const cash of cashRecords) {
      const {
        localId,
        transactionCode,
        amount,
        customerName,
        notes,
        recordedAt,
        recordedById = "user-petugas-budi",
      } = cash;

      // Check idempotency via localEventId (Test #6)
      const existingCash = await prisma.cashTransaction.findUnique({
        where: { localEventId: localId },
      });

      if (existingCash) {
        results.idempotentSkips++;
        results.details.push({
          localId,
          type: "CASH",
          status: "ALREADY_SYNCED",
        });
        continue;
      }

      const bumdes = await prisma.provider.findFirst({
        where: { providerType: "BUMDES_DESTINASI" },
      });

      await prisma.cashTransaction.create({
        data: {
          transactionCode: transactionCode || `TUN-OFF-${localId.slice(0, 6)}`,
          providerId: bumdes?.id || "prov-bumdes",
          amount: Number(amount),
          recordedById,
          status: "RECORDED",
          localEventId: localId,
          recordedAt: new Date(recordedAt || Date.now()),
          notes: notes ? `${notes} (Pemesan: ${customerName})` : `Pemesan: ${customerName}`,
        },
      });

      results.cashProcessed++;
      results.details.push({
        localId,
        type: "CASH",
        status: "SYNCED",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi selesai: ${results.scansProcessed} tiket & ${results.cashProcessed} transaksi kas berhasil disinkronkan.`,
      results,
    });
  } catch (error: any) {
    console.error("Sync push error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal melakukan sinkronisasi batch" },
      { status: 500 }
    );
  }
}
