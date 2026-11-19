import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Package,
  IndianRupee,
  Layers
} from "lucide-react";
import Papa from "papaparse";
import { InventoryItem, WorkspaceSession } from "../types";

interface InventoryViewProps {
  session: WorkspaceSession;
}

const DEFAULT_SAMPLE_ITEMS: InventoryItem[] = [
  {
    id: "inv-1",
    sku: "AMZ-COT-SHT-BLU-M",
    title: "Men Pure Cotton Regular Fit Shirt - Sky Blue (M)",
    channel: "Amazon",
    stock: 45,
    listingPrice: 899,
    sellerPrice: 380,
    mrp: 1499,
    hsn: "6205",
    gstRate: 5,
    category: "Apparel"
  },
  {
    id: "inv-2",
    sku: "FK-RUN-SHO-BLK-09",
    title: "Lightweight Breathable Running Shoes - Black (UK 9)",
    channel: "Flipkart",
    stock: 8,
    listingPrice: 1249,
    sellerPrice: 560,
    mrp: 2199,
    hsn: "6404",
    gstRate: 12,
    category: "Footwear"
  },
  {
    id: "inv-3",
    sku: "MSH-SLK-SAREE-RED",
    title: "Traditional Kanjivaram Art Silk Saree with Blouse Piece",
    channel: "Meesho",
    stock: 62,
    listingPrice: 649,
    sellerPrice: 275,
    mrp: 1999,
    hsn: "5007",
    gstRate: 5,
    category: "Ethnic Wear"
  },
  {
    id: "inv-4",
    sku: "AMZ-SS-WAT-BTL-1L",
    title: "Insulated Stainless Steel Water Bottle - 1000ml Matte",
    channel: "Amazon",
    stock: 0,
    listingPrice: 499,
    sellerPrice: 195,
    mrp: 899,
    hsn: "7323",
    gstRate: 18,
    category: "Home & Kitchen"
  },
  {
    id: "inv-5",
    sku: "FK-WL-TWS-EAR-WHT",
    title: "True Wireless Earbuds with ENC 30Hr Playtime - White",
    channel: "Flipkart",
    stock: 14,
    listingPrice: 1099,
    sellerPrice: 480,
    mrp: 2499,
    hsn: "8518",
    gstRate: 18,
    category: "Electronics"
  }
];

