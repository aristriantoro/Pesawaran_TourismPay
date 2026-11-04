import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TOURISM_PAY_CONFIG } from "@/config/tourismpay.config";
import { generateReservationCode } from "@/lib/formatters";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      serviceDate,
      quantity = 1,
      customerName,
      customerPhone,
      customerId,
    } = body;

    if (!serviceId || !serviceDate || !customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, message: "Seluruh kolom wajib diisi (layanan, tanggal, nama, nomor WhatsApp/telepon)" },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 10) {
      return NextResponse.json(
        { success: false, message: "Jumlah tiket harus antara 1 sampai 10 orang" },
        { status: 400 }
      );
    }

    // Atomic transaction for quota check and reservation creation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch service and latest price
      const service = await tx.service.findUnique({
        where: { id: serviceId },
        include: {
          servicePrices: {
            orderBy: { validFrom: "desc" },
            take: 1,
          },
        },
      });

      if (!service || service.status !== "ACTIVE") {
        throw new Error("Layanan tidak ditemukan atau sedang tidak aktif");
      }

      const activePrice = service.servicePrices[0];
      if (!activePrice) {
        throw new Error("Tarif layanan belum ditetapkan");
      }

      const unitPrice = Number(activePrice.price);
      const subtotal = unitPrice * qty;

      // 2. Fetch or create availability slot
      let slot = await tx.availabilitySlot.findUnique({
        where: {
          serviceId_serviceDate: { serviceId, serviceDate },
        },
      });

      if (!slot) {
        // Create default slot if not yet present
        slot = await tx.availabilitySlot.create({
          data: {
            serviceId,
            serviceDate,
            capacity: 250,
            reservedCount: 0,
          },
        });
      }

      // Check atomic quota (Anti-oversell rule FR-02.4 & Test #1)
      if (slot.reservedCount + qty > slot.capacity) {
        const remaining = Math.max(0, slot.capacity - slot.reservedCount);
        throw new Error(`Kuota tidak mencukupi. Sisa kuota hanya ${remaining} tiket untuk tanggal ini.`);
      }

      // 3. Atomically increment reservedCount
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: {
          reservedCount: { increment: qty },
        },
      });

      // 4. Generate unique reservation code
      const reservationCode = generateReservationCode();
      const expiresAt = new Date(Date.now() + TOURISM_PAY_CONFIG.RESERVATION_HOLD_TIMEOUT_SECONDS * 1000);

      // 5. Create reservation
      const reservation = await tx.reservation.create({
        data: {
          reservationCode,
          customerId: customerId || null,
          customerName,
          customerPhone,
          serviceDate,
          totalAmount: subtotal,
          status: "PENDING_PAYMENT",
          expiresAt,
        },
      });

      // 6. Snapshot price in reservation items (FR-01.5 & Test #8)
      await tx.reservationItem.create({
        data: {
          reservationId: reservation.id,
          serviceId: service.id,
          providerId: service.providerId,
          quantity: qty,
          unitPrice,
          subtotal,
        },
      });

      return { reservation, service, unitPrice, subtotal };
    });

    return NextResponse.json({
      success: true,
      message: "Reservasi berhasil dibuat. Silakan lakukan pembayaran.",
      data: {
        reservationCode: result.reservation.reservationCode,
        totalAmount: result.subtotal,
        serviceName: result.service.name,
        serviceDate: result.reservation.serviceDate,
        expiresAt: result.reservation.expiresAt,
        customerName: result.reservation.customerName,
      },
    });
  } catch (error: any) {
    console.error("Reservation creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal membuat reservasi",
      },
      { status: 400 }
    );
  }
}
