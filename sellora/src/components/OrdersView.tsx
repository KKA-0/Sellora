import React, { useState, useRef, useEffect } from "react";
import {
  ShoppingBag,
  RotateCcw,
  Search,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  IndianRupee,
  ShieldAlert,
  X,
  PackageCheck,
  ChevronDown
} from "lucide-react";
import Papa from "papaparse";
import { OrderItem, OrderStatus, ReturnStatus, WorkspaceSession } from "../types";

interface OrdersViewProps {
  session: WorkspaceSession;
  initialTab?: "orders" | "returns";
}

const DEFAULT_SAMPLE_ORDERS: OrderItem[] = [
  {
    id: "ord-1",
    orderId: "403-8821943-1940212",
    date: "2026-11-18",
    channel: "Amazon",
    sku: "AMZ-COT-SHT-BLU-M",
    title: "Men Pure Cotton Regular Fit Shirt - Sky Blue (M)",
    quantity: 1,
    orderValue: 899,
    customerState: "Maharashtra",
    status: "delivered"
  },
  {
    id: "ord-2",
    orderId: "OD39102948201948",
    date: "2026-11-16",
    channel: "Flipkart",
    sku: "FK-RUN-SHO-BLK-09",
    title: "Lightweight Breathable Running Shoes - Black (UK 9)",
    quantity: 1,
    orderValue: 1249,
    customerState: "Karnataka",
    status: "customer_return",
    returnDetails: {
      returnType: "customer_return",
      initiatedDate: "2026-11-18",
      returnReason: "Size too small / tight fit",
      returnStatus: "in_transit",
      reverseShippingFee: 110,
      claimStatus: "not_required",
      notes: "Customer ordered UK 9, requesting replacement or refund"
    }
  },
  {
    id: "ord-3",
    orderId: "MEE-91048201",
    date: "2026-11-15",
    channel: "Meesho",
    sku: "MSH-SLK-SAREE-RED",
    title: "Traditional Kanjivaram Art Silk Saree with Blouse Piece",
    quantity: 2,
    orderValue: 1298,
    customerState: "Uttar Pradesh",
    status: "rto",
    returnDetails: {
      returnType: "rto",
      initiatedDate: "2026-11-17",
      returnReason: "Customer refused delivery at doorstep (COD)",
      returnStatus: "received",
      reverseShippingFee: 95,
      claimStatus: "not_required",
      notes: "COD order rejected at delivery attempt"
    }
  },
  {
    id: "ord-4",
    orderId: "404-1029481-9920145",
    date: "2026-11-14",
    channel: "Amazon",
    sku: "AMZ-SS-WAT-BTL-1L",
    title: "Insulated Stainless Steel Water Bottle - 1000ml Matte",
    quantity: 1,
    orderValue: 499,
    customerState: "Delhi",
    status: "customer_return",
    returnDetails: {
      returnType: "customer_return",
      initiatedDate: "2026-11-16",
      returnReason: "Damaged / dented upon arrival",
      returnStatus: "damaged",
      reverseShippingFee: 85,
      claimStatus: "pending",
      claimAmount: 499,
      notes: "Bottle arrived badly dented in transit. Filed Amazon SAFE-T claim."
    }
  },
  {
    id: "ord-5",
    orderId: "OD99281740192837",
    date: "2026-11-17",
    channel: "Flipkart",
    sku: "FK-WL-TWS-EAR-WHT",
    title: "True Wireless Earbuds with ENC 30Hr Playtime - White",
    quantity: 1,
    orderValue: 1099,
    customerState: "Gujarat",
    status: "shipped"
  },
  {
    id: "ord-6",
    orderId: "MEE-84729103",
    date: "2026-11-12",
    channel: "Meesho",
    sku: "MSH-SLK-SAREE-RED",
    title: "Traditional Kanjivaram Art Silk Saree with Blouse Piece",
    quantity: 1,
    orderValue: 649,
    customerState: "Rajasthan",
    status: "customer_return",
    returnDetails: {
      returnType: "customer_return",
      initiatedDate: "2026-11-14",
      returnReason: "Color mismatch with product image",
      returnStatus: "restocked",
      reverseShippingFee: 75,
      claimStatus: "not_required",
      notes: "Item verified in good condition and returned to active stock."
    }
  },
  {
    id: "ord-7",
    orderId: "402-9918274-1029384",
    date: "2026-11-18",
    channel: "Amazon",
    sku: "AMZ-COT-SHT-BLU-M",
    title: "Men Pure Cotton Regular Fit Shirt - Sky Blue (M)",
    quantity: 2,
    orderValue: 1798,
    customerState: "Tamil Nadu",
    status: "delivered"
  }
];

