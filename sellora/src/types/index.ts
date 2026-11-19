export type AuthMode = "offline" | "cloud";

export interface WorkspaceSession {
  mode: AuthMode;
  businessName: string;
  email?: string;
  gstin?: string;
  state?: string;
  channels: string[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  title: string;
  channel: string;
  stock: number;
  listingPrice: number;
  sellerPrice: number; // Cost Price / COGS
  mrp?: number;
  hsn?: string;
  gstRate?: number;
  category?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | "delivered"
  | "shipped"
  | "customer_return"
  | "rto"
  | "cancelled"
  | "pending";

export type ReturnStatus =
  | "in_transit"
  | "received"
  | "restocked"
  | "damaged"
  | "claim_filed"
  | "claim_approved"
  | "disputed";

export interface ReturnDetails {
  returnType: "customer_return" | "rto";
  initiatedDate: string;
  returnReason: string;
  returnStatus: ReturnStatus;
  reverseShippingFee: number;
  claimStatus?: "not_required" | "pending" | "approved" | "rejected";
  claimAmount?: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  date: string;
  channel: string;
  sku: string;
  title: string;
  quantity: number;
  orderValue: number;
  customerState: string;
  status: OrderStatus;
  returnDetails?: ReturnDetails;
}
