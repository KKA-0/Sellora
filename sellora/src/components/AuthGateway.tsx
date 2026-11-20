import React, { useState } from "react";
import {
  HardDrive,
  Cloud,
  ShieldCheck,
  Check,
  Store,
  Layers,
  ArrowRight,
  Database,
  Lock,
  Mail,
  Building2
} from "lucide-react";
import { WorkspaceSession } from "../types";

interface AuthGatewayProps {
  onStartSession: (session: WorkspaceSession) => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onStartSession }) => {
  const [activeTab, setActiveTab] = useState<"offline" | "cloud">("offline");
  const [cloudSubTab, setCloudSubTab] = useState<"signin" | "signup">("signin");

  // Offline form
  const [offlineStoreName, setOfflineStoreName] = useState("My Retail Store");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "Amazon",
    "Flipkart",
    "Meesho"
  ]);
  const [selectedState, setSelectedState] = useState("Delhi");

  // Cloud form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleStartOffline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineStoreName.trim()) {
      setErrorMsg("Please enter a workspace name.");
      return;
    }
    setErrorMsg("");
    onStartSession({
      mode: "offline",
      businessName: offlineStoreName,
      state: selectedState,
      channels: selectedChannels
    });
  };

  const handleCloudSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }
    if (cloudSubTab === "signup" && !businessName) {
      setErrorMsg("Please enter business name.");
      return;
    }
    setErrorMsg("");
    onStartSession({
      mode: "cloud",
      email,
      businessName: businessName || email.split("@")[0],
      gstin: gstin.toUpperCase(),
      channels: ["Amazon", "Flipkart", "Meesho"]
    });
  };

  return (
    <div className="h-screen w-screen bg-zinc-100/90 text-zinc-900 flex flex-col justify-center items-center p-6 select-none overflow-hidden font-sans">
      {/* Native Desktop Window Container */}
      <div className="w-full max-w-[760px] bg-white border border-zinc-200/90 rounded-xl shadow-xl shadow-zinc-900/5 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Title Bar / Header */}
        <div className="h-10 bg-zinc-50 border-b border-zinc-200 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* macOS traffic light window dots */}
            <div className="flex space-x-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 border border-zinc-400/40 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 border border-zinc-400/40 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 border border-zinc-400/40 inline-block" />
            </div>
            <div className="flex items-center space-x-1.5 font-semibold text-xs tracking-tight text-zinc-800">
              <span className="w-4 h-4 rounded bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                S
              </span>
              <span>Sellora Desktop</span>
              <span className="text-[10px] text-zinc-400 font-normal">v0.1.0</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-400">
            Engine: SQLite 3 • Local-First
          </div>
        </div>

        {/* Window Body: Two-Pane Setup Dialog */}
        <div className="grid grid-cols-12 min-h-[460px]">
          {/* Left Navigation Rail / Mode Selector */}
          <div className="col-span-4 bg-zinc-50/80 border-r border-zinc-200 p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 px-2">
                Workspace Target
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("offline");
                    setErrorMsg("");
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center space-x-2.5 transition ${
                    activeTab === "offline"
                      ? "bg-white text-zinc-900 border border-zinc-200/90 shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate">Local Storage</div>
                    <div className="text-[10px] text-zinc-400 font-normal">
                      Private SQLite DB
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("cloud");
                    setErrorMsg("");
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center space-x-2.5 transition ${
                    activeTab === "cloud"
                      ? "bg-white text-zinc-900 border border-zinc-200/90 shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  <Cloud className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate">Cloud Workspace</div>
                    <div className="text-[10px] text-zinc-400 font-normal">
                      Multi-Device Sync
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* System Status in Left Rail */}
            <div className="p-3 bg-white border border-zinc-200 rounded-lg space-y-1.5 text-[11px] text-zinc-500">
              <div className="flex items-center space-x-1.5 font-medium text-zinc-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Latency</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-snug">
                Data is stored in local storage for instant execution and compliance export.
              </p>
            </div>
          </div>

          {/* Right Configuration Pane */}
          <div className="col-span-8 p-6 flex flex-col justify-between">
            {errorMsg && (
              <div className="mb-4 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === "offline" ? (
              /* ================= OFFLINE WORKSPACE CONFIG ================= */
              <form onSubmit={handleStartOffline} className="space-y-4 my-auto">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Configure Local Workspace
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Enter your store details to initialize your local database.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Store Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-zinc-400" />
                      Store / Enterprise Name
                    </label>
                    <input
                      type="text"
                      required
                      value={offlineStoreName}
                      onChange={(e) => setOfflineStoreName(e.target.value)}
                      placeholder="e.g. Apex Traders"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 transition"
                    />
                  </div>

                  {/* GST State */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      Home State (GSTIN Jurisdiction)
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 transition"
                    >
                      <option value="Delhi">Delhi (07)</option>
                      <option value="Maharashtra">Maharashtra (27)</option>
                      <option value="Karnataka">Karnataka (29)</option>
                      <option value="Gujarat">Gujarat (24)</option>
                      <option value="Tamil Nadu">Tamil Nadu (33)</option>
                      <option value="Uttar Pradesh">Uttar Pradesh (09)</option>
                      <option value="West Bengal">West Bengal (19)</option>
                      <option value="Rajasthan">Rajasthan (08)</option>
                      <option value="Telangana">Telangana (36)</option>
                      <option value="Haryana">Haryana (06)</option>
                    </select>
                  </div>

                  {/* Active Channels */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      Sales Channels
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Amazon", "Flipkart", "Meesho"].map((ch) => {
                        const isSelected = selectedChannels.includes(ch);
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => toggleChannel(ch)}
                            className={`py-1.5 px-2.5 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                              isSelected
                                ? "bg-zinc-900 border-zinc-900 text-white"
                                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                            <span>{ch}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-md font-medium text-xs bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              /* ================= CLOUD ACCOUNT LOGIN / SIGNUP ================= */
              <form onSubmit={handleCloudSubmit} className="space-y-3.5 my-auto">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {cloudSubTab === "signin" ? "Sign In to Cloud" : "Create Cloud Account"}
                  </h3>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setCloudSubTab("signin")}
                      className={`font-medium ${
                        cloudSubTab === "signin"
                          ? "text-zinc-900 underline underline-offset-4"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    >
                      Sign In
                    </button>
                    <span className="text-zinc-300">•</span>
                    <button
                      type="button"
                      onClick={() => setCloudSubTab("signup")}
                      className={`font-medium ${
                        cloudSubTab === "signup"
                          ? "text-zinc-900 underline underline-offset-4"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {cloudSubTab === "signup" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-700">
                        Firm / Business Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Agarwal Retail Solutions"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-700">
                        GSTIN (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="07AAAAA0000A1Z5"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 uppercase focus:bg-white focus:outline-none focus:border-zinc-900 transition"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@business.in"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-md font-medium text-xs bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
                  >
                    <span>{cloudSubTab === "signin" ? "Connect" : "Create Account"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Quick Helper Footer inside Dialog */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                Local storage encrypted
              </span>
              <span>Press Enter ↵ to launch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
