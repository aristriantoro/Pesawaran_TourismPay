import Dexie, { Table } from "dexie";

export interface CachedTicket {
  ticketTokenHash: string;
  ticketCode: string;
  validDate: string;
  passengerCount: number;
  customerNameMasked: string;
  serviceName: string;
  status: "ACTIVE" | "USED" | "CANCELLED";
  cachedAt: string;
}

export interface OfflineScanLog {
  localId: string; // UUID v4
  ticketCode: string;
  ticketTokenHash: string;
  scannedAt: string;
  deviceId: string;
  staffUserId: string;
  result: "VALID" | "ALREADY_USED" | "INVALID";
  syncStatus: "PENDING_SYNC" | "SYNCED" | "CONFLICT";
}

export interface OfflineCashRecord {
  localId: string; // UUID v4
  transactionCode: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  amount: number;
  customerName: string;
  recordedAt: string;
  recordedById: string;
  deviceId: string;
  syncStatus: "PENDING_SYNC" | "SYNCED" | "CONFLICT";
}

export class TourismPayOfflineDB extends Dexie {
  cachedTickets!: Table<CachedTicket, string>;
  offlineScans!: Table<OfflineScanLog, string>;
  offlineCash!: Table<OfflineCashRecord, string>;

  constructor() {
    super("TourismPayOfflineDB");
    this.version(1).stores({
      cachedTickets: "ticketTokenHash, ticketCode, validDate, status",
      offlineScans: "localId, ticketTokenHash, scannedAt, syncStatus",
      offlineCash: "localId, transactionCode, recordedAt, syncStatus",
    });
  }
}

export const offlineDB = typeof window !== "undefined" ? new TourismPayOfflineDB() : null;