export const OrdersView: React.FC<OrdersViewProps> = ({ session, initialTab = "orders" }) => {
  const storageKey = `sellora_orders_${session.businessName || "default"}`;

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SAMPLE_ORDERS;
  });

  const [activeTab, setActiveTab] = useState<"orders" | "returns">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [returnStatusFilter, setReturnStatusFilter] = useState("All");

  // Claim modal state
  const [selectedOrderForClaim, setSelectedOrderForClaim] = useState<OrderItem | null>(null);
  const [claimAmountInput, setClaimAmountInput] = useState(0);
  const [claimNotesInput, setClaimNotesInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders:", e);
    }
  }, [orders, storageKey]);

  // Calculations & KPIs
  const totalOrders = orders.length;
  const grossSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, curr) => acc + curr.orderValue, 0);

  const returnsAndRTOList = orders.filter(
    (o) => o.status === "customer_return" || o.status === "rto"
  );
  const totalReturnsCount = returnsAndRTOList.length;
  const returnRatePct =
    totalOrders > 0 ? Math.round((totalReturnsCount / totalOrders) * 100) : 0;

  const totalReverseShippingLeakage = returnsAndRTOList.reduce(
    (acc, curr) => acc + (curr.returnDetails?.reverseShippingFee || 0),
    0
  );

  const pendingClaimsCount = returnsAndRTOList.filter(
    (o) => o.returnDetails?.claimStatus === "pending"
  ).length;

  const pendingClaimsAmount = returnsAndRTOList
    .filter((o) => o.returnDetails?.claimStatus === "pending")
    .reduce((acc, curr) => acc + (curr.returnDetails?.claimAmount || curr.orderValue), 0);

  // Status updates for Returns
  const updateReturnStatus = (orderId: string, newReturnStatus: ReturnStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId && o.returnDetails) {
          return {
            ...o,
            returnDetails: {
              ...o.returnDetails,
              returnStatus: newReturnStatus
            }
          };
        }
        return o;
      })
    );
  };

  const handleOpenClaimModal = (order: OrderItem) => {
    setSelectedOrderForClaim(order);
    setClaimAmountInput(order.returnDetails?.claimAmount || order.orderValue);
    setClaimNotesInput(order.returnDetails?.notes || "");
  };

  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForClaim) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedOrderForClaim.id && o.returnDetails) {
          return {
            ...o,
            returnDetails: {
              ...o.returnDetails,
              returnStatus: "claim_filed",
              claimStatus: "pending",
              claimAmount: claimAmountInput,
              notes: claimNotesInput
            }
          };
        }
        return o;
      })
    );

    setSelectedOrderForClaim(null);
  };

  // Upload parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) return;

        const imported: OrderItem[] = (results.data as Record<string, any>[])
          .filter((row) => row.order_id || row.OrderID || row["Order ID"])
          .map((row, idx) => {
            const orderId = String(
              row.order_id || row.OrderID || row["Order ID"] || `ORD-${Date.now()}-${idx}`
            ).trim();

            const sku = String(
              row.sku || row.SKU || row["Seller SKU"] || "SKU-GEN"
            ).trim();

            const title = String(
              row.title || row.Title || row["Item Name"] || `Item ${sku}`
            ).trim();

            const channel = String(
              row.channel || row.Channel || row.Marketplace || "Amazon"
            ).trim();

            const orderValue =
              parseFloat(
                String(row.order_value || row.Amount || row.Price || 0).replace(/[^0-9.]/g, "")
              ) || 0;

            const quantity =
              parseInt(
                String(row.quantity || row.Qty || 1).replace(/[^0-9]/g, ""),
                10
              ) || 1;

            const customerState = String(
              row.state || row.State || row["Customer State"] || "Delhi"
            ).trim();

            const rawStatus = String(row.status || row.Status || "delivered").toLowerCase();

            let status: OrderStatus = "delivered";
            if (rawStatus.includes("return") || rawStatus.includes("refund")) {
              status = "customer_return";
            } else if (rawStatus.includes("rto") || rawStatus.includes("undelivered")) {
              status = "rto";
            } else if (rawStatus.includes("ship")) {
              status = "shipped";
            } else if (rawStatus.includes("cancel")) {
              status = "cancelled";
            }

            const returnDetails =
              status === "customer_return" || status === "rto"
                ? {
                    returnType: status === "rto" ? ("rto" as const) : ("customer_return" as const),
                    initiatedDate: new Date().toISOString().split("T")[0],
                    returnReason: String(row.return_reason || "Customer return"),
                    returnStatus: "in_transit" as const,
                    reverseShippingFee: 85,
                    claimStatus: "not_required" as const
                  }
                : undefined;

            return {
              id: `imp-ord-${Date.now()}-${idx}`,
              orderId,
              date: String(row.date || new Date().toISOString().split("T")[0]),
              channel,
              sku,
              title,
              quantity,
              orderValue,
              customerState,
              status,
              returnDetails
            };
          });

        setOrders((prev) => [...imported, ...prev]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Order_ID,Date,Channel,SKU,Title,Quantity,Order_Value,Customer_State,Status,Return_Reason\n" +
      "402-1928472-1029381,2026-11-18,Amazon,AMZ-COT-SHT-BLU-M,Men Pure Cotton Regular Fit Shirt,1,899,Delhi,delivered,\n" +
      "OD49201948201948,2026-11-17,Flipkart,FK-RUN-SHO-BLK-09,Running Shoes - Black (UK 9),1,1249,Maharashtra,customer_return,Size too small\n" +
      "MEE-84729103,2026-11-16,Meesho,MSH-SLK-SAREE-RED,Kanjivaram Art Silk Saree,1,649,Rajasthan,rto,Customer refused COD delivery\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sellora_orders_returns_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered dataset
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerState.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel =
      channelFilter === "All" || o.channel === channelFilter;

    if (activeTab === "returns") {
      const isReturn = o.status === "customer_return" || o.status === "rto";
      if (!isReturn) return false;

      const matchesReturnStatus =
        returnStatusFilter === "All" ||
        o.returnDetails?.returnStatus === returnStatusFilter;

      return matchesSearch && matchesChannel && matchesReturnStatus;
    }

    const matchesOrderStatus =
      orderStatusFilter === "All" ||
      (orderStatusFilter === "delivered" && o.status === "delivered") ||
      (orderStatusFilter === "shipped" && o.status === "shipped") ||
      (orderStatusFilter === "returns" &&
        (o.status === "customer_return" || o.status === "rto")) ||
      (orderStatusFilter === "cancelled" && o.status === "cancelled");

    return matchesSearch && matchesChannel && matchesOrderStatus;
  });

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.tsv,.txt"
        className="hidden"
      />

      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
              {activeTab === "orders" ? "Orders & Shipments" : "Returns & RTO Tracker"}
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            {activeTab === "orders"
              ? "Track order fulfillment, sales revenues, and interstate dispatch records."
              : "Monitor reverse logistics, courier RTOs, customer returns, and filed claims."}
          </p>
        </div>

        {/* Tab pills & Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Tab Control */}
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/70 text-xs">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "orders"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>All Orders</span>
              <span className="text-[10px] bg-zinc-200/70 text-zinc-700 px-1.5 py-0.2 rounded-full">
                {totalOrders}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("returns")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "returns"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Returns & RTO</span>
              {totalReturnsCount > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded-full">
                  {totalReturnsCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={downloadSampleTemplate}
            title="Download CSV Template"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden md:inline">Template</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 rounded-lg transition shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Orders Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {activeTab === "orders" ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Total Orders</span>
              <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">{totalOrders}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Across all platforms</div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Gross Order Value</span>
              <IndianRupee className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">
              ₹ {grossSales.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Active orders
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Return / RTO Rate</span>
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">
              {returnRatePct}%
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5">
              {totalReturnsCount} returned units
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Shipped In-Transit</span>
              <Truck className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">
              {orders.filter((o) => o.status === "shipped").length}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Awaiting delivery</div>
          </div>
        </div>
      ) : (
        /* Returns Specific KPIs */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Total Returns</span>
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">
              {totalReturnsCount}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {orders.filter((o) => o.status === "rto").length} RTO •{" "}
              {orders.filter((o) => o.status === "customer_return").length} Customer
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Reverse Logistics Cost</span>
              <IndianRupee className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-semibold text-rose-600 mt-1">
              ₹ {totalReverseShippingLeakage.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-rose-500/80 mt-0.5">Courier fee leakage</div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Pending Claims</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">
              {pendingClaimsCount}
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">
              ₹ {pendingClaimsAmount.toLocaleString("en-IN")} filed
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Restocked to Inventory</span>
              <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-semibold text-emerald-600 mt-1">
              {
                returnsAndRTOList.filter(
                  (o) => o.returnDetails?.returnStatus === "restocked"
                ).length
              }
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Verified healthy units</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, SKU, product, or customer state..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Channel Filter */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/70 text-xs">
            {["All", "Amazon", "Flipkart", "Meesho"].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  channelFilter === ch
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Sub-status filters */}
          {activeTab === "orders" ? (
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 focus:outline-none focus:border-zinc-900 transition"
            >
              <option value="All">All Order Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="shipped">Shipped (In Transit)</option>
              <option value="returns">Returns & RTO</option>
              <option value="cancelled">Cancelled</option>
            </select>
          ) : (
            <select
              value={returnStatusFilter}
              onChange={(e) => setReturnStatusFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 focus:outline-none focus:border-zinc-900 transition"
            >
              <option value="All">All Return Stages</option>
              <option value="in_transit">In-Transit (Reverse)</option>
              <option value="received">Received at Warehouse</option>
              <option value="damaged">Damaged / Wrong Item</option>
              <option value="claim_filed">Claim Filed</option>
              <option value="restocked">Restocked</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/60 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">SKU & Product</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Order Value</th>
                <th className="py-3 px-4">Destination</th>
                {activeTab === "orders" ? (
                  <th className="py-3 px-4 text-center">Status</th>
                ) : (
                  <>
                    <th className="py-3 px-4">Return Reason & Type</th>
                    <th className="py-3 px-4 text-right">Courier Fee</th>
                    <th className="py-3 px-4 text-center">Return Status & Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "orders" ? 7 : 9}
                    className="text-center py-12 text-zinc-400"
                  >
                    <ShoppingBag className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                    <div>No orders found.</div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Upload an order/return report or adjust search filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/70 transition-colors"
                    >
                      {/* Order ID & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-zinc-900">
                          {order.orderId}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                          {order.date}
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                          {order.channel}
                        </span>
                      </td>

                      {/* SKU & Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-mono text-[11px] font-semibold text-zinc-900">
                          {order.sku}
                        </div>
                        <div className="truncate text-zinc-600 mt-0.5" title={order.title}>
                          {order.title}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-center font-medium text-zinc-700">
                        {order.quantity}
                      </td>

                      {/* Order Value */}
                      <td className="py-3 px-4 text-right font-semibold text-zinc-900">
                        ₹ {order.orderValue}
                      </td>

                      {/* Destination State */}
                      <td className="py-3 px-4">
                        <span className="text-zinc-600 text-xs">
                          {order.customerState}
                        </span>
                      </td>

                      {/* Order View: Status */}
                      {activeTab === "orders" && (
                        <td className="py-3 px-4 text-center">
                          {order.status === "delivered" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Delivered</span>
                            </span>
                          )}
                          {order.status === "shipped" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Truck className="w-3 h-3" />
                              <span>Shipped</span>
                            </span>
                          )}
                          {order.status === "customer_return" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <RotateCcw className="w-3 h-3" />
                              <span>Customer Return</span>
                            </span>
                          )}
                          {order.status === "rto" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Courier RTO</span>
                            </span>
                          )}
                          {order.status === "cancelled" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-500">
                              Cancelled
                            </span>
                          )}
                        </td>
                      )}

                      {/* Returns Specific Columns */}
                      {activeTab === "returns" && (
                        <>
                          {/* Return Reason & Type */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {order.status === "rto" ? (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                                  RTO (Courier Return)
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                                  Customer Return
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-700 truncate" title={order.returnDetails?.returnReason}>
                              {order.returnDetails?.returnReason || "Reason unspecified"}
                            </div>
                          </td>

                          {/* Reverse Shipping Fee Leakage */}
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium text-rose-600">
                              - ₹ {order.returnDetails?.reverseShippingFee || 0}
                            </span>
                          </td>

                          {/* Return Status & Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Stage Badge */}
                              {order.returnDetails?.returnStatus === "in_transit" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  <Truck className="w-3 h-3" />
                                  <span>In Transit</span>
                                </span>
                              )}

                              {order.returnDetails?.returnStatus === "received" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  <span>Received (Unverified)</span>
                                </span>
                              )}

                              {order.returnDetails?.returnStatus === "restocked" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Restocked</span>
                                </span>
                              )}

                              {order.returnDetails?.returnStatus === "damaged" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Damaged</span>
                                </span>
                              )}

                              {order.returnDetails?.returnStatus === "claim_filed" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                  <ShieldAlert className="w-3 h-3" />
                                  <span>Claim Filed</span>
                                </span>
                              )}

                              {/* Action Trigger */}
                              <div className="relative group/menu inline-block text-left">
                                <button className="p-1 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition">
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <div className="hidden group-hover/menu:block absolute right-0 mt-1 w-44 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-30 text-left text-xs font-normal">
                                  <button
                                    onClick={() => updateReturnStatus(order.orderId, "received")}
                                    className="w-full px-3 py-1.5 hover:bg-zinc-50 text-zinc-700 text-left flex items-center gap-1.5"
                                  >
                                    <span>Mark Received</span>
                                  </button>
                                  <button
                                    onClick={() => updateReturnStatus(order.orderId, "restocked")}
                                    className="w-full px-3 py-1.5 hover:bg-zinc-50 text-emerald-700 text-left flex items-center gap-1.5"
                                  >
                                    <PackageCheck className="w-3.5 h-3.5" />
                                    <span>Verify & Restock</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenClaimModal(order)}
                                    className="w-full px-3 py-1.5 hover:bg-zinc-50 text-rose-700 text-left flex items-center gap-1.5"
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>File Dispute / Claim</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: File Marketplace Claim (SAFE-T / SPF / Meesho Dispute) ================= */}
      {selectedOrderForClaim && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">
                  File Marketplace Claim / Dispute
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Order: {selectedOrderForClaim.orderId} ({selectedOrderForClaim.channel})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForClaim(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClaim} className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                <div className="font-semibold">
                  {selectedOrderForClaim.channel === "Amazon"
                    ? "Amazon SAFE-T Claim Protocol"
                    : selectedOrderForClaim.channel === "Flipkart"
                    ? "Flipkart SPF (Seller Protection Fund)"
                    : "Meesho Return Dispute Claim"}
                </div>
                <div className="text-[11px] text-amber-700">
                  File this claim for damaged, empty box, or wrong items returned by the customer.
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Claim Reimbursement Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={claimAmountInput}
                  onChange={(e) => setClaimAmountInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Damage Notes & Ticket ID
                </label>
                <textarea
                  rows={3}
                  value={claimNotesInput}
                  onChange={(e) => setClaimNotesInput(e.target.value)}
                  placeholder="e.g. Received package with broken seal and dented product. Ticket #884920 opened with seller support."
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForClaim(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
                >
                  Submit Claim Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
