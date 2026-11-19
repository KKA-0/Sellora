import React, { useState } from "react";
import {
  HardDrive,
  Cloud,
  ShieldCheck,
  ArrowRight,
  Check,
  Lock,
  Mail,
  Building,
  Store,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { WorkspaceSession } from "../types";

interface AuthGatewayProps {
  onStartSession: (session: WorkspaceSession) => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onStartSession }) => {
  const [activeTab, setActiveTab] = useState<"offline" | "cloud">("offline");
  const [cloudSubTab, setCloudSubTab] = useState<"signin" | "signup">("signin");

  // Offline form state
  const [offlineStoreName, setOfflineStoreName] = useState("My Retail Store");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "Amazon",
    "Flipkart",
    "Meesho"
  ]);
  const [selectedState, setSelectedState] = useState("Delhi");

  // Cloud form state
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
      setErrorMsg("Please enter your store or business name.");
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
      setErrorMsg("Please enter both email and password.");
      return;
    }
    if (cloudSubTab === "signup" && !businessName) {
      setErrorMsg("Please enter your business name.");
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
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between p-6 sm:p-10 font-sans">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-zinc-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-semibold text-sm">
            S
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-base tracking-tight text-zinc-900">
                Sellora
              </span>
              <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                Desktop
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Multi-channel analytics & GST for Indian sellers
            </p>
          </div>
        </div>

        {/* Marketplace pills */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <span className="px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200/70 text-zinc-700">
            Amazon
          </span>
          <span className="px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200/70 text-zinc-700">
            Flipkart
          </span>
          <span className="px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200/70 text-zinc-700">
            Meesho
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto w-full my-auto py-10">
        {/* Title & Description */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
            Welcome to Sellora
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-md mx-auto">
            Choose your preferred workspace mode to get started.
          </p>
        </div>

        {/* Mode Toggle Switcher */}
        <div className="flex bg-zinc-100 p-1 rounded-xl max-w-xs mx-auto mb-8 border border-zinc-200/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab("offline");
              setErrorMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "offline"
                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/80"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Offline Mode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("cloud");
              setErrorMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "cloud"
                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/80"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Account</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="max-w-md mx-auto mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {activeTab === "offline" ? (
            /* ================= OFFLINE WORKSPACE ================= */
            <div className="grid md:grid-cols-12 gap-8 items-start">
              {/* Form */}
              <form onSubmit={handleStartOffline} className="md:col-span-7 space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">
                    Local Workspace Setup
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Data stays private on your machine in local SQLite storage.
                  </p>
                </div>

                {/* Store Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-zinc-400" />
                    Store / Firm Name
                  </label>
                  <input
                    type="text"
                    value={offlineStoreName}
                    onChange={(e) => setOfflineStoreName(e.target.value)}
                    placeholder="e.g. Apex Traders"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                {/* State Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-zinc-400" />
                    State (for GST filing context)
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
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

                {/* Channels */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    Connected Channels
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Amazon", "Flipkart", "Meesho"].map((ch) => {
                      const isSelected = selectedChannels.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => toggleChannel(ch)}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                            isSelected
                              ? "bg-zinc-900 border-zinc-900 text-white"
                              : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                          <span>{ch}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-lg font-medium text-sm bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-2 transition"
                >
                  <span>Open Local Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Right Side Info */}
              <div className="md:col-span-5 bg-zinc-50 border border-zinc-100 rounded-xl p-5 space-y-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Local-first advantages</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>No internet required; zero cloud latency.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Your cost sheets and profit margins never leave this computer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Generate GSTR-1 JSON directly from local data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Cloud sync can be enabled anytime later.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            /* ================= CLOUD ACCOUNT ================= */
            <div className="grid md:grid-cols-12 gap-8 items-start">
              {/* Form */}
              <form onSubmit={handleCloudSubmit} className="md:col-span-7 space-y-4">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-zinc-100 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCloudSubTab("signin");
                      setErrorMsg("");
                    }}
                    className={`text-xs font-semibold pb-1 border-b-2 transition ${
                      cloudSubTab === "signin"
                        ? "border-zinc-900 text-zinc-900"
                        : "border-transparent text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCloudSubTab("signup");
                      setErrorMsg("");
                    }}
                    className={`text-xs font-semibold pb-1 border-b-2 transition ${
                      cloudSubTab === "signup"
                        ? "border-zinc-900 text-zinc-900"
                        : "border-transparent text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-zinc-900">
                    {cloudSubTab === "signin" ? "Sign In to Sellora" : "Create Account"}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {cloudSubTab === "signin"
                      ? "Synchronize your data across devices."
                      : "Sync across devices and enable cloud backups."}
                  </p>
                </div>

                {cloudSubTab === "signup" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-zinc-400" />
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Agarwal Retail Solutions"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
                        GSTIN <span className="text-zinc-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="07AAAAA0000A1Z5"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 uppercase focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@business.in"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      Password
                    </label>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-lg font-medium text-sm bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-2 transition"
                >
                  <span>{cloudSubTab === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Right Side Info */}
              <div className="md:col-span-5 bg-zinc-50 border border-zinc-100 rounded-xl p-5 space-y-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                  <Cloud className="w-4 h-4 text-zinc-700" />
                  <span>Cloud synchronization</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-800 shrink-0 mt-0.5" />
                    <span>Encrypted automatic cloud backup.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-800 shrink-0 mt-0.5" />
                    <span>Synchronize catalogs across multiple desktop machines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-800 shrink-0 mt-0.5" />
                    <span>Automated reminders for GST filing deadlines.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 border-t border-zinc-100 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>Sellora • Local-First Desktop App</div>
        <div>Offline SQLite Engine</div>
      </footer>
    </div>
  );
};
