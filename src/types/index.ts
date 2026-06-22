export interface LatestPurchaser {
  username: string;
}

export interface Drop {
  id: string;
  title: string;
  totalStock: number;
  availableStock: number;
  startsAt: string;
  latestPurchasers: LatestPurchaser[];
}

export interface Reservation {
  id: string;
  userId: string;
  dropId: string;
  status: "ACTIVE" | "EXPIRED" | "COMPLETED";
  expiresAt: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  dropId: string;
  reservationId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

export interface StockUpdatedPayload {
  dropId: string;
  availableStock: number;
}

export interface ActivityFeedUpdatedPayload {
  dropId: string;
  latestPurchasers: LatestPurchaser[];
}

export interface PurchaseCompletedPayload {
  dropId: string;
}
