import React, { useState, useMemo } from "react";
import {
  HardDrive,
  Cloud,
  LogOut,
  UploadCloud,
  FileSpreadsheet,
  Package,
  TrendingUp,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  SlidersHorizontal,
  Calendar,
  ShoppingBag,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  CalendarRange
} from "lucide-react";
import { WorkspaceSession } from "../types";
import { InventoryView } from "./InventoryView";
import { OrdersView } from "./OrdersView";

interface DashboardProps {
  session: WorkspaceSession;
  onExitSession: () => void;
}

type DatePreset = "today" | "7d" | "this_month" | "last_month" | "custom";

export const Dashboard: React.FC<DashboardProps> = ({ session, onExitSession }) => {
  const [selectedChannel, setSelectedChannel] = useState<string>("All Channels");
  const [activeNav, setActiveNav] = useState<string>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sellora_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Date Filter State
  const [datePreset, setDatePreset] = useState<DatePreset>("this_month");
  const [startDate, setStartDate] = useState<string>("2026-11-01");
  const [endDate, setEndDate] = useState<string>("2026-11-19");
  const [showCustomRange, setShowCustomRange] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sellora_sidebar_collapsed", String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleSelectPreset = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === "today") {
      setStartDate("2026-11-19");
      setEndDate("2026-11-19");
      setShowCustomRange(false);
    } else if (preset === "7d") {
      setStartDate("2026-11-12");
      setEndDate("2026-11-19");
      setShowCustomRange(false);
    } else if (preset === "this_month") {
      setStartDate("2026-11-01");
      setEndDate("2026-11-19");
      setShowCustomRange(false);
    } else if (preset === "last_month") {
      setStartDate("2026-10-01");
      setEndDate("2026-10-31");
      setShowCustomRange(false);
    } else if (preset === "custom") {
      setShowCustomRange(true);
    }
  };

  // Dynamic calculations based on channel and date preset
  const metrics = useMemo(() => {
    // Channel multiplier
    let chMult = 1.0;
    if (selectedChannel === "Amazon") chMult = 0.52;
    else if (selectedChannel === "Flipkart") chMult = 0.33;
    else if (selectedChannel === "Meesho") chMult = 0.15;

    // Date preset baseline
    let baseGross = 482450;
    let growth = "+14.2%";

    if (datePreset === "today") {
      baseGross = 18950;
      growth = "+8.5%";
    } else if (datePreset === "7d") {
      baseGross = 124600;
      growth = "+11.3%";
    } else if (datePreset === "this_month") {
      baseGross = 482450;
      growth = "+14.2%";
    } else if (datePreset === "last_month") {
      baseGross = 412800;
      growth = "+9.7%";
    } else if (datePreset === "custom") {
      baseGross = 295400;
      growth = "+12.0%";
    }

    const grossSales = Math.round(baseGross * chMult);
    const marketplaceFees = Math.round(grossSales * 0.235); // 23.5% commission & courier
    const cogs = Math.round(grossSales * 0.397); // 39.7% cost of goods sold
    const netProfit = grossSales - marketplaceFees - cogs;
    const netProfitMargin = grossSales > 0 ? ((netProfit / grossSales) * 100).toFixed(1) : "0";
    const netSettlement = grossSales - marketplaceFees;
    const returnRate = selectedChannel === "Meesho" ? "14.8%" : selectedChannel === "Flipkart" ? "12.4%" : "9.8%";
    const gstLiability = Math.round(grossSales * 0.071);

    return {
      grossSales,
      marketplaceFees,
      cogs,
      netProfit,
      netProfitMargin,
      netSettlement,
      returnRate,
      gstLiability,
      growth
    };
  }, [selectedChannel, datePreset]);

  const isOffline = session.mode === "offline";

  const navItems = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "returns", label: "Returns & RTO", icon: RotateCcw },
    { id: "settlements", label: "Settlements", icon: FileSpreadsheet },
    { id: "gst", label: "GST Portal JSON", icon: Receipt }
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Sidebar Toggle in Top Bar */}
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-semibold text-xs">
              S
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-900">
              Sellora
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

          {/* Active Workspace Info */}
          <div className="flex items-center space-x-2">
            <span className="font-medium text-xs text-zinc-700">
              {session.businessName}
            </span>
            {isOffline ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <HardDrive className="w-3 h-3" />
                <span>Offline</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Cloud className="w-3 h-3" />
                <span>Cloud</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {session.state && (
            <span className="hidden md:inline-block text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
              {session.state}
            </span>
          )}

          <button
            onClick={onExitSession}
            title="Switch Workspace / Sign Out"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 px-2.5 py-1.5 rounded-md border border-zinc-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isOffline ? "Close" : "Sign Out"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Left Sidebar */}
        <aside
          className={`${
            isSidebarCollapsed ? "w-16" : "w-56"
          } shrink-0 hidden md:flex flex-col justify-between py-2 transition-all duration-200 ease-in-out`}
        >
          <div className="space-y-4">
            {/* Header of Sidebar with expand/collapse */}
            <div className="flex items-center justify-between px-2 pb-1">
              {!isSidebarCollapsed && (
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Menu
                </span>
              )}
              <button
                onClick={toggleSidebar}
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={`p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition ${
                  isSidebarCollapsed ? "mx-auto" : ""
                }`}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Nav list */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-lg text-xs font-medium transition ${
                      isSidebarCollapsed
                        ? "justify-center p-2.5"
                        : "gap-2.5 px-3 py-2"
                    } ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Notice / Bottom indicator */}
          {!isSidebarCollapsed ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-900">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  GSTR-1 Due
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">11th</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-snug">
                JSON payload format ready for direct GST portal upload.
              </p>
            </div>
          ) : (
            <div
              title="GSTR-1 Due 11th"
              className="mx-auto p-2 rounded-lg bg-white border border-zinc-200 text-zinc-500 text-center cursor-default shadow-xs"
            >
              <Calendar className="w-4 h-4 mx-auto text-zinc-600" />
              <div className="text-[10px] font-mono font-bold text-zinc-700 mt-1">11th</div>
            </div>
          )}
        </aside>

        {/* Center Dashboard View */}
        <main className="flex-1 min-w-0">
          {activeNav === "inventory" ? (
            <InventoryView session={session} />
          ) : activeNav === "orders" ? (
            <OrdersView session={session} initialTab="orders" />
          ) : activeNav === "returns" ? (
            <OrdersView session={session} initialTab="returns" />
          ) : (
            <div className="space-y-6">
              {/* Header with Title & Channel Switcher */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
                <div>
                  <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
                    Financial & Performance Overview
                  </h1>
                  <p className="text-xs text-zinc-500">
                    Real-time net margin, revenue reconciliation, and marketplace fee analysis.
                  </p>
                </div>

                {/* Channel Filter Pills */}
                <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/70 text-xs">
                  {["All Channels", "Amazon", "Flipkart", "Meesho"].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSelectedChannel(ch)}
                      className={`px-3 py-1 rounded-md font-medium transition ${
                        selectedChannel === ch
                          ? "bg-white text-zinc-900 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* DATE FILTERS BAR */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium mr-1">
                    <CalendarRange className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Period:</span>
                  </div>

                  <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/70 text-xs">
                    {[
                      { id: "today" as const, label: "Today" },
                      { id: "7d" as const, label: "Last 7 Days" },
                      { id: "this_month" as const, label: "This Month" },
                      { id: "last_month" as const, label: "Last Month" },
                      { id: "custom" as const, label: "Custom Range" }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                          datePreset === p.id
                            ? "bg-white text-zinc-900 shadow-xs"
                            : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Date Label / Inputs */}
                <div className="flex items-center gap-2">
                  {showCustomRange ? (
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                      />
                      <span className="text-zinc-400 font-mono">to</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 font-mono bg-zinc-50 border border-zinc-200/60 px-2.5 py-1 rounded-md">
                      {startDate} &rarr; {endDate}
                    </div>
                  )}
                </div>
              </div>

              {/* ================= HERO: TOTAL NET PROFIT BLOCK ================= */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left: Net Profit Highlight */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Total Net Profit (In-Pocket Realized)
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>{metrics.growth} vs prior</span>
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <div className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 flex items-center">
                        <span className="text-xl sm:text-2xl font-normal text-zinc-400 mr-1">₹</span>
                        {metrics.netProfit.toLocaleString("en-IN")}
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                        {metrics.netProfitMargin}% Net Margin
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500">
                      Calculated after deducting marketplace commissions, courier freight, reverse logistics, and product purchase costs.
                    </p>
                  </div>

                  {/* Right: Step-by-Step P&L Formula Breakdown */}
                  <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50/70 border border-zinc-100 rounded-xl p-3.5 text-xs">
                    <div>
                      <div className="text-[11px] text-zinc-500">Gross Sales</div>
                      <div className="font-semibold text-zinc-900 mt-0.5">
                        ₹ {metrics.grossSales.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">100% Revenue</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-rose-500 font-medium">Platform & Courier</div>
                      <div className="font-semibold text-rose-600 mt-0.5">
                        - ₹ {metrics.marketplaceFees.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">~23.5% Fees</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-amber-600 font-medium">Product COGS</div>
                      <div className="font-semibold text-amber-700 mt-0.5">
                        - ₹ {metrics.cogs.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Purchase cost</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-emerald-600 font-semibold">Net Profit</div>
                      <div className="font-bold text-emerald-700 mt-0.5">
                        = ₹ {metrics.netProfit.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                        In-hand balance
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-zinc-500 font-medium">Gross Sales</div>
                  <div className="text-xl font-semibold text-zinc-900 mt-1">
                    ₹ {metrics.grossSales.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{metrics.growth}</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-zinc-500 font-medium">Net Settlement Received</div>
                  <div className="text-xl font-semibold text-zinc-900 mt-1">
                    ₹ {metrics.netSettlement.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Post marketplace deductions</div>
                </div>

                <div
                  onClick={() => setActiveNav("returns")}
                  className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs cursor-pointer hover:border-zinc-300 transition"
                >
                  <div className="text-xs text-zinc-500 font-medium">Return & RTO Rate</div>
                  <div className="text-xl font-semibold text-zinc-900 mt-1">
                    {metrics.returnRate}
                  </div>
                  <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    <span>View Returns Tracker &rarr;</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-zinc-500 font-medium">Net GST Liability</div>
                  <div className="text-xl font-semibold text-zinc-900 mt-1">
                    ₹ {metrics.gstLiability.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">GSTR-1 JSON ready</div>
                </div>
              </div>

              {/* Action Quick Launchers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Import Settlement */}
                <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-xs space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-sm">
                      Import Settlements
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Upload Amazon MTR, Flipkart Settlement, or Meesho payment sheet.
                    </p>
                  </div>
                  <button className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-1.5 transition">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload CSV / XLSX</span>
                  </button>
                </div>

                {/* Commission & Fee Audit */}
                <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-xs space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-sm">
                      Fee & Weight Audit
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Detect marketplace overcharges and shipping weight discrepancies.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav("returns")}
                    className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 flex items-center justify-center gap-1.5 transition"
                  >
                    <span>View Returns & Disputes</span>
                  </button>
                </div>

                {/* GST Portal Export */}
                <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-xs space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-sm">
                      Export GSTR-1 JSON
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Generate state-wise e-commerce sales payload for government portal.
                    </p>
                  </div>
                  <button className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 flex items-center justify-center gap-1.5 transition">
                    <span>Generate JSON</span>
                  </button>
                </div>
              </div>

              {/* Local Status Bar */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    {isOffline
                      ? "Local storage active (SQLite). Files remain private on this machine."
                      : "Cloud sync active."}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400">
                  {(session.channels || ["Amazon", "Flipkart", "Meesho"]).map((ch) => (
                    <span
                      key={ch}
                      className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[11px]"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
