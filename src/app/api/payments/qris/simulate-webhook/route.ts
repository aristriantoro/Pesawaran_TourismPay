import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerReference, targetStatus = "PAID" } = body;

    if (!providerReference) {
      return NextResponse.json(
        { success: false, message: "providerReference diperlukan" },
        { status: 400 }
      );
    }

    // 1. Fetch payment and reservation
    const payment = await prisma.payment.findUnique({
      where: { providerReference },
      include: {
        reservation: {
          include: {
            reservationItems: {
              include: { service: true },
            },
            tickets: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Transaksi pembayaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. Idempotency Check (FR-03.6 & Test #2 Webhook Ganda)
    if (payment.status === "PAID" && targetStatus === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Notifikasi webhook sudah diproses sebelumnya (Idempoten)",
        data: {
          paymentId: payment.id,
          status: "PAID",
          idempotent: true,
          ticketCode: payment.reservation.tickets[0]?.ticketCode,
        },
      });
    }

    // 3. Handle PAYMENT_UNKNOWN (FR-03.7, Edge Case PRD §8 & Test #4)
    if (targetStatus === "PAYMENT_UNKNOWN") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAYMENT_UNKNOWN" },
      });

      return NextResponse.json({
        success: true,
        message: "Status pembayaran tidak pasti. Jangan bayar ulang, cek status dulu.",
        data: {
          paymentId: payment.id,
          status: "PAYMENT_UNKNOWN",
        },
      });
    }

    // 4. Handle FAILED
    if (targetStatus === "FAILED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json({
        success: true,
        message: "Pembayaran gagal diproses oleh gateway.",
        data: {
          paymentId: payment.id,
          status: "FAILED",
        },
      });
    }

    // 5. Handle PAID
    if (targetStatus === "PAID") {
      const reservation = payment.reservation;
      const isExpired =
        reservation.status === "EXPIRED" || new Date(reservation.expiresAt) < new Date();

      // Edge case PRD #402: Bayar setelah kedaluwarsa (Test #3)
      if (isExpired) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        // Catat di antrean penanganan pembayaran terlambat
        await prisma.syncQueue.create({
          data: {
            deviceId: "SYSTEM-PAYMENT-GATEWAY",
            localEventId: `late-payment-${payment.id}-${Date.now()}`,
            eventType: "LATE_PAYMENT_EXPIRED",
            payloadReference: JSON.stringify({
              paymentId: payment.id,
              reservationCode: reservation.reservationCode,
              amount: Number(payment.amount),
              paidAt: new Date().toISOString(),
              reason: "Pembayaran sukses diterima setelah batas waktu reservasi kedaluwarsa.",
            }),
            syncStatus: "CONFLICT",
            errorMessage: "Pembayaran terlambat: Kuota telah dilepas. Perlu peninjauan admin/refund manual.",
          },
        });

        return NextResponse.json({
          success: false,
          code: "PAYMENT_AFTER_EXPIRED",
          message:
            "Pembayaran diterima setelah batas waktu kedaluwarsa. Tiket tidak dapat diterbitkan otomatis dan masuk ke antrean pemeriksaan petugas.",
          data: {
            paymentId: payment.id,
            status: "PAID",
            reservationStatus: "EXPIRED",
            ticketIssued: false,
          },
        });
      }

      // Process normal confirmed payment
      const now = new Date();
      await prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: now,
          },
        });

        // Update reservation to CONFIRMED
        await tx.reservation.update({
          where: { id: reservation.id },
          data: {
            status: "CONFIRMED",
          },
        });

        // Generate tickets if not yet created (FR-04.1 & FR-04.2)
        if (reservation.tickets.length === 0) {
          const firstItem = reservation.reservationItems[0];
          const qty = firstItem?.quantity || 1;

          // Generate random secure token hash (SHA-256) without personal data
          const rawToken = crypto.randomBytes(24).toString("hex");
          const ticketTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
          const ticketCode = `TKT-${reservation.reservationCode}`;

          await tx.ticket.create({
            data: {
              reservationId: reservation.id,
              ticketCode,
              ticketTokenHash,
              validDate: reservation.serviceDate,
              status: "ACTIVE",
              passengerCount: qty,
            },
          });
        }

        // Record revenue classification (40% PAD Retribusi, 60% Jasa BUMDes)
        const totalAmount = Number(payment.amount);
        const padAmount = Math.round(totalAmount * 0.4);
        const bumdesAmount = totalAmount - padAmount;

        const catPAD = await tx.revenueCategory.findFirst({
          where: { revenueType: "RETRIBUSI_PAD" },
        });

        const catBumdes = await tx.revenueCategory.findFirst({
          where: { revenueType: "JASA_USAHA_MITRA" },
        });

        if (catPAD) {
          await tx.revenueRecord.create({
            data: {
              sourceReference: payment.id,
              categoryId: catPAD.id,
              grossAmount: padAmount,
              netAmount: padAmount,
              verificationStatus: "PENDING_VALIDATION", // Menunggu Validasi Pemda
            },
          });
        }

        if (catBumdes) {
          await tx.revenueRecord.create({
            data: {
              sourceReference: payment.id,
              categoryId: catBumdes.id,
              grossAmount: bumdesAmount,
              netAmount: bumdesAmount,
              verificationStatus: "VERIFIED_PAD",
            },
          });
        }
      });

      const updatedReservation = await prisma.reservation.findUnique({
        where: { id: reservation.id },
        include: { tickets: true },
      });

      return NextResponse.json({
        success: true,
        message: "Pembayaran berhasil dikonfirmasi. E-Tiket telah diterbitkan.",
        data: {
          paymentId: payment.id,
          status: "PAID",
          reservationStatus: "CONFIRMED",
          ticketCode: updatedReservation?.tickets[0]?.ticketCode,
        },
      });
    }

    return NextResponse.json({ success: false, message: "Target status tidak valid" }, { status: 400 });
  } catch (error: any) {
    console.error("Webhook simulation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses webhook" },
      { status: 500 }
    );
  }
}
