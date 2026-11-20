import React, { useState, useRef, useEffect } from "react";
import {
  ShoppingBag,
  RotateCcw,
  Search,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Truck,
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
    <div className="space-y-3 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.tsv,.txt"
        className="hidden"
      />

      {/* ================= COMPACT DESKTOP STAT RIBBON ================= */}
      {activeTab === "orders" ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-zinc-50 border border-zinc-200/90 rounded-lg p-2.5 font-mono text-xs">
          <div className="border-r border-zinc-200/80 pr-2">
            <div className="text-[10px] text-zinc-400 uppercase">Total Orders</div>
            <div className="font-semibold text-zinc-900 mt-0.5">
              {totalOrders} Orders <span className="text-[10px] text-zinc-400 font-normal">All channels</span>
            </div>
          </div>

          <div className="border-r border-zinc-200/80 pr-2">
            <div className="text-[10px] text-zinc-400 uppercase">Gross Order Value</div>
            <div className="font-semibold text-zinc-900 mt-0.5">
              ₹ {grossSales.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="border-r border-zinc-200/80 pr-2">
            <div className="text-[10px] text-amber-600 uppercase">Return / RTO Rate</div>
            <div className="font-semibold text-amber-700 mt-0.5">
              {returnRatePct}% <span className="text-[10px] text-zinc-400 font-normal">({totalReturnsCount} units)</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 uppercase">In-Transit (Dispatched)</div>
            <div className="font-semibold text-zinc-800 mt-0.5">
              {orders.filter((o) => o.status === "shipped").length} shipments
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-zinc-50 border border-zinc-200/90 rounded-lg p-2.5 font-mono text-xs">
          <div className="border-r border-zinc-200/80 pr-2">
            <div className="text-[10px] text-zinc-400 uppercase">Total Returns Count</div>
            <div className="font-semibold text-zinc-900 mt-0.5">
              {totalReturnsCount} Units <span className="text-[10px] text-zinc-400 font-normal">({orders.filter((o) => o.status === "rto").length} RTO)</span>
            </div>
          </div>

          <div className="border-r border-zinc-200/80 pr-2">
            <div className="text-[10px] text-rose-500 uppercase">Reverse Logistics Cost</div>
            <div className="font-semibold text-rose-600 mt-0.5">
              - ₹ {totalReverseShippingLeakage.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="border-r border-zinc-200/80 pr-2">
            <div className="text-[10px] text-amber-600 uppercase">Pending Claims</div>
            <div className="font-semibold text-amber-700 mt-0.5">
              {pendingClaimsCount} Claims <span className="text-[10px] text-zinc-400 font-normal">(₹ {pendingClaimsAmount})</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-emerald-600 uppercase font-semibold">Restocked Units</div>
            <div className="font-semibold text-emerald-700 mt-0.5">
              {returnsAndRTOList.filter((o) => o.returnDetails?.returnStatus === "restocked").length} Restocked
            </div>
          </div>
        </div>
      )}

      {/* ================= DENSE TOOLBAR ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white border border-zinc-200/90 rounded-lg p-2 shadow-2xs">
        {/* Left: Tab Switcher & Search */}
        <div className="flex items-center gap-2 flex-1">
          {/* Segmented Tab */}
          <div className="flex bg-zinc-100 p-0.5 rounded border border-zinc-200 text-xs">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition ${
                activeTab === "orders"
                  ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Orders ({totalOrders})</span>
            </button>

            <button
              onClick={() => setActiveTab("returns")}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition ${
                activeTab === "returns"
                  ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Returns & RTO ({totalReturnsCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, SKU, State..."
              className="w-full pl-8 pr-2.5 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition"
            />
          </div>

          {/* Channel Filter */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded border border-zinc-200 text-xs">
            {["All", "Amazon", "Flipkart", "Meesho"].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  channelFilter === ch
                    ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Status selector */}
          {activeTab === "orders" ? (
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="shipped">Shipped</option>
              <option value="returns">Returns / RTO</option>
              <option value="cancelled">Cancelled</option>
            </select>
          ) : (
            <select
              value={returnStatusFilter}
              onChange={(e) => setReturnStatusFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-700 focus:outline-none"
            >
              <option value="All">All Return Stages</option>
              <option value="in_transit">In-Transit</option>
              <option value="received">Warehouse Received</option>
              <option value="damaged">Damaged Box</option>
              <option value="claim_filed">Claim Filed</option>
              <option value="restocked">Restocked</option>
            </select>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={downloadSampleTemplate}
            title="Download CSV Template"
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded transition"
          >
            <Download className="w-3 h-3 text-zinc-400" />
            <span>Template</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-[11px] font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded transition"
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload Orders Sheet</span>
          </button>
        </div>
      </div>

      {/* ================= DATA GRID / ORDERS TABLE ================= */}
      <div className="bg-white border border-zinc-200/90 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/90 bg-zinc-50 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                <th className="py-2 px-3">Order ID & Date</th>
                <th className="py-2 px-3">Channel</th>
                <th className="py-2 px-3">SKU & Item</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3 text-right">Order Value</th>
                <th className="py-2 px-3">Destination</th>
                {activeTab === "orders" ? (
                  <th className="py-2 px-3 text-center">Status</th>
                ) : (
                  <>
                    <th className="py-2 px-3">Return Reason</th>
                    <th className="py-2 px-3 text-right">Courier Fee</th>
                    <th className="py-2 px-3 text-center w-36">Return Stage</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "orders" ? 7 : 9}
                    className="text-center py-12 text-zinc-400"
                  >
                    <ShoppingBag className="w-6 h-6 mx-auto text-zinc-300 mb-1" />
                    <div className="text-xs">No orders matching filter criteria</div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      {/* Order ID & Date */}
                      <td className="py-1.5 px-3">
                        <div className="font-mono text-[11px] font-semibold text-zinc-900">
                          {order.orderId}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {order.date}
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-1.5 px-3">
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {order.channel}
                        </span>
                      </td>

                      {/* SKU & Title */}
                      <td className="py-1.5 px-3 max-w-xs">
                        <div className="font-mono text-[11px] font-medium text-zinc-900">
                          {order.sku}
                        </div>
                        <div className="truncate text-xs text-zinc-600" title={order.title}>
                          {order.title}
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="py-1.5 px-3 text-center font-mono text-zinc-700">
                        {order.quantity}
                      </td>

                      {/* Value */}
                      <td className="py-1.5 px-3 text-right font-mono font-semibold text-zinc-900">
                        ₹ {order.orderValue}
                      </td>

                      {/* Destination */}
                      <td className="py-1.5 px-3 text-xs text-zinc-600">
                        {order.customerState}
                      </td>

                      {/* Order Status */}
                      {activeTab === "orders" && (
                        <td className="py-1.5 px-3 text-center font-mono text-[10px]">
                          {order.status === "delivered" && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Delivered
                            </span>
                          )}
                          {order.status === "shipped" && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                              <Truck className="w-2.5 h-2.5" />
                              Shipped
                            </span>
                          )}
                          {order.status === "customer_return" && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                              <RotateCcw className="w-2.5 h-2.5" />
                              Cust Return
                            </span>
                          )}
                          {order.status === "rto" && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Courier RTO
                            </span>
                          )}
                          {order.status === "cancelled" && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-500 font-medium">
                              Cancelled
                            </span>
                          )}
                        </td>
                      )}

                      {/* Returns Columns */}
                      {activeTab === "returns" && (
                        <>
                          <td className="py-1.5 px-3 max-w-xs">
                            <div className="flex items-center gap-1 mb-0.5">
                              {order.status === "rto" ? (
                                <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-rose-100 text-rose-800">
                                  RTO
                                </span>
                              ) : (
                                <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-amber-100 text-amber-800">
                                  Return
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-700 truncate text-[11px]" title={order.returnDetails?.returnReason}>
                              {order.returnDetails?.returnReason || "Customer return"}
                            </div>
                          </td>

                          <td className="py-1.5 px-3 text-right font-mono text-rose-600 font-medium">
                            - ₹ {order.returnDetails?.reverseShippingFee || 0}
                          </td>

                          <td className="py-1.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                              {order.returnDetails?.returnStatus === "in_transit" && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                                  In Transit
                                </span>
                              )}
                              {order.returnDetails?.returnStatus === "received" && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                  Received
                                </span>
                              )}
                              {order.returnDetails?.returnStatus === "restocked" && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                  Restocked
                                </span>
                              )}
                              {order.returnDetails?.returnStatus === "damaged" && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                                  Damaged
                                </span>
                              )}
                              {order.returnDetails?.returnStatus === "claim_filed" && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                                  Claim Filed
                                </span>
                              )}

                              <div className="relative group/menu inline-block text-left">
                                <button className="p-0.5 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100">
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                <div className="hidden group-hover/menu:block absolute right-0 mt-0.5 w-40 bg-white border border-zinc-200 rounded shadow-lg py-1 z-30 text-left text-xs font-sans">
                                  <button
                                    onClick={() => updateReturnStatus(order.orderId, "received")}
                                    className="w-full px-2.5 py-1 hover:bg-zinc-50 text-zinc-700 text-left text-[11px]"
                                  >
                                    Mark Received
                                  </button>
                                  <button
                                    onClick={() => updateReturnStatus(order.orderId, "restocked")}
                                    className="w-full px-2.5 py-1 hover:bg-zinc-50 text-emerald-700 text-left text-[11px] flex items-center gap-1"
                                  >
                                    <PackageCheck className="w-3 h-3" />
                                    <span>Verify & Restock</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenClaimModal(order)}
                                    className="w-full px-2.5 py-1 hover:bg-zinc-50 text-rose-700 text-left text-[11px] flex items-center gap-1"
                                  >
                                    <ShieldAlert className="w-3 h-3" />
                                    <span>File Claim</span>
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

      {/* ================= MODAL: File Marketplace Claim ================= */}
      {selectedOrderForClaim && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200/90 rounded-xl max-w-sm w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div>
                <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider font-mono">
                  File Dispute / Claim
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Order {selectedOrderForClaim.orderId} • {selectedOrderForClaim.channel}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForClaim(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveClaim} className="space-y-2.5 text-xs">
              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                <span className="font-bold">
                  {selectedOrderForClaim.channel === "Amazon"
                    ? "Amazon SAFE-T Claim"
                    : selectedOrderForClaim.channel === "Flipkart"
                    ? "Flipkart SPF Protection"
                    : "Meesho Dispute Ticket"}
                </span>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  Submit claim for wrong or damaged items delivered back to warehouse.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-700 font-mono">
                  Claim Value (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={claimAmountInput}
                  onChange={(e) => setClaimAmountInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1 font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-700">
                  Damage Notes / Ticket ID
                </label>
                <textarea
                  rows={2}
                  value={claimNotesInput}
                  onChange={(e) => setClaimNotesInput(e.target.value)}
                  placeholder="e.g. Package seal broken, empty box returned."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1 focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForClaim(null)}
                  className="px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded transition"
                >
                  Record Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