export const InventoryView: React.FC<InventoryViewProps> = ({ session }) => {
  const storageKey = `sellora_inventory_${session.businessName || "default"}`;

  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SAMPLE_ITEMS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");
  const [stockStatusFilter, setStockStatusFilter] = useState("All");

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [uploadedRows, setUploadedRows] = useState<Record<string, any>[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    sku: "",
    title: "",
    stock: "",
    listingPrice: "",
    sellerPrice: "",
    channel: "",
    hsn: "",
    gstRate: ""
  });
  const [defaultUploadChannel, setDefaultUploadChannel] = useState("Amazon");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editSellerPrice, setEditSellerPrice] = useState<number>(0);
  const [editListingPrice, setEditListingPrice] = useState<number>(0);

  // Manual Add Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    sku: "",
    title: "",
    channel: "Amazon",
    stock: 0,
    listingPrice: 0,
    sellerPrice: 0,
    category: "General",
    hsn: "",
    gstRate: 18
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save inventory:", e);
    }
  }, [items, storageKey]);

  // Normalize and auto-map headers
  const autoMapHeaders = (headers: string[]) => {
    const mapping = {
      sku: "",
      title: "",
      stock: "",
      listingPrice: "",
      sellerPrice: "",
      channel: "",
      hsn: "",
      gstRate: ""
    };

    headers.forEach((h) => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!mapping.sku && (lower.includes("sku") || lower.includes("msku") || lower.includes("itemcode") || lower.includes("productid"))) {
        mapping.sku = h;
      } else if (!mapping.title && (lower.includes("title") || lower.includes("productname") || lower.includes("itemname") || lower.includes("description"))) {
        mapping.title = h;
      } else if (!mapping.stock && (lower.includes("stock") || lower.includes("qty") || lower.includes("quantity") || lower.includes("available"))) {
        mapping.stock = h;
      } else if (!mapping.listingPrice && (lower.includes("listingprice") || lower.includes("sellingprice") || lower.includes("price") || lower.includes("mrp"))) {
        mapping.listingPrice = h;
      } else if (!mapping.sellerPrice && (lower.includes("sellerprice") || lower.includes("costprice") || lower.includes("cogs") || lower.includes("purchaseprice") || lower.includes("cost") || lower.includes("buyprice"))) {
        mapping.sellerPrice = h;
      } else if (!mapping.channel && (lower.includes("channel") || lower.includes("platform") || lower.includes("marketplace"))) {
        mapping.channel = h;
      } else if (!mapping.hsn && lower.includes("hsn")) {
        mapping.hsn = h;
      } else if (!mapping.gstRate && (lower.includes("gst") || lower.includes("taxrate") || lower.includes("tax"))) {
        mapping.gstRate = h;
      }
    });

    setColumnMapping(mapping);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setUploadError("The file seems empty or could not be parsed.");
          return;
        }

        const headers = results.meta.fields || [];
        if (headers.length === 0) {
          setUploadError("No header row found in the uploaded file.");
          return;
        }

        setUploadedHeaders(headers);
        setUploadedRows(results.data as Record<string, any>[]);
        autoMapHeaders(headers);
        setIsUploadOpen(true);
      },
      error: (err) => {
        setUploadError(`Failed to parse file: ${err.message}`);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!columnMapping.sku) {
      setUploadError("Please map at least the SKU column to proceed.");
      return;
    }

    const newImportedItems: InventoryItem[] = uploadedRows
      .filter((row) => row[columnMapping.sku])
      .map((row, idx) => {
        const sku = String(row[columnMapping.sku]).trim();
        const title = columnMapping.title && row[columnMapping.title]
          ? String(row[columnMapping.title]).trim()
          : `Item ${sku}`;

        const stock = columnMapping.stock && row[columnMapping.stock] !== undefined
          ? Math.max(0, parseInt(String(row[columnMapping.stock]).replace(/[^0-9]/g, ""), 10) || 0)
          : 0;

        const listingPrice = columnMapping.listingPrice && row[columnMapping.listingPrice] !== undefined
          ? Math.max(0, parseFloat(String(row[columnMapping.listingPrice]).replace(/[^0-9.]/g, "")) || 0)
          : 0;

        const sellerPrice = columnMapping.sellerPrice && row[columnMapping.sellerPrice] !== undefined
          ? Math.max(0, parseFloat(String(row[columnMapping.sellerPrice]).replace(/[^0-9.]/g, "")) || 0)
          : Math.round(listingPrice * 0.45); // reasonable default estimate if missing

        const channel = columnMapping.channel && row[columnMapping.channel]
          ? String(row[columnMapping.channel]).trim()
          : defaultUploadChannel;

        const hsn = columnMapping.hsn && row[columnMapping.hsn]
          ? String(row[columnMapping.hsn]).trim()
          : undefined;

        const gstRate = columnMapping.gstRate && row[columnMapping.gstRate] !== undefined
          ? parseFloat(String(row[columnMapping.gstRate]).replace(/[^0-9.]/g, "")) || 18
          : 18;

        return {
          id: `imp-${Date.now()}-${idx}`,
          sku,
          title,
          channel,
          stock,
          listingPrice,
          sellerPrice,
          hsn,
          gstRate,
          updatedAt: new Date().toISOString()
        };
      });

    // Merge or append (if SKU exists, update it)
    setItems((prev) => {
      const map = new Map<string, InventoryItem>();
      prev.forEach((item) => map.set(item.sku.toLowerCase(), item));
      newImportedItems.forEach((item) => map.set(item.sku.toLowerCase(), item));
      return Array.from(map.values());
    });

    setIsUploadOpen(false);
    setUploadedHeaders([]);
    setUploadedRows([]);
  };

  const handleStartEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditStock(item.stock);
    setEditSellerPrice(item.sellerPrice);
    setEditListingPrice(item.listingPrice);
  };

  const handleSaveEdit = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: Math.max(0, Number(editStock) || 0),
              sellerPrice: Math.max(0, Number(editSellerPrice) || 0),
              listingPrice: Math.max(0, Number(editListingPrice) || 0),
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );
    setEditingId(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.sku.trim() || !newItem.title.trim()) return;

    const item: InventoryItem = {
      id: `man-${Date.now()}`,
      sku: newItem.sku.trim(),
      title: newItem.title.trim(),
      channel: newItem.channel,
      stock: Math.max(0, Number(newItem.stock) || 0),
      listingPrice: Math.max(0, Number(newItem.listingPrice) || 0),
      sellerPrice: Math.max(0, Number(newItem.sellerPrice) || 0),
      category: newItem.category,
      hsn: newItem.hsn,
      gstRate: newItem.gstRate,
      updatedAt: new Date().toISOString()
    };

    setItems((prev) => [item, ...prev]);
    setIsAddModalOpen(false);
    setNewItem({
      sku: "",
      title: "",
      channel: "Amazon",
      stock: 0,
      listingPrice: 0,
      sellerPrice: 0,
      category: "General",
      hsn: "",
      gstRate: 18
    });
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "SKU,Title,Channel,Stock,Listing_Price,Seller_Cost_Price,HSN,GST_Rate\n" +
      "AMZ-TSHIRT-BLK-L,Men Cotton Round Neck T-Shirt - Black (L),Amazon,50,499,190,6109,5\n" +
      "FK-LEATHER-BELT-BRN,Genuine Leather Formal Belt - Brown,Flipkart,25,799,280,4203,18\n" +
      "MSH-KURTI-YEL-XL,Women Printed Straight Rayon Kurti - Yellow (XL),Meesho,40,399,145,6204,5\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sellora_inventory_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel =
      channelFilter === "All" || item.channel === channelFilter;

    const matchesStock =
      stockStatusFilter === "All" ||
      (stockStatusFilter === "Low" && item.stock > 0 && item.stock < 10) ||
      (stockStatusFilter === "Out" && item.stock === 0) ||
      (stockStatusFilter === "Healthy" && item.stock >= 10);

    return matchesSearch && matchesChannel && matchesStock;
  });

  // KPI calculations
  const totalSKUs = items.length;
  const totalUnits = items.reduce((acc, curr) => acc + curr.stock, 0);
  const totalCostValuation = items.reduce(
    (acc, curr) => acc + curr.stock * curr.sellerPrice,
    0
  );
  const totalRetailValuation = items.reduce(
    (acc, curr) => acc + curr.stock * curr.listingPrice,
    0
  );
  const lowStockCount = items.filter((i) => i.stock < 10).length;

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.tsv,.txt,.xlsx"
        className="hidden"
      />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Inventory & Catalog Manager
          </h1>
          <p className="text-xs text-zinc-500">
            Process catalog sheets, manage stock, and track seller cost vs listing margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadSampleTemplate}
            title="Download Sample CSV Template"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Sample Template</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single SKU</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 rounded-lg transition shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Inventory File</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Total SKUs</span>
            <Package className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-semibold text-zinc-900 mt-1">{totalSKUs}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">{totalUnits} units total</div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Stock Value (Cost)</span>
            <IndianRupee className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-semibold text-zinc-900 mt-1">
            ₹ {totalCostValuation.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Capital invested</div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Retail Valuation</span>
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-semibold text-zinc-900 mt-1">
            ₹ {totalRetailValuation.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            ₹ {(totalRetailValuation - totalCostValuation).toLocaleString("en-IN")} potential profit
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Low Stock SKUs</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-semibold text-zinc-900 mt-1">
            {lowStockCount}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Under 10 units</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU code or product title..."
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

          {/* Stock Status Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 focus:outline-none focus:border-zinc-900 transition"
          >
            <option value="All">All Stock Levels</option>
            <option value="Healthy">Healthy Stock (10+)</option>
            <option value="Low">Low Stock (&lt; 10)</option>
            <option value="Out">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/60 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Product Title</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Available Stock</th>
                <th className="py-3 px-4 text-right">Seller Cost (COGS)</th>
                <th className="py-3 px-4 text-right">Listing Price</th>
                <th className="py-3 px-4 text-right">Gross Margin</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                    <div>No inventory records found.</div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Upload an inventory file or adjust your search filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isEditing = editingId === item.id;
                  const marginVal = item.listingPrice - item.sellerPrice;
                  const marginPct =
                    item.listingPrice > 0
                      ? Math.round((marginVal / item.listingPrice) * 100)
                      : 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/70 transition-colors group"
                    >
                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                        {item.sku}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate font-medium text-zinc-900" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          {item.hsn && <span>HSN: {item.hsn}</span>}
                          {item.gstRate && <span>GST: {item.gstRate}%</span>}
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                          {item.channel}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editStock}
                            onChange={(e) => setEditStock(parseInt(e.target.value, 10) || 0)}
                            className="w-16 px-1.5 py-1 text-right bg-white border border-zinc-300 rounded text-xs focus:outline-none focus:border-zinc-900"
                          />
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className={`font-semibold ${
                                item.stock === 0
                                  ? "text-rose-600"
                                  : item.stock < 10
                                  ? "text-amber-600"
                                  : "text-zinc-900"
                              }`}
                            >
                              {item.stock}
                            </span>
                            {item.stock === 0 && (
                              <span className="text-[10px] text-rose-500 font-medium">Out</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Seller Cost */}
                      <td className="py-3 px-4 text-right font-medium">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <span>₹</span>
                            <input
                              type="number"
                              min="0"
                              value={editSellerPrice}
                              onChange={(e) =>
                                setEditSellerPrice(parseFloat(e.target.value) || 0)
                              }
                              className="w-20 px-1.5 py-1 text-right bg-white border border-zinc-300 rounded text-xs focus:outline-none focus:border-zinc-900"
                            />
                          </div>
                        ) : (
                          <span className="text-zinc-700">₹ {item.sellerPrice}</span>
                        )}
                      </td>

                      {/* Listing Price */}
                      <td className="py-3 px-4 text-right font-medium">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <span>₹</span>
                            <input
                              type="number"
                              min="0"
                              value={editListingPrice}
                              onChange={(e) =>
                                setEditListingPrice(parseFloat(e.target.value) || 0)
                              }
                              className="w-20 px-1.5 py-1 text-right bg-white border border-zinc-300 rounded text-xs focus:outline-none focus:border-zinc-900"
                            />
                          </div>
                        ) : (
                          <span className="text-zinc-900">₹ {item.listingPrice}</span>
                        )}
                      </td>

                      {/* Gross Margin */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-zinc-900">
                          ₹ {marginVal}
                        </div>
                        <div
                          className={`text-[10px] font-medium ${
                            marginPct >= 30
                              ? "text-emerald-600"
                              : marginPct > 10
                              ? "text-zinc-500"
                              : "text-rose-600"
                          }`}
                        >
                          {marginPct}% markup
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              title="Save"
                              className="p-1 rounded hover:bg-emerald-50 text-emerald-600 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              title="Cancel"
                              className="p-1 rounded hover:bg-zinc-100 text-zinc-400 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleStartEdit(item)}
                              title="Edit Stock or Price"
                              className="p-1 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              title="Delete"
                              className="p-1 rounded hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: File Column Mapping & Preview ================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-semibold text-base text-zinc-900">
                  Process & Map Inventory File
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Parsed {uploadedRows.length} rows. Confirm how your file columns match.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {uploadError}
              </div>
            )}

            {/* Default Channel fallback */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">
                Default Channel (if column not present)
              </label>
              <select
                value={defaultUploadChannel}
                onChange={(e) => setDefaultUploadChannel(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              >
                <option value="Amazon">Amazon.in</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Meesho">Meesho</option>
              </select>
            </div>

            {/* Column Mapping Selectors */}
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  SKU Column <span className="text-rose-500">*</span>
                </label>
                <select
                  value={columnMapping.sku}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, sku: e.target.value })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">-- Select Column --</option>
                  {uploadedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Product Title Column
                </label>
                <select
                  value={columnMapping.title}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, title: e.target.value })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">-- Select Column --</option>
                  {uploadedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Stock / Quantity Column
                </label>
                <select
                  value={columnMapping.stock}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, stock: e.target.value })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">-- Select Column --</option>
                  {uploadedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Listing Price Column
                </label>
                <select
                  value={columnMapping.listingPrice}
                  onChange={(e) =>
                    setColumnMapping({
                      ...columnMapping,
                      listingPrice: e.target.value
                    })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">-- Select Column --</option>
                  {uploadedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Seller Cost (COGS) Column
                </label>
                <select
                  value={columnMapping.sellerPrice}
                  onChange={(e) =>
                    setColumnMapping({
                      ...columnMapping,
                      sellerPrice: e.target.value
                    })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">-- (Optional / Default 45%) --</option>
                  {uploadedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Channel Column
                </label>
                <select
                  value={columnMapping.channel}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, channel: e.target.value })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                >
                  <option value="">-- (Optional / Use Default) --</option>
                  {uploadedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmImport}
                className="px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
              >
                Import {uploadedRows.length} SKUs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Manual Add SKU ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="font-semibold text-sm text-zinc-900">
                Add New Inventory SKU
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualItem} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">SKU Code *</label>
                <input
                  type="text"
                  required
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                  placeholder="e.g. AMZ-BAG-BLK-01"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. Leather Laptop Backpack Waterproof"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Channel</label>
                  <select
                    value={newItem.channel}
                    onChange={(e) => setNewItem({ ...newItem, channel: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Meesho">Meesho</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.stock}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        stock: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Seller Cost (COGS) ₹
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.sellerPrice}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        sellerPrice: parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="350"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Listing Price ₹
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.listingPrice}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        listingPrice: parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="899"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition"
                >
                  Add SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
