import { PrismaClient } from "@prisma/client";
import { TOURISM_PAY_CONFIG } from "../src/config/tourismpay.config";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Pesawaran TourismPay database...");

  // 1. Roles
  const rolesData = [
    { name: "WISATAWAN", permissions: JSON.stringify(["ticket:buy", "ticket:view", "history:view"]) },
    { name: "PETUGAS_DERMAGA", permissions: JSON.stringify(["ticket:scan", "cash:record", "manifest:view", "sync:manage"]) },
    { name: "OPERATOR_KAPAL", permissions: JSON.stringify(["manifest:view", "ticket:verify_boat"]) },
    { name: "PENGELOLA_BUMDES", permissions: JSON.stringify(["catalog:manage", "price:edit", "quota:edit", "cash:record", "reconcile:view", "reports:view"]) },
    { name: "ADMIN_PEMDA", permissions: JSON.stringify(["dashboard:view", "reconcile:manage", "pad:verify", "reports:export", "users:manage", "audit:view"]) },
    { name: "AUDITOR", permissions: JSON.stringify(["audit:view", "reports:view", "reconcile:view"]) },
  ];

  for (const r of rolesData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { permissions: r.permissions },
      create: r,
    });
  }

  const roleWisatawan = await prisma.role.findUniqueOrThrow({ where: { name: "WISATAWAN" } });
  const rolePetugas = await prisma.role.findUniqueOrThrow({ where: { name: "PETUGAS_DERMAGA" } });
  const roleBumdes = await prisma.role.findUniqueOrThrow({ where: { name: "PENGELOLA_BUMDES" } });
  const rolePemda = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN_PEMDA" } });
  const roleAuditor = await prisma.role.findUniqueOrThrow({ where: { name: "AUDITOR" } });

  // 2. Providers
  const bumdes = await prisma.provider.upsert({
    where: { id: "prov-bumdes" },
    update: {},
    create: {
      id: "prov-bumdes",
      name: TOURISM_PAY_CONFIG.OPERATOR_NAME,
      providerType: "BUMDES_DESTINASI",
      contact: "0812-7890-1234",
      status: "ACTIVE",
    },
  });

  const kapalAssoc = await prisma.provider.upsert({
    where: { id: "prov-kapal" },
    update: {},
    create: {
      id: "prov-kapal",
      name: "Koperasi Jasa Angkutan Laut Pahawang Bahari",
      providerType: "OPERATOR_KAPAL",
      contact: "0813-6677-8899",
      status: "ACTIVE",
    },
  });

  // 3. Users
  const userRina = await prisma.user.upsert({
    where: { email: "rina@example.com" },
    update: {},
    create: {
      id: "user-rina",
      name: "Rina Wijaya",
      email: "rina@example.com",
      phone: "0812-3456-3310",
      passwordHash: "demo_hash_rina",
      status: "ACTIVE",
    },
  });

  const userPetugas = await prisma.user.upsert({
    where: { email: "petugas@ketapang.id" },
    update: {},
    create: {
      id: "user-petugas-budi",
      name: "Budi Santoso",
      email: "petugas@ketapang.id",
      phone: "0813-8822-1100",
      passwordHash: "demo_hash_budi",
      status: "ACTIVE",
    },
  });

  const userBumdes = await prisma.user.upsert({
    where: { email: "admin@bumdes.id" },
    update: {},
    create: {
      id: "user-admin-andi",
      name: "Pak Andi",
      email: "admin@bumdes.id",
      phone: "0811-9988-7766",
      passwordHash: "demo_hash_andi",
      status: "ACTIVE",
    },
  });

  const userPemda = await prisma.user.upsert({
    where: { email: "pemda@pesawarankab.go.id" },
    update: {},
    create: {
      id: "user-pemda-sri",
      name: "Ibu Sri Rahayu (BPKAD)",
      email: "pemda@pesawarankab.go.id",
      phone: "0812-7766-5544",
      passwordHash: "demo_hash_sri",
      status: "ACTIVE",
    },
  });

  const userAuditor = await prisma.user.upsert({
    where: { email: "auditor@pesawarankab.go.id" },
    update: {},
    create: {
      id: "user-auditor-hendra",
      name: "Hendra Inspektorat",
      email: "auditor@pesawarankab.go.id",
      phone: "0812-1122-3344",
      passwordHash: "demo_hash_hendra",
      status: "ACTIVE",
    },
  });

  // Assign user roles
  await prisma.userRole.upsert({
    where: { userId_roleId_providerId: { userId: userRina.id, roleId: roleWisatawan.id, providerId: "" } },
    update: {},
    create: { userId: userRina.id, roleId: roleWisatawan.id },
  }).catch(() => {});

  await prisma.userRole.upsert({
    where: { userId_roleId_providerId: { userId: userPetugas.id, roleId: rolePetugas.id, providerId: bumdes.id } },
    update: {},
    create: { userId: userPetugas.id, roleId: rolePetugas.id, providerId: bumdes.id },
  }).catch(() => {});

  await prisma.userRole.upsert({
    where: { userId_roleId_providerId: { userId: userBumdes.id, roleId: roleBumdes.id, providerId: bumdes.id } },
    update: {},
    create: { userId: userBumdes.id, roleId: roleBumdes.id, providerId: bumdes.id },
  }).catch(() => {});

  await prisma.userRole.upsert({
    where: { userId_roleId_providerId: { userId: userPemda.id, roleId: rolePemda.id, providerId: "" } },
    update: {},
    create: { userId: userPemda.id, roleId: rolePemda.id },
  }).catch(() => {});

  // 4. Services & Prices
  const services = [
    {
      id: "srv-tiket-masuk",
      providerId: bumdes.id,
      name: "Tiket Masuk Wisata Bahari Pulau Pahawang",
      serviceType: "TIKET_MASUK",
      description: "Tiket resmi masuk kawasan wisata bahari Pulau Pahawang, termasuk asuransi Jasa Raharja Putra.",
      price: 25000,
      unit: "ORANG",
      capacity: 350,
    },
    {
      id: "srv-retribusi",
      providerId: bumdes.id,
      name: "Retribusi Pengelolaan Sampah & Konservasi Laut",
      serviceType: "RETRIBUSI_KONSERVASI",
      description: "Pungutan resmi retribusi daerah Pemkab Pesawaran untuk pemeliharaan terumbu karang dan kebersihan pulau.",
      price: 15000,
      unit: "ORANG",
      capacity: 500,
    },
    {
      id: "srv-snorkeling",
      providerId: bumdes.id,
      name: "Paket Snorkeling Spot Nemo & Gosong Bekri",
      serviceType: "PAKET_SNORKELING",
      description: "Pemandu snorkeling berpengalaman, titik spot nemo, dan dokumentasi foto bawah air.",
      price: 35000,
      unit: "ORANG",
      capacity: 150,
    },
    {
      id: "srv-alat",
      providerId: bumdes.id,
      name: "Sewa Masker, Snorkel & Life Jacket Standard",
      serviceType: "SEWA_ALAT",
      description: "Perlengkapan alat apung dan kacamata selam standar bersertifikat keselamatan.",
      price: 50000,
      unit: "UNIT",
      capacity: 200,
    },
    {
      id: "srv-kapal",
      providerId: kapalAssoc.id,
      name: "Sewa Kapal Tradisional Ketapang - Pahawang (PP)",
      serviceType: "SEWA_KAPAL",
      description: "Perahu motor kapasitas 10-15 orang rute Ketapang ↔ Pulau Pahawang dengan pelampung keselamatan.",
      price: 450000,
      unit: "PERJALANAN",
      capacity: 25,
    },
  ];

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        serviceType: s.serviceType,
        description: s.description,
      },
      create: {
        id: s.id,
        providerId: s.providerId,
        name: s.name,
        serviceType: s.serviceType,
        description: s.description,
      },
    });

    // Price history snapshot
    await prisma.servicePrice.create({
      data: {
        serviceId: s.id,
        price: s.price,
        unit: s.unit,
        validFrom: new Date("2026-01-01"),
      },
    });

    // Slots for today and tomorrow
    await prisma.availabilitySlot.upsert({
      where: { serviceId_serviceDate: { serviceId: s.id, serviceDate: today } },
      update: { capacity: s.capacity },
      create: {
        serviceId: s.id,
        serviceDate: today,
        capacity: s.capacity,
        reservedCount: 15,
      },
    });

    await prisma.availabilitySlot.upsert({
      where: { serviceId_serviceDate: { serviceId: s.id, serviceDate: tomorrow } },
      update: { capacity: s.capacity },
      create: {
        serviceId: s.id,
        serviceDate: tomorrow,
        capacity: s.capacity,
        reservedCount: 5,
      },
    });
  }

  // 5. Revenue Categories (PRD FR-07)
  const catPAD = await prisma.revenueCategory.upsert({
    where: { id: "cat-retribusi-pad" },
    update: {},
    create: {
      id: "cat-retribusi-pad",
      name: "Retribusi Daerah Wisata Bahari & Konservasi (PAD)",
      revenueType: "RETRIBUSI_PAD",
      legalBasisReference: "Perda Kab. Pesawaran No. 4 Tahun 2024 tentang Retribusi Pelayanan Tempat Rekreasi",
    },
  });

  const catBumdes = await prisma.revenueCategory.upsert({
    where: { id: "cat-jasa-bumdes" },
    update: {},
    create: {
      id: "cat-jasa-bumdes",
      name: "Pendapatan Jasa Usaha Pengelolaan BUMDes",
      revenueType: "JASA_USAHA_MITRA",
      legalBasisReference: "Perdes Pulau Pahawang No. 2 Tahun 2023",
    },
  });

  // 6. Pre-seeded Demo Reservations & Tickets
  // Case A: Lunas & Tiket Aktif (Wisatawan Rina)
  const resCode1 = "PHW-20261024-0042";
  const res1 = await prisma.reservation.upsert({
    where: { reservationCode: resCode1 },
    update: {},
    create: {
      reservationCode: resCode1,
      customerId: userRina.id,
      customerName: "Rina Wijaya",
      customerPhone: "0812-3456-3310",
      serviceDate: today,
      totalAmount: 50000,
      status: "CONFIRMED",
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  await prisma.reservationItem.create({
    data: {
      reservationId: res1.id,
      serviceId: "srv-tiket-masuk",
      providerId: bumdes.id,
      quantity: 2,
      unitPrice: 25000,
      subtotal: 50000,
    },
  });

  const pay1 = await prisma.payment.upsert({
    where: { providerReference: "QRIS-SIM-20261024-0042" },
    update: {},
    create: {
      reservationId: res1.id,
      method: "QRIS",
      providerReference: "QRIS-SIM-20261024-0042",
      amount: 50000,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  const tokenHash1 = "hash_token_demo_rina_valid_0042";
  await prisma.ticket.upsert({
    where: { ticketCode: "TKT-PHW-20261024-0042" },
    update: {},
    create: {
      reservationId: res1.id,
      ticketCode: "TKT-PHW-20261024-0042",
      ticketTokenHash: tokenHash1,
      validDate: today,
      status: "ACTIVE",
      passengerCount: 2,
    },
  });

  // Case B: Tiket Sudah Dipakai (TERPAKAI)
  const resCode2 = "PHW-20261024-0018";
  const res2 = await prisma.reservation.upsert({
    where: { reservationCode: resCode2 },
    update: {},
    create: {
      reservationCode: resCode2,
      customerId: userRina.id,
      customerName: "Rina Wijaya",
      customerPhone: "0812-3456-3310",
      serviceDate: today,
      totalAmount: 25000,
      status: "CONFIRMED",
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  await prisma.reservationItem.create({
    data: {
      reservationId: res2.id,
      serviceId: "srv-tiket-masuk",
      providerId: bumdes.id,
      quantity: 1,
      unitPrice: 25000,
      subtotal: 25000,
    },
  });

  const ticketUsed = await prisma.ticket.upsert({
    where: { ticketCode: "TKT-PHW-20261024-0018" },
    update: {},
    create: {
      reservationId: res2.id,
      ticketCode: "TKT-PHW-20261024-0018",
      ticketTokenHash: "hash_token_demo_used_0018",
      validDate: today,
      status: "USED",
      passengerCount: 1,
      usedAt: new Date(Date.now() - 3600000), // 1 jam lalu
    },
  });

  await prisma.ticketScan.create({
    data: {
      ticketId: ticketUsed.id,
      staffUserId: userPetugas.id,
      deviceId: "POS-KETAPANG-01",
      scannedAt: new Date(Date.now() - 3600000),
      result: "VALID",
      syncStatus: "SYNCED",
      localId: "loc-scan-0018",
    },
  });

  // Case C: Pembayaran Belum Pasti (PAYMENT_UNKNOWN)
  const resCodeUnknown = "PHW-20261024-0099";
  const resUnknown = await prisma.reservation.upsert({
    where: { reservationCode: resCodeUnknown },
    update: {},
    create: {
      reservationCode: resCodeUnknown,
      customerName: "Ahmad Dahlan",
      customerPhone: "0821-9988-7711",
      serviceDate: today,
      totalAmount: 70000,
      status: "PENDING_PAYMENT",
      expiresAt: new Date(Date.now() + 600000),
    },
  });

  await prisma.payment.upsert({
    where: { providerReference: "QRIS-SIM-UNKNOWN-0099" },
    update: {},
    create: {
      reservationId: resUnknown.id,
      method: "QRIS",
      providerReference: "QRIS-SIM-UNKNOWN-0099",
      amount: 70000,
      status: "PAYMENT_UNKNOWN",
    },
  });

  // Case D: Selisih Rekonsiliasi Kas (Discrepancy: Sistem 100.000 vs Fisik 75.000 -> -25.000)
  await prisma.cashTransaction.upsert({
    where: { transactionCode: "TUN-20261024-0007" },
    update: {},
    create: {
      transactionCode: "TUN-20261024-0007",
      providerId: bumdes.id,
      amount: 100000,
      recordedById: userPetugas.id,
      status: "RECORDED",
      notes: "Pembayaran 4 tiket masuk rombongan tunai di loket pos 1",
    },
  });

  await prisma.reconciliation.upsert({
    where: { id: "recon-demo-today" },
    update: {},
    create: {
      id: "recon-demo-today",
      periodStart: new Date(new Date().setHours(0, 0, 0, 0)),
      periodEnd: new Date(new Date().setHours(23, 59, 59, 999)),
      providerId: bumdes.id,
      expectedAmount: 100000,
      actualAmount: 75000,
      difference: -25000,
      status: "DISCREPANCY",
      actionStatus: "BELUM_DITINJAU",
      investigationNotes: "Selisih setoran kas fisik pos 1 kurang Rp 25.000 dibanding catatan sistem loket.",
    },
  });

  // Case E: Antrean Konflik Sinkronisasi Offline ("Perlu Ditinjau" - SIAGA Koral)
  await prisma.syncQueue.upsert({
    where: { localEventId: "offline-conflict-tkt-9921" },
    update: {},
    create: {
      id: "sync-queue-conflict-01",
      deviceId: "POS-DERMAGA-KETAPANG-02",
      localEventId: "offline-conflict-tkt-9921",
      eventType: "TICKET_SCAN",
      payloadReference: JSON.stringify({
        ticketCode: "TKT-PHW-20261024-0018",
        scannedAt: new Date().toISOString(),
        staffId: userPetugas.id,
        reason: "Tiket terdeteksi sudah digunakan di pos lain",
      }),
      syncStatus: "CONFLICT",
      errorMessage: "Potensi pemindaian ganda: tiket sudah divalidasi di perangkat lain saat offline.",
    },
  });

  // 7. Revenue Records
  await prisma.revenueRecord.create({
    data: {
      sourceReference: pay1.id,
      categoryId: catPAD.id,
      grossAmount: 20000,
      netAmount: 20000,
      verificationStatus: "PENDING_VALIDATION", // SKILL §6.14 "Menunggu Validasi"
    },
  });

  await prisma.revenueRecord.create({
    data: {
      sourceReference: pay1.id,
      categoryId: catBumdes.id,
      grossAmount: 30000,
      netAmount: 30000,
      verificationStatus: "VERIFIED_PAD",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
