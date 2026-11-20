import React, { useState, useMemo } from "react";
import {
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
  Search,
  Command,
  Database,
  CheckCircle2
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
    let chMult = 1.0;
    if (selectedChannel === "Amazon") chMult = 0.52;
    else if (selectedChannel === "Flipkart") chMult = 0.33;
    else if (selectedChannel === "Meesho") chMult = 0.15;

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
    const marketplaceFees = Math.round(grossSales * 0.235);
    const cogs = Math.round(grossSales * 0.397);
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

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-zinc-900 select-none overflow-hidden font-sans">
      {/* ================= 1. NATIVE DESKTOP TITLEBAR / TOOLBAR ================= */}
      <header className="h-10 bg-zinc-50 border-b border-zinc-200/90 px-3 flex items-center justify-between shrink-0 titlebar-drag-region">
        {/* Left Chrome: Window traffic lights, sidebar toggle & workspace selector */}
        <div className="flex items-center space-x-2.5 titlebar-no-drag">
          {/* macOS window controls mock */}
          <div className="flex items-center space-x-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 border border-zinc-400/40 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 border border-zinc-400/40 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 border border-zinc-400/40 inline-block" />
          </div>

          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
            className="p-1 rounded text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 transition"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="h-3.5 w-px bg-zinc-200" />

          {/* Workspace Pill Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs">
            <div className="w-4 h-4 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-[9px]">
              S
            </div>
            <span className="font-semibold text-zinc-800 text-[12px] truncate max-w-[140px]">
              {session.businessName}
            </span>
            {isOffline ? (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Local SQLite
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Cloud Synced
              </span>
            )}
          </div>
        </div>

        {/* Center: Command Bar / Quick Search */}
        <div className="hidden sm:flex items-center justify-center titlebar-no-drag max-w-sm w-full mx-4">
          <div className="w-full flex items-center bg-white border border-zinc-200/90 rounded-md px-2.5 py-1 text-xs text-zinc-400 shadow-2xs hover:border-zinc-300 cursor-pointer">
            <Search className="w-3.5 h-3.5 mr-2 text-zinc-400" />
            <span className="flex-1 text-[11px] truncate">Search SKUs, Orders, Invoices...</span>
            <kbd className="inline-flex items-center gap-0.5 font-mono text-[9px] bg-zinc-100 text-zinc-500 border border-zinc-200 px-1.5 py-0.2 rounded">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </div>

        {/* Right Chrome: Status & Workspace Close */}
        <div className="flex items-center space-x-2 titlebar-no-drag text-xs">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Port 8000 Ready</span>
          </div>

          <button
            onClick={onExitSession}
            title="Switch Workspace / Sign Out"
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 transition"
          >
            <LogOut className="w-3 h-3" />
            <span>{isOffline ? "Close" : "Sign Out"}</span>
          </button>
        </div>
      </header>

      {/* ================= 2. DESKTOP MAIN WORKBENCH (SPLIT PANE) ================= */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar Navigation */}
        <aside
          className={`${
            isSidebarCollapsed ? "w-14" : "w-52"
          } bg-zinc-50/90 border-r border-zinc-200/90 flex flex-col justify-between shrink-0 transition-all duration-150 ease-in-out select-none`}
        >
          <div className="p-2 space-y-4 overflow-y-auto">
            {/* WORKSPACE NAV */}
            <div>
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-1">
                  Workspace
                </div>
              )}
              <nav className="space-y-0.5">
                {[
                  { id: "overview", label: "Overview", icon: TrendingUp, shortcut: "⌘1" },
                  { id: "inventory", label: "Inventory", icon: Package, shortcut: "⌘2" },
                  { id: "orders", label: "Orders", icon: ShoppingBag, shortcut: "⌘3" },
                  { id: "returns", label: "Returns & RTO", icon: RotateCcw, badge: "4" }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center rounded-md text-xs font-medium transition ${
                        isSidebarCollapsed
                          ? "justify-center p-2"
                          : "justify-between px-2.5 py-1.5"
                      } ${
                        isActive
                          ? "bg-zinc-900 text-white shadow-2xs font-semibold"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!isSidebarCollapsed && (
                        <div>
                          {item.badge ? (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {item.badge}
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-mono ${
                                isActive ? "text-zinc-400" : "text-zinc-400"
                              }`}
                            >
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* COMPLIANCE & REPORTS */}
            <div>
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-1">
                  Tax & Audits
                </div>
              )}
              <nav className="space-y-0.5">
                {[
                  { id: "settlements", label: "Settlements", icon: FileSpreadsheet },
                  { id: "gst", label: "GST Portal JSON", icon: Receipt }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center rounded-md text-xs font-medium transition ${
                        isSidebarCollapsed
                          ? "justify-center p-2"
                          : "justify-start gap-2 px-2.5 py-1.5"
                      } ${
                        isActive
                          ? "bg-zinc-900 text-white shadow-2xs font-semibold"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* CHANNELS SECTION IN SIDEBAR */}
            {!isSidebarCollapsed && (
              <div>
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-1">
                  Channels Filter
                </div>
                <div className="space-y-0.5 px-1">
                  {["All Channels", "Amazon", "Flipkart", "Meesho"].map((ch) => {
                    const isSelected = selectedChannel === ch;
                    return (
                      <button
                        key={ch}
                        onClick={() => setSelectedChannel(ch)}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] font-medium flex items-center justify-between transition ${
                          isSelected
                            ? "bg-zinc-200/80 text-zinc-900 font-semibold"
                            : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ch === "Amazon"
                                ? "bg-amber-500"
                                : ch === "Flipkart"
                                ? "bg-blue-500"
                                : ch === "Meesho"
                                ? "bg-fuchsia-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span>{ch}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-zinc-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer Widget */}
          <div className="p-2 border-t border-zinc-200/80">
            {!isSidebarCollapsed ? (
              <div className="bg-white border border-zinc-200/80 rounded-md p-2 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-800">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    GSTR-1 Due
                  </span>
                  <span className="font-mono text-zinc-500">Nov 11</span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  State: {session.state || "Delhi"}
                </div>
              </div>
            ) : (
              <div
                title="GSTR-1 Due 11th"
                className="w-full flex justify-center py-1 text-zinc-400"
              >
                <Calendar className="w-4 h-4" />
              </div>
            )}
          </div>
        </aside>

        {/* Right Content Viewport (Full Bleed Desktop Pane) */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
          {/* Top Contextual Tool Bar */}
          <div className="h-10 bg-white border-b border-zinc-200/80 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-zinc-400">Workspace</span>
              <span className="text-zinc-300">/</span>
              <span className="font-semibold text-zinc-800 capitalize">
                {activeNav === "gst" ? "GST Portal JSON" : activeNav}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="font-mono text-[11px] text-zinc-500">
                Channel: {selectedChannel}
              </span>
            </div>

            {/* Date Filters inside Toolbar */}
            {activeNav === "overview" && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-zinc-100 p-0.5 rounded border border-zinc-200 text-xs">
                  {[
                    { id: "today" as const, label: "Today" },
                    { id: "7d" as const, label: "7D" },
                    { id: "this_month" as const, label: "This Month" },
                    { id: "last_month" as const, label: "Last Month" },
                    { id: "custom" as const, label: "Custom" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                        datePreset === p.id
                          ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {showCustomRange ? (
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5 text-[11px] text-zinc-800 focus:outline-none"
                    />
                    <span className="text-zinc-400">-</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5 text-[11px] text-zinc-800 focus:outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 rounded">
                    {startDate} &rarr; {endDate}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Scrollable View Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {activeNav === "inventory" ? (
              <InventoryView session={session} />
            ) : activeNav === "orders" ? (
              <OrdersView session={session} initialTab="orders" />
            ) : activeNav === "returns" ? (
              <OrdersView session={session} initialTab="returns" />
            ) : (
              /* ================= OVERVIEW WORKBENCH ================= */
              <div className="space-y-4 max-w-full">
                {/* 1. HERO NET PROFIT DESKTOP PANEL */}
                <div className="bg-white border border-zinc-200/90 rounded-lg p-4 shadow-2xs">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                          P&L Realization
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ArrowUpRight className="w-2.5 h-2.5" />
                          <span>{metrics.growth}</span>
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2.5 mt-1">
                        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-zinc-900">
                          ₹ {metrics.netProfit.toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                          {metrics.netProfitMargin}% Net Margin
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-500 mt-1">
                        In-pocket realized margin after marketplace commissions, courier freight & product cost.
                      </p>
                    </div>

                    {/* Desktop Formula Breakdown Grid */}
                    <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-zinc-50 border border-zinc-200/80 rounded-md p-2.5 text-xs font-mono">
                      <div className="border-r border-zinc-200/60 pr-2">
                        <div className="text-[10px] text-zinc-400 uppercase">Gross Sales</div>
                        <div className="font-semibold text-zinc-900 mt-0.5 text-xs">
                          ₹ {metrics.grossSales.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">100% Revenue</div>
                      </div>

                      <div className="border-r border-zinc-200/60 pr-2">
                        <div className="text-[10px] text-rose-500 uppercase">Platform & Shipping</div>
                        <div className="font-semibold text-rose-600 mt-0.5 text-xs">
                          - ₹ {metrics.marketplaceFees.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">~23.5% Fees</div>
                      </div>

                      <div className="border-r border-zinc-200/60 pr-2">
                        <div className="text-[10px] text-amber-600 uppercase">Product COGS</div>
                        <div className="font-semibold text-amber-700 mt-0.5 text-xs">
                          - ₹ {metrics.cogs.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">Purchase cost</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-emerald-600 uppercase font-bold">Net Profit</div>
                        <div className="font-bold text-emerald-700 mt-0.5 text-xs">
                          = ₹ {metrics.netProfit.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[9px] text-emerald-600 mt-0.5">In-Hand</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DENSE METRICS TILES */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white border border-zinc-200/90 p-3 rounded-lg shadow-2xs">
                    <div className="text-[11px] text-zinc-400 font-medium">Gross Sales Volume</div>
                    <div className="text-lg font-bold font-mono text-zinc-900 mt-1">
                      ₹ {metrics.grossSales.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      <span>{metrics.growth} vs prev period</span>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200/90 p-3 rounded-lg shadow-2xs">
                    <div className="text-[11px] text-zinc-400 font-medium">Net Settlement Receivable</div>
                    <div className="text-lg font-bold font-mono text-zinc-900 mt-1">
                      ₹ {metrics.netSettlement.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                      Post platform deduction
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveNav("returns")}
                    className="bg-white border border-zinc-200/90 hover:border-zinc-300 p-3 rounded-lg shadow-2xs cursor-pointer transition"
                  >
                    <div className="text-[11px] text-zinc-400 font-medium">Return & RTO Rate</div>
                    <div className="text-lg font-bold font-mono text-zinc-900 mt-1">
                      {metrics.returnRate}
                    </div>
                    <div className="text-[10px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>42 units pending check &rarr;</span>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200/90 p-3 rounded-lg shadow-2xs">
                    <div className="text-[11px] text-zinc-400 font-medium">Net GST Output Liability</div>
                    <div className="text-lg font-bold font-mono text-zinc-900 mt-1">
                      ₹ {metrics.gstLiability.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                      GSTR-1 JSON Ready
                    </div>
                  </div>
                </div>

                {/* 3. DESKTOP ACTION TILES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Action 1 */}
                  <div className="bg-white border border-zinc-200/90 p-3.5 rounded-lg shadow-2xs flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Reconcile Settlements</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
                        Ingest Amazon MTR, Flipkart Settlement, or Meesho payment sheet to audit deductions.
                      </p>
                    </div>
                    <button className="w-full py-1.5 px-2.5 text-xs font-medium rounded bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-1.5 transition">
                      <UploadCloud className="w-3 h-3" />
                      <span>Import Settlement File</span>
                    </button>
                  </div>

                  {/* Action 2 */}
                  <div className="bg-white border border-zinc-200/90 p-3.5 rounded-lg shadow-2xs flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Fee & Weight Dispute Audit</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
                        Flag wrong courier weight tier charges and missing returned SKU reimbursements.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveNav("returns")}
                      className="w-full py-1.5 px-2.5 text-xs font-medium rounded bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Inspect Claims & Disputes</span>
                    </button>
                  </div>

                  {/* Action 3 */}
                  <div className="bg-white border border-zinc-200/90 p-3.5 rounded-lg shadow-2xs flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                        <Receipt className="w-3.5 h-3.5 text-zinc-500" />
                        <span>GSTR-1 Portal Payload</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
                        Format e-commerce B2C sales & credit notes directly into government portal JSON.
                      </p>
                    </div>
                    <button className="w-full py-1.5 px-2.5 text-xs font-medium rounded bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 flex items-center justify-center gap-1.5 transition">
                      <span>Generate GSTR-1 JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ================= 3. NATIVE DESKTOP STATUS BAR ================= */}
      <footer className="h-6 bg-zinc-50 border-t border-zinc-200/90 px-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-600" />
            <span>SQLite: ~/.sellora/store.db</span>
          </span>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-500">FastAPI Port: 8000 (Active)</span>
        </div>

        <div className="flex items-center space-x-3">
          <span>Channel Sync: Active</span>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-400">Sellora Native v0.1.0</span>
        </div>
      </footer>
    </div>
  );
};
