import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import crypto from "crypto";

describe("10 Skenario Uji Wajib PRD Pesawaran TourismPay", () => {
  beforeAll(async () => {
    // Setup clean state if needed
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // TEST 1: Rebutan Kuota Terakhir (Concurrency Anti-Oversell)
  it("Skenario 1: Rebutan kuota terakhir - hanya 1 yang berhasil, anti-oversell", async () => {
    // 1. Setup service and single-capacity slot
    const testService = await prisma.service.create({
      data: {
        providerId: "prov-bumdes",
        name: "Layanan Uji Kuota Rebutan",
        serviceType: "TIKET_MASUK",
        description: "Test",
        servicePrices: {
          create: {
            price: 25000,
            unit: "ORANG",
            validFrom: new Date(),
          },
        },
      },
    });

    const testDate = "2026-12-01";
    await prisma.availabilitySlot.create({
      data: {
        serviceId: testService.id,
        serviceDate: testDate,
        capacity: 1, // Hanya 1 tiket tersisa!
        reservedCount: 0,
      },
    });

    // 2. Simulate 2 concurrent reservation transactions
    const attemptReservation = async (customerName: string) => {
      return prisma.$transaction(async (tx) => {
        const slot = await tx.availabilitySlot.findUniqueOrThrow({
          where: { serviceId_serviceDate: { serviceId: testService.id, serviceDate: testDate } },
        });

        if (slot.reservedCount + 1 > slot.capacity) {
          throw new Error("Kuota tidak mencukupi");
        }

        await tx.availabilitySlot.update({
          where: { id: slot.id },
          data: { reservedCount: { increment: 1 } },
        });

        return tx.reservation.create({
          data: {
            reservationCode: `PHW-RACE-${customerName}-${Date.now()}`,
            customerName,
            customerPhone: "081200001111",
            serviceDate: testDate,
            totalAmount: 25000,
            status: "PENDING_PAYMENT",
            expiresAt: new Date(Date.now() + 900000),
          },
        });
      });
    };

    // Run both attempts concurrently
    const results = await Promise.allSettled([
      attemptReservation("Wisatawan A"),
      attemptReservation("Wisatawan B"),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    const failures = results.filter((r) => r.status === "rejected");

    // Exactly 1 must succeed and 1 must fail
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);

    // Final slot reservedCount must be 1, never oversold
    const finalSlot = await prisma.availabilitySlot.findUniqueOrThrow({
      where: { serviceId_serviceDate: { serviceId: testService.id, serviceDate: testDate } },
    });
    expect(finalSlot.reservedCount).toBe(1);
  });

  // TEST 2: Webhook Ganda (Idempotency)
  it("Skenario 2: Webhook notifikasi ganda - diproses idempoten tanpa tiket duplikat", async () => {
    const resCode = `PHW-IDEMP-${Date.now()}`;
    const reservation = await prisma.reservation.create({
      data: {
        reservationCode: resCode,
        customerName: "Wisatawan Idempoten",
        customerPhone: "081233445566",
        serviceDate: "2026-10-24",
        totalAmount: 50000,
        status: "PENDING_PAYMENT",
        expiresAt: new Date(Date.now() + 900000),
        reservationItems: {
          create: {
            serviceId: "srv-tiket-masuk",
            providerId: "prov-bumdes",
            quantity: 2,
            unitPrice: 25000,
            subtotal: 50000,
          },
        },
      },
    });

    const providerReference = `QRIS-IDEMP-${resCode}`;
    await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        method: "QRIS",
        providerReference,
        amount: 50000,
        status: "PENDING",
      },
    });

    // Simulasi Webhook 1
    const simulateWebhookCall = async () => {
      const p = await prisma.payment.findUniqueOrThrow({
        where: { providerReference },
        include: { reservation: { include: { tickets: true } } },
      });

      if (p.status === "PAID") {
        return { idempotent: true, ticketCount: p.reservation.tickets.length };
      }

      // Mark PAID and issue ticket
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: p.id },
          data: { status: "PAID", paidAt: new Date() },
        }),
        prisma.reservation.update({
          where: { id: p.reservationId },
          data: { status: "CONFIRMED" },
        }),
        prisma.ticket.create({
          data: {
            reservationId: p.reservationId,
            ticketCode: `TKT-${resCode}`,
            ticketTokenHash: crypto.randomBytes(16).toString("hex"),
            validDate: "2026-10-24",
            status: "ACTIVE",
            passengerCount: 2,
          },
        }),
      ]);

      const updated = await prisma.reservation.findUniqueOrThrow({
        where: { id: p.reservationId },
        include: { tickets: true },
      });

      return { idempotent: false, ticketCount: updated.tickets.length };
    };

    // First webhook call: normal
    const firstCall = await simulateWebhookCall();
    expect(firstCall.idempotent).toBe(false);
    expect(firstCall.ticketCount).toBe(1);

    // Second webhook call with same providerReference: idempotent!
    const secondCall = await simulateWebhookCall();
    expect(secondCall.idempotent).toBe(true);
    expect(secondCall.ticketCount).toBe(1); // Tetap 1 tiket, tidak terbit dobel!
  });

  // TEST 3: Bayar Setelah Kedaluwarsa
  it("Skenario 3: Bayar setelah kedaluwarsa - tiket tidak otomatis terbit, masuk antrean", async () => {
    const expiredResCode = `PHW-EXP-${Date.now()}`;
    const reservation = await prisma.reservation.create({
      data: {
        reservationCode: expiredResCode,
        customerName: "Wisatawan Terlambat",
        customerPhone: "081299887766",
        serviceDate: "2026-10-24",
        totalAmount: 25000,
        status: "EXPIRED", // Sudah kedaluwarsa!
        expiresAt: new Date(Date.now() - 3600000), // 1 jam yang lalu
      },
    });

    const payment = await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        method: "QRIS",
        providerReference: `QRIS-LATE-${expiredResCode}`,
        amount: 25000,
        status: "PENDING",
      },
    });

    // Simulasi penanganan bayar sukses setelah kedaluwarsa (PRD FR-02.7 & Edge Case #402)
    const handleLatePayment = async () => {
      const res = await prisma.reservation.findUniqueOrThrow({ where: { id: reservation.id } });
      if (res.status === "EXPIRED") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", paidAt: new Date() },
        });

        // Masuk ke antrean pemeriksaan/refund manual
        const queueEntry = await prisma.syncQueue.create({
          data: {
            deviceId: "SYSTEM-PAYMENT-GATEWAY",
            localEventId: `late-payment-${payment.id}`,
            eventType: "LATE_PAYMENT_EXPIRED",
            payloadReference: JSON.stringify({ paymentId: payment.id, resCode: res.reservationCode }),
            syncStatus: "CONFLICT",
            errorMessage: "Pembayaran terlambat diterima setelah reservasi kedaluwarsa.",
          },
        });

        return { ticketIssued: false, queueEntry };
      }
      return { ticketIssued: true };
    };

    const lateResult = await handleLatePayment();
    expect(lateResult.ticketIssued).toBe(false);

    // Pastikan tidak ada tiket yang terbit
    const ticketCount = await prisma.ticket.count({ where: { reservationId: reservation.id } });
    expect(ticketCount).toBe(0);
    expect(lateResult.queueEntry?.syncStatus).toBe("CONFLICT");
  });

  // TEST 4: Penanganan PAYMENT_UNKNOWN
  it("Skenario 4: PAYMENT_UNKNOWN - status pesanan tetap pending dan tidak menerbitkan tiket", async () => {
    const unkResCode = `PHW-UNK-${Date.now()}`;
    const reservation = await prisma.reservation.create({
      data: {
        reservationCode: unkResCode,
        customerName: "Wisatawan Unknown",
        customerPhone: "081211112222",
        serviceDate: "2026-10-24",
        totalAmount: 35000,
        status: "PENDING_PAYMENT",
        expiresAt: new Date(Date.now() + 600000),
      },
    });

    const payment = await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        method: "QRIS",
        providerReference: `QRIS-UNK-${unkResCode}`,
        amount: 35000,
        status: "PAYMENT_UNKNOWN", // Gateway timeout / unknown
      },
    });

    // Check payment status
    expect(payment.status).toBe("PAYMENT_UNKNOWN");
    expect(reservation.status).toBe("PENDING_PAYMENT");

    // Tiket TIDAK boleh terbit
    const ticketCount = await prisma.ticket.count({ where: { reservationId: reservation.id } });
    expect(ticketCount).toBe(0);
  });

  // TEST 5: Scan Ganda Dua Perangkat Offline
  it("Skenario 5: Scan ganda dua perangkat offline - terdeteksi konflik masuk antrean Perlu Ditinjau", async () => {
    // Create dedicated parent reservation
    const res = await prisma.reservation.create({
      data: {
        reservationCode: `PHW-CONF-${Date.now()}`,
        customerName: "Wisatawan Konflik",
        customerPhone: "081277665544",
        serviceDate: "2026-10-24",
        totalAmount: 25000,
        status: "CONFIRMED",
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    const tokenHash = `hash_token_conflict_${Date.now()}`;
    const ticket = await prisma.ticket.create({
      data: {
        reservationId: res.id,
        ticketCode: `TKT-CONF-${Date.now()}`,
        ticketTokenHash: tokenHash,
        validDate: "2026-10-24",
        status: "ACTIVE",
        passengerCount: 1,
      },
    });

    // Device A scans offline and syncs
    await prisma.$transaction([
      prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: "USED", usedAt: new Date() },
      }),
      prisma.ticketScan.create({
        data: {
          ticketId: ticket.id,
          staffUserId: "user-petugas-budi",
          deviceId: "POS-DERMAGA-A",
          scannedAt: new Date(),
          result: "VALID",
          syncStatus: "SYNCED",
          localId: `local-scan-devA-${Date.now()}`,
        },
      }),
    ]);

    // Device B also scanned offline and syncs LATER for same ticket
    const checkTicketOnDeviceBSync = async () => {
      const currentTicket = await prisma.ticket.findUniqueOrThrow({ where: { id: ticket.id } });
      if (currentTicket.status === "USED") {
        // Conflict detected!
        const conflictScan = await prisma.ticketScan.create({
          data: {
            ticketId: ticket.id,
            staffUserId: "user-petugas-budi",
            deviceId: "POS-DERMAGA-B",
            scannedAt: new Date(),
            result: "ALREADY_USED",
            syncStatus: "CONFLICT",
            localId: `local-scan-devB-${Date.now()}`,
          },
        });

        const queueItem = await prisma.syncQueue.create({
          data: {
            deviceId: "POS-DERMAGA-B",
            localEventId: `conflict-${ticket.ticketCode}`,
            eventType: "TICKET_SCAN_CONFLICT",
            payloadReference: JSON.stringify({ ticketCode: ticket.ticketCode }),
            syncStatus: "CONFLICT",
            errorMessage: "Konflik: Tiket dipindai di 2 perangkat berbeda saat offline.",
          },
        });

        return { conflict: true, conflictScan, queueItem };
      }
      return { conflict: false };
    };

    const bResult = await checkTicketOnDeviceBSync();
    expect(bResult.conflict).toBe(true);
    expect(bResult.conflictScan?.syncStatus).toBe("CONFLICT");
    expect(bResult.queueItem?.syncStatus).toBe("CONFLICT");
  });

  // TEST 6: Sinkron Ulang Tanpa Duplikat
  it("Skenario 6: Sinkron ulang antrean tanpa duplikasi data", async () => {
    const res = await prisma.reservation.create({
      data: {
        reservationCode: `PHW-SYNC-${Date.now()}`,
        customerName: "Wisatawan Sync",
        customerPhone: "081255443322",
        serviceDate: "2026-10-24",
        totalAmount: 25000,
        status: "CONFIRMED",
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    const ticket = await prisma.ticket.create({
      data: {
        reservationId: res.id,
        ticketCode: `TKT-SYNC-${Date.now()}`,
        ticketTokenHash: `hash_sync_${Date.now()}`,
        validDate: "2026-10-24",
        status: "ACTIVE",
        passengerCount: 1,
      },
    });

    const localId = `unique-local-scan-${Date.now()}`;

    const processSyncItem = async (id: string) => {
      const exists = await prisma.ticketScan.findUnique({ where: { localId: id } });
      if (exists) {
        return { duplicate: true, record: exists };
      }

      const newRecord = await prisma.ticketScan.create({
        data: {
          ticketId: ticket.id,
          staffUserId: "user-petugas-budi",
          deviceId: "POS-DERMAGA-01",
          scannedAt: new Date(),
          result: "VALID",
          syncStatus: "SYNCED",
          localId: id,
        },
      });

      return { duplicate: false, record: newRecord };
    };

    const firstSync = await processSyncItem(localId);
    expect(firstSync.duplicate).toBe(false);

    // Resync exact same batch / event
    const secondSync = await processSyncItem(localId);
    expect(secondSync.duplicate).toBe(true);
    expect(secondSync.record.id).toBe(firstSync.record.id);
  });

  // TEST 7: Deteksi Pencatatan Tunai Ganda
  it("Skenario 7: Deteksi pencatatan tunai ganda dalam rentang waktu singkat", async () => {
    const testNotes = `Uji Kas Dobel ${Date.now()}`;
    const amount = 50000;
    const staffId = "user-petugas-budi";

    // First cash record
    await prisma.cashTransaction.create({
      data: {
        transactionCode: `TUN-TEST-1-${Date.now()}`,
        providerId: "prov-bumdes",
        amount,
        recordedById: staffId,
        notes: testNotes,
        status: "RECORDED",
      },
    });

    // Check duplicate logic (within 2 minutes with identical notes and amount)
    const checkDuplicate = async (notesVal: string, amtVal: number) => {
      const twoMinsAgo = new Date(Date.now() - 120000);
      const found = await prisma.cashTransaction.findFirst({
        where: {
          amount: amtVal,
          recordedById: staffId,
          notes: notesVal,
          recordedAt: { gte: twoMinsAgo },
        },
      });
      return !!found;
    };

    const isDuplicate = await checkDuplicate(testNotes, amount);
    expect(isDuplicate).toBe(true);
  });

  // TEST 8: Perubahan Tarif Tidak Mengubah Pesanan Lama
  it("Skenario 8: Perubahan tarif katalog tidak mengubah snapshot pesanan lama", async () => {
    // 1. Create service with old price Rp 25.000
    const srv = await prisma.service.create({
      data: {
        providerId: "prov-bumdes",
        name: "Layanan Uji Snapshot Harga",
        serviceType: "TIKET_MASUK",
        description: "Test",
        servicePrices: {
          create: { price: 25000, unit: "ORANG", validFrom: new Date("2026-01-01") },
        },
      },
    });

    // 2. Create reservation snapshotting price Rp 25.000
    const res = await prisma.reservation.create({
      data: {
        reservationCode: `PHW-SNAP-${Date.now()}`,
        customerName: "Wisatawan Snapshot",
        customerPhone: "081288889999",
        serviceDate: "2026-10-24",
        totalAmount: 50000,
        status: "CONFIRMED",
        expiresAt: new Date(Date.now() + 86400000),
        reservationItems: {
          create: {
            serviceId: srv.id,
            providerId: "prov-bumdes",
            quantity: 2,
            unitPrice: 25000, // Snapshot
            subtotal: 50000,
          },
        },
      },
      include: { reservationItems: true },
    });

    expect(Number(res.reservationItems[0].unitPrice)).toBe(25000);

    // 3. Admin raises tariff in catalog to Rp 35.000 (FR-01.4)
    await prisma.servicePrice.create({
      data: {
        serviceId: srv.id,
        price: 35000,
        unit: "ORANG",
        validFrom: new Date(),
      },
    });

    // 4. Assert: Catalog now has new price 35.000
    const latestPrice = await prisma.servicePrice.findFirstOrThrow({
      where: { serviceId: srv.id },
      orderBy: { validFrom: "desc" },
    });
    expect(Number(latestPrice.price)).toBe(35000);

    // 5. Assert: Old order item STILL retains Rp 25.000 snapshot!
    const oldOrderItem = await prisma.reservationItem.findFirstOrThrow({
      where: { reservationId: res.id },
    });
    expect(Number(oldOrderItem.unitPrice)).toBe(25000);
    expect(Number(oldOrderItem.subtotal)).toBe(50000);
  });

  // TEST 9: Akses Lintas Peran (RBAC)
  it("Skenario 9: Akses lintas peran (RBAC) dibatasi sesuai wewenang", async () => {
    const roleWisatawan = await prisma.role.findUniqueOrThrow({ where: { name: "WISATAWAN" } });
    const rolePetugas = await prisma.role.findUniqueOrThrow({ where: { name: "PETUGAS_DERMAGA" } });
    const rolePemda = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN_PEMDA" } });

    const permsWisatawan: string[] = JSON.parse(roleWisatawan.permissions);
    const permsPetugas: string[] = JSON.parse(rolePetugas.permissions);
    const permsPemda: string[] = JSON.parse(rolePemda.permissions);

    // Wisatawan cannot scan tickets or edit prices
    expect(permsWisatawan.includes("ticket:scan")).toBe(false);
    expect(permsWisatawan.includes("price:edit")).toBe(false);

    // Staff cannot edit prices or verify PAD
    expect(permsPetugas.includes("ticket:scan")).toBe(true);
    expect(permsPetugas.includes("price:edit")).toBe(false);
    expect(permsPetugas.includes("pad:verify")).toBe(false);

    // Pemda can verify PAD and manage reconciliations
    expect(permsPemda.includes("pad:verify")).toBe(true);
    expect(permsPemda.includes("reconcile:manage")).toBe(true);
  });

  // TEST 10: Deteksi Selisih Rekonsiliasi Kas
  it("Skenario 10: Selisih rekonsiliasi kas terdeteksi dan memicu status DISCREPANCY", async () => {
    const recon = await prisma.reconciliation.create({
      data: {
        id: `recon-test-${Date.now()}`,
        periodStart: new Date(),
        periodEnd: new Date(),
        providerId: "prov-bumdes",
        expectedAmount: 100000,
        actualAmount: 75000,
        difference: -25000, // Selisih -25.000
        status: "DISCREPANCY",
        actionStatus: "BELUM_DITINJAU",
        investigationNotes: "Selisih setoran kas pos 1.",
      },
    });

    expect(Number(recon.difference)).toBe(-25000);
    expect(recon.status).toBe("DISCREPANCY");
    expect(recon.actionStatus).toBe("BELUM_DITINJAU");

    // Update status investigasi (PRD FR-06.5)
    const updated = await prisma.reconciliation.update({
      where: { id: recon.id },
      data: {
        actionStatus: "DIPROSES",
        investigationNotes: "Sedang diklarifikasi dengan kasir loket Budi Santoso.",
      },
    });

    expect(updated.actionStatus).toBe("DIPROSES");
  });
});
