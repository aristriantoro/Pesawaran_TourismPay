import { TOURISM_PAY_CONFIG } from "@/config/tourismpay.config";

export interface CreateQrisResult {
  qrString: string;
  providerReference: string;
  nmid: string;
  amount: number;
  expiresAt: string;
  simulationMode: boolean;
}

export interface PaymentStatusResult {
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "PAYMENT_UNKNOWN";
  providerReference: string;
  paidAt?: string;
  message?: string;
}

export interface PaymentProvider {
  name: string;
  isSimulation: boolean;
  createQris(reservationCode: string, amount: number): Promise<CreateQrisResult>;
  checkStatus(providerReference: string): Promise<PaymentStatusResult>;
  simulateCallback(providerReference: string, targetStatus: "PAID" | "FAILED" | "PAYMENT_UNKNOWN"): Promise<PaymentStatusResult>;
}

/**
 * Mock Adapter Bank Lampung QRIS (Mode Simulasi)
 * Meniru gateway QRIS resmi dengan jaminan idempotensi dan penanganan timeout/unknown.
 */
class MockQrisProvider implements PaymentProvider {
  name = TOURISM_PAY_CONFIG.PAYMENT_PROVIDER_NAME;
  isSimulation = true;

  async createQris(reservationCode: string, amount: number): Promise<CreateQrisResult> {
    const providerReference = `QRIS-SIM-${reservationCode}`;
    const expiresAt = new Date(
      Date.now() + TOURISM_PAY_CONFIG.RESERVATION_HOLD_TIMEOUT_SECONDS * 1000
    ).toISOString();

    // Standard mock QR payload string
    const qrString = `00020101021226600014ID.LINKAJA.WWW011893600998${reservationCode}520458125303360540${amount}5802ID5914PESAWARAN_TOUR6007LAMPUNG6304`;

    return {
      qrString,
      providerReference,
      nmid: TOURISM_PAY_CONFIG.QRIS_NMID,
      amount,
      expiresAt,
      simulationMode: true,
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatusResult> {
    // In simulation mode, check status
    return {
      status: "PENDING",
      providerReference,
    };
  }

  async simulateCallback(
    providerReference: string,
    targetStatus: "PAID" | "FAILED" | "PAYMENT_UNKNOWN"
  ): Promise<PaymentStatusResult> {
    return {
      status: targetStatus,
      providerReference,
      paidAt: targetStatus === "PAID" ? new Date().toISOString() : undefined,
    };
  }
}

export const paymentProvider = new MockQrisProvider();
