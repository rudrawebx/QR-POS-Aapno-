'use client';

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  Package,
  Truck,
  TrendingDown,
  TrendingUp,
  Check,
  Edit2,
  Trash2,
  Layers,
  History,
  Sparkles,
  Search,
  X,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Calendar,
  DollarSign,
  Utensils,
  FileSpreadsheet,
  List as ListIcon,
  Columns as ColumnsIcon,
  LayoutGrid,
  Grid as GridIcon,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  Tag,
} from "lucide-react";

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<"STOCK" | "BOM" | "TRANSACTIONS" | "SUPPLIERS">("STOCK");
  const [viewMode, setViewMode] = useState<"LIST" | "COLUMN" | "ICON" | "GALLERY">("GALLERY");
  const [filterHealth, setFilterHealth] = useState<"ALL" | "LOW_STOCK" | "IN_STOCK" | "OUT_OF_STOCK">("ALL");
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [stockTransactions, setStockTransactions] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("TODAY");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickAdjustLoadingId, setQuickAdjustLoadingId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any | null>(null);

  // Stock Adjustment Form
  const [adjustActionType, setAdjustActionType] = useState<"PURCHASE" | "USAGE" | "WASTAGE" | "DAMAGE" | "RETURN">("PURCHASE");
  const [adjustQty, setAdjustQty] = useState("10");
  const [adjustReason, setAdjustReason] = useState("Direct Market Purchase");
  const [adjustCost, setAdjustCost] = useState("");
  const [adjustSupplierId, setAdjustSupplierId] = useState("");

  // Add/Edit Ingredient Form State
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formUnit, setFormUnit] = useState("KG");
  const [formStock, setFormStock] = useState("10");
  const [formMinAlert, setFormMinAlert] = useState("5");
  const [formCost, setFormCost] = useState("150");
  const [formSupplierId, setFormSupplierId] = useState("");

  // Supplier Form State
  const [supName, setSupName] = useState("");
  const [supContact, setSupContact] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supGstin, setSupGstin] = useState("");
  const [supAddress, setSupAddress] = useState("");

  const getDepartment = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("paneer") || n.includes("ghee") || n.includes("butter") || n.includes("cream") || n.includes("dahi") || n.includes("milk") || n.includes("cheese")) return "Dairy & Fats";
    if (n.includes("chicken") || n.includes("egg") || n.includes("mutton") || n.includes("fish")) return "Poultry & Meat";
    if (n.includes("onion") || n.includes("tomato") || n.includes("potato") || n.includes("mushroom") || n.includes("corn") || n.includes("salad") || n.includes("cucumber") || n.includes("lemon")) return "Fresh Produce";
    if (n.includes("masala") || n.includes("spices") || n.includes("chilli") || n.includes("salt") || n.includes("turmeric") || n.includes("cumin")) return "Spices & Seasoning";
    if (n.includes("rice") || n.includes("atta") || n.includes("maida") || n.includes("dal") || n.includes("flour") || n.includes("oil")) return "Staples & Grains";
    if (n.includes("coke") || n.includes("sprite") || n.includes("limca") || n.includes("water") || n.includes("soda") || n.includes("drink") || n.includes("ice") || n.includes("box") || n.includes("pack")) return "Beverages & Packaging";
    return "General Grocery";
  };

  const DEPARTMENTS = [
    "ALL",
    "Dairy & Fats",
    "Poultry & Meat",
    "Fresh Produce",
    "Spices & Seasoning",
    "Staples & Grains",
    "Beverages & Packaging",
    "General Grocery",
  ];

  const fetchInventory = async (selectedRange = range, start?: string, end?: string) => {
    try {
      setLoading(true);
      let url = `/api/inventory?range=${selectedRange}`;
      if (selectedRange === "CUSTOM" && start) {
        url += `&startDate=${start}`;
        if (end) url += `&endDate=${end}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.ingredients) setIngredients(data.ingredients);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
      if (data.stockTransactions) setStockTransactions(data.stockTransactions);
      if (data.recipes) setRecipes(data.recipes);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(range, customStartDate, customEndDate);
  }, [range]);

  const handleOpenAddModal = () => {
    setEditingIngId(null);
    setFormName("");
    setFormUnit("KG");
    setFormStock("10");
    setFormMinAlert("5");
    setFormCost("150");
    setFormSupplierId("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingIngId(item.id);
    setFormName(item.name);
    setFormUnit(item.unit || "KG");
    setFormStock(String(item.currentStock || 0));
    setFormMinAlert(String(item.minStockAlert || 5));
    setFormCost(String(item.unitCost || 0));
    setFormSupplierId(item.supplierId || "");
    setIsAddModalOpen(true);
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIngId) {
        // UPDATE (PATCH)
        const res = await fetch("/api/inventory", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingIngId,
            name: formName,
            unit: formUnit,
            currentStock: parseFloat(formStock),
            minStockAlert: parseFloat(formMinAlert),
            unitCost: parseFloat(formCost),
            supplierId: formSupplierId || null,
          }),
        });
        if (res.ok) {
          setIsAddModalOpen(false);
          fetchInventory();
        } else {
          alert("Could not update ingredient. Please check database connection.");
        }
      } else {
        // CREATE (POST)
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "INGREDIENT",
            name: formName,
            unit: formUnit,
            currentStock: parseFloat(formStock),
            minStockAlert: parseFloat(formMinAlert),
            unitCost: parseFloat(formCost),
            supplierId: formSupplierId || null,
          }),
        });
        if (res.ok) {
          setIsAddModalOpen(false);
          fetchInventory();
        } else {
          alert("Could not add ingredient. Please check database connection.");
        }
      }
    } catch (err) {
      console.error("Error saving ingredient:", err);
      alert("Network error while saving raw ingredient.");
    }
  };

  // Instant Quick Adjuster (+5 / -5 / +10)
  const handleQuickAdjust = async (item: any, delta: number) => {
    const newStock = Math.max(0, +(item.currentStock || 0) + delta);
    setQuickAdjustLoadingId(item.id);

    // Optimistic UI update
    setIngredients((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, currentStock: newStock } : i))
    );

    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "STOCK_ADJUSTMENT",
          ingredientId: item.id,
          actionType: delta > 0 ? "PURCHASE" : "USAGE",
          quantity: Math.abs(delta),
          reason: `Quick ${delta > 0 ? "+" : ""}${delta} adjustment from Dashboard`,
        }),
      });
      fetchInventory();
    } catch (err) {
      console.error("Quick adjust error:", err);
    } finally {
      setQuickAdjustLoadingId(null);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;

    const qty = parseFloat(adjustQty || "0");
    const delta = (adjustActionType === "WASTAGE" || adjustActionType === "USAGE" || adjustActionType === "DAMAGE" || adjustActionType === "RETURN")
      ? -Math.abs(qty)
      : Math.abs(qty);

    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === selectedIngredient.id
          ? { ...ing, currentStock: Math.max(0, (ing.currentStock || 0) + delta) }
          : ing
      )
    );

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "STOCK_ADJUSTMENT",
          ingredientId: selectedIngredient.id,
          actionType: adjustActionType,
          quantity: qty,
          reason: adjustReason,
          unitCost: adjustCost ? parseFloat(adjustCost) : undefined,
          supplierId: adjustSupplierId || undefined,
        }),
      });

      if (res.ok) {
        setIsAdjustModalOpen(false);
        setAdjustQty("10");
        setSelectedIngredient(null);
        fetchInventory();
      }
    } catch (err) {
      console.error("Error adjusting stock:", err);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SUPPLIER",
          name: supName,
          contactPerson: supContact,
          phone: supPhone,
          gstin: supGstin,
          address: supAddress,
        }),
      });
      if (res.ok) {
        setIsSupplierModalOpen(false);
        setSupName("");
        setSupPhone("");
        fetchInventory();
      }
    } catch (err) {
      console.error("Error creating supplier:", err);
    }
  };

  const handleDeleteIngredient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from raw inventory?`)) return;
    try {
      await fetch(`/api/inventory?id=${id}&entity=INGREDIENT`, { method: "DELETE" });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    if (stockTransactions.length === 0) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Timestamp,Item Name,Action Type,Quantity,Unit,Notes\n" +
      stockTransactions
        .map(
          (t) =>
            `"${new Date(t.createdAt).toLocaleString("en-IN")}","${t.ingredient?.name || "Ingredient"}","${t.type}",${t.quantity},"${t.unit || "KG"}","${t.notes || ""}"`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Aapno_Khano_Stock_Audit_${range}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const lowStockItems = ingredients.filter((i) => i.currentStock <= (i.minStockAlert || 5));
  const outOfStockItems = ingredients.filter((i) => (i.currentStock || 0) <= 0);
  const inStockItems = ingredients.filter((i) => (i.currentStock || 0) > (i.minStockAlert || 5));
  const totalStockValue = ingredients.reduce((sum, i) => sum + (i.currentStock || 0) * (i.unitCost || 0), 0);

  // Filtered ingredients
  const filteredIngredients = ingredients.filter((item) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchUnit = (item.unit || "").toLowerCase().includes(q);
      const matchSupplier = (item.supplier?.name || "").toLowerCase().includes(q);
      if (!matchName && !matchUnit && !matchSupplier) return false;
    }

    // Health filter
    if (filterHealth === "LOW_STOCK") {
      if (item.currentStock > (item.minStockAlert || 5) || item.currentStock <= 0) return false;
    } else if (filterHealth === "OUT_OF_STOCK") {
      if (item.currentStock > 0) return false;
    } else if (filterHealth === "IN_STOCK") {
      if (item.currentStock <= (item.minStockAlert || 5)) return false;
    }

    // Department filter
    if (filterDept !== "ALL") {
      if (getDepartment(item.name) !== filterDept) return false;
    }

    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl mx-auto pb-12">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#AA1B2A]/10 border border-[#AA1B2A]/20 flex items-center justify-center text-[#AA1B2A]">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm sm:text-base text-[#331E17]">Raw Inventory &amp; Recipe BOM Engine</h1>
              <p className="text-xs text-[#745E55]">
                Real-time stock ledger • 4 interactive views • Automatic recipe deduction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
            >
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Add Supplier</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer border border-[#E09D3D]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Add Raw Material</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Total Raw Materials Tracked</p>
            <h3 className="text-xl font-black text-[#331E17] mt-0.5">{ingredients.length} Items</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Active raw ingredients catalog</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Estimated Total Inventory Value</p>
            <h3 className="text-xl font-black text-[#AA1B2A] mt-0.5">
              ₹{totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Calculated from unit purchase cost</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Low Stock Threshold Alerts</p>
            <h3 className={`text-xl font-black mt-0.5 ${lowStockItems.length > 0 ? "text-amber-600" : "text-emerald-700"}`}>
              {lowStockItems.length} Items Below Min
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Require market replenishment</p>
          </div>
        </div>

        {/* Low Stock Warning Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-3xl flex items-center gap-3 text-xs text-amber-900 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-black text-xs text-amber-950">Low Stock Alert ({lowStockItems.length} items below minimum alert threshold):</p>
              <p className="text-amber-800 mt-0.5 text-[11px]">
                {lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit})`).join(" • ")}
              </p>
            </div>
            <button
              onClick={() => setFilterHealth("LOW_STOCK")}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-xl text-[11px] cursor-pointer"
            >
              Filter Low Stock
            </button>
          </div>
        )}

        {/* Primary Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E1D6] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("STOCK")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "STOCK"
                  ? "bg-[#AA1B2A] text-white shadow-xs"
                  : "bg-white text-[#745E55] hover:bg-[#F7F2EA]"
              }`}
            >
              📦 Raw Materials Stock ({ingredients.length})
            </button>
            <button
              onClick={() => setActiveTab("BOM")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "BOM"
                  ? "bg-[#AA1B2A] text-white shadow-xs"
                  : "bg-white text-[#745E55] hover:bg-[#F7F2EA]"
              }`}
            >
              🍲 Recipe BOMs ({recipes.length})
            </button>
            <button
              onClick={() => setActiveTab("TRANSACTIONS")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "TRANSACTIONS"
                  ? "bg-[#AA1B2A] text-white shadow-xs"
                  : "bg-white text-[#745E55] hover:bg-[#F7F2EA]"
              }`}
            >
              📜 Stock Audit Log ({stockTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab("SUPPLIERS")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "SUPPLIERS"
                  ? "bg-[#AA1B2A] text-white shadow-xs"
                  : "bg-white text-[#745E55] hover:bg-[#F7F2EA]"
              }`}
            >
              🚚 Suppliers ({suppliers.length})
            </button>
          </div>

          {activeTab === "STOCK" && (
            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative w-56 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search raw material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#AA1B2A]"
                />
              </div>

              {/* View Switcher: List, Column, Icon, Gallery */}
              <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("LIST")}
                  className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    viewMode === "LIST" ? "bg-[#AA1B2A] text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="List Table View"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">List</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("COLUMN")}
                  className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    viewMode === "COLUMN" ? "bg-[#AA1B2A] text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Categorized Column View"
                >
                  <ColumnsIcon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Column</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("ICON")}
                  className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    viewMode === "ICON" ? "bg-[#AA1B2A] text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Compact Icon Grid"
                >
                  <GridIcon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Icon</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("GALLERY")}
                  className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    viewMode === "GALLERY" ? "bg-[#AA1B2A] text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Gallery Cards View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Gallery</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Secondary Filter Controls (Category & Stock Health Filters) */}
        {activeTab === "STOCK" && (
          <div className="space-y-2.5">
            {/* Department / Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-[#745E55] flex items-center gap-1 mr-1 flex-shrink-0">
                <Tag className="w-3 h-3 text-[#AA1B2A]" /> Department:
              </span>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setFilterDept(dept)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                    filterDept === dept
                      ? "bg-[#331E17] text-[#E09D3D] shadow-xs"
                      : "bg-white hover:bg-slate-100 text-[#745E55] border border-slate-200"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Health Filter Chips */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-[#745E55] flex items-center gap-1 mr-1">
                <SlidersHorizontal className="w-3 h-3 text-[#AA1B2A]" /> Health:
              </span>
              <button
                onClick={() => setFilterHealth("ALL")}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                  filterHealth === "ALL" ? "bg-[#AA1B2A] text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                All ({ingredients.length})
              </button>
              <button
                onClick={() => setFilterHealth("LOW_STOCK")}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                  filterHealth === "LOW_STOCK" ? "bg-amber-500 text-white" : "bg-white text-amber-700 border border-amber-300"
                }`}
              >
                ⚠️ Low Stock ({lowStockItems.length})
              </button>
              <button
                onClick={() => setFilterHealth("IN_STOCK")}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                  filterHealth === "IN_STOCK" ? "bg-emerald-600 text-white" : "bg-white text-emerald-700 border border-emerald-300"
                }`}
              >
                ✅ In Stock ({inStockItems.length})
              </button>
              <button
                onClick={() => setFilterHealth("OUT_OF_STOCK")}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                  filterHealth === "OUT_OF_STOCK" ? "bg-red-600 text-white" : "bg-white text-red-700 border border-red-300"
                }`}
              >
                🛑 Out of Stock ({outOfStockItems.length})
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: STOCK BALANCES */}
        {activeTab === "STOCK" && (
          <div>
            {filteredIngredients.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-[#E8E1D6] space-y-2">
                <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-[#331E17]">No raw ingredients match your filter</h3>
                <p className="text-xs text-slate-500">Try changing department or search terms</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDept("ALL");
                    setFilterHealth("ALL");
                  }}
                  className="mt-2 px-3 py-1.5 bg-[#AA1B2A] text-white text-xs font-bold rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* 1. LIST VIEW */}
                {viewMode === "LIST" && (
                  <div className="bg-white rounded-3xl border border-[#E8E1D6] overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-[#F7F2EA] border-b border-[#E8E1D6] text-[#745E55] font-black uppercase text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Raw Material Name</th>
                            <th className="py-3 px-3">Department</th>
                            <th className="py-3 px-3">Stock Level</th>
                            <th className="py-3 px-3 text-right">Current Balance</th>
                            <th className="py-3 px-3 text-right">Min Alert</th>
                            <th className="py-3 px-3 text-right">Unit Cost</th>
                            <th className="py-3 px-3 text-right">Total Valuation</th>
                            <th className="py-3 px-3 text-center">Quick Adjust</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredIngredients.map((item) => {
                            const isLow = item.currentStock <= (item.minStockAlert || 5);
                            const isOut = item.currentStock <= 0;
                            const totalVal = (item.currentStock || 0) * (item.unitCost || 0);
                            return (
                              <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                                <td className="py-3 px-4 font-bold text-[#331E17]">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    <span>{item.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                                    {getDepartment(item.name)}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                      isOut
                                        ? "bg-red-100 text-red-900 border border-red-300"
                                        : isLow
                                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                                        : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                    }`}
                                  >
                                    {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-black text-sm text-[#AA1B2A]">
                                  {item.currentStock?.toFixed(2)} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-slate-600">
                                  {item.minStockAlert} {item.unit}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-slate-700">
                                  ₹{item.unitCost}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-[#331E17]">
                                  ₹{totalVal.toFixed(2)}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleQuickAdjust(item, -1)}
                                      disabled={quickAdjustLoadingId === item.id || item.currentStock <= 0}
                                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center disabled:opacity-40 cursor-pointer"
                                      title="Deduct 1"
                                    >
                                      -1
                                    </button>
                                    <button
                                      onClick={() => handleQuickAdjust(item, 5)}
                                      disabled={quickAdjustLoadingId === item.id}
                                      className="px-1.5 h-6 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xs flex items-center justify-center cursor-pointer"
                                      title="Add +5"
                                    >
                                      +5
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setSelectedIngredient(item);
                                        setAdjustActionType("PURCHASE");
                                        setAdjustQty("10");
                                        setAdjustReason("Direct Market Purchase");
                                        setAdjustCost(String(item.unitCost || ""));
                                        setIsAdjustModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                                    >
                                      Adjust
                                    </button>
                                    <button
                                      onClick={() => handleOpenEditModal(item)}
                                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteIngredient(item.id, item.name)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. COLUMN VIEW (Categorized Boards) */}
                {viewMode === "COLUMN" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                    {DEPARTMENTS.filter(d => d !== "ALL").map((dept) => {
                      const deptItems = filteredIngredients.filter(i => getDepartment(i.name) === dept);
                      if (deptItems.length === 0 && filterDept !== "ALL") return null;

                      return (
                        <div key={dept} className="bg-white rounded-3xl border border-[#E8E1D6] p-4 space-y-3 shadow-xs flex flex-col">
                          <div className="flex items-center justify-between border-b border-[#E8E1D6] pb-2">
                            <h3 className="font-black text-xs text-[#331E17] uppercase tracking-wide">{dept}</h3>
                            <span className="text-[10px] font-bold text-[#AA1B2A] bg-[#FFF0E8] px-2 py-0.5 rounded-full border border-[#E09D3D]/30">
                              {deptItems.length} {deptItems.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>

                          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                            {deptItems.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic py-4 text-center">No items in this department</p>
                            ) : (
                              deptItems.map((item) => {
                                const isLow = item.currentStock <= (item.minStockAlert || 5);
                                const isOut = item.currentStock <= 0;
                                return (
                                  <div
                                    key={item.id}
                                    className={`p-3 rounded-2xl border transition-all ${
                                      isOut
                                        ? 'border-red-300 bg-red-50/30'
                                        : isLow
                                        ? 'border-amber-300 bg-amber-50/30'
                                        : 'border-slate-200 bg-[#FEFBF5] hover:border-[#E09D3D]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-black text-xs text-[#331E17] line-clamp-1">{item.name}</h4>
                                      <button
                                        onClick={() => handleOpenEditModal(item)}
                                        className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                    </div>

                                    <div className="flex items-baseline justify-between mt-2">
                                      <div>
                                        <span className="text-base font-black text-[#AA1B2A]">
                                          {item.currentStock.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 ml-1">{item.unit}</span>
                                      </div>
                                      <span className="text-[10px] text-[#745E55] font-mono">₹{item.unitCost}/{item.unit}</span>
                                    </div>

                                    {/* Quick adjust buttons */}
                                    <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-100">
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleQuickAdjust(item, -1)}
                                          disabled={item.currentStock <= 0}
                                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                                        >
                                          -1
                                        </button>
                                        <button
                                          onClick={() => handleQuickAdjust(item, -5)}
                                          disabled={item.currentStock < 5}
                                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                                        >
                                          -5
                                        </button>
                                        <button
                                          onClick={() => handleQuickAdjust(item, 5)}
                                          className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] cursor-pointer"
                                        >
                                          +5
                                        </button>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setSelectedIngredient(item);
                                          setAdjustActionType("PURCHASE");
                                          setAdjustQty("10");
                                          setAdjustCost(String(item.unitCost || ""));
                                          setIsAdjustModalOpen(true);
                                        }}
                                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                                      >
                                        Full Adjust
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. ICON VIEW (Compact Tiles) */}
                {viewMode === "ICON" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filteredIngredients.map((item) => {
                      const isLow = item.currentStock <= (item.minStockAlert || 5);
                      const isOut = item.currentStock <= 0;
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl bg-white border-2 flex flex-col justify-between space-y-2 hover:shadow-md transition-all ${
                            isOut
                              ? "border-red-300 bg-red-50/20"
                              : isLow
                              ? "border-amber-300 bg-amber-50/20"
                              : "border-[#E8E1D6] hover:border-[#E09D3D]"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-8 h-8 rounded-xl bg-[#FFF0E8] border border-[#E09D3D]/30 flex items-center justify-center text-sm font-black text-[#AA1B2A]">
                              {item.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isOut ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                            />
                          </div>

                          <div>
                            <h4 className="font-bold text-xs text-[#331E17] leading-tight line-clamp-2">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">₹{item.unitCost}/{item.unit}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <p className="font-black text-xs text-[#AA1B2A]">
                              {item.currentStock.toFixed(1)} <span className="text-[9px] font-normal text-slate-500">{item.unit}</span>
                            </p>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer"
                              title="Edit item"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 4. GALLERY VIEW (Rich Cards with Progress Bar) */}
                {viewMode === "GALLERY" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIngredients.map((item) => {
                      const isLow = item.currentStock <= (item.minStockAlert || 5);
                      const isOut = item.currentStock <= 0;
                      const ratio = Math.min(100, Math.round(((item.currentStock || 0) / (item.minStockAlert * 3 || 15)) * 100));

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-3xl bg-white border-2 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md ${
                            isOut
                              ? "border-red-400 bg-red-50/20"
                              : isLow
                              ? "border-amber-400 bg-amber-50/20"
                              : "border-[#E8E1D6] hover:border-[#E09D3D]"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-black uppercase text-[#AA1B2A] bg-[#FFF0E8] px-2 py-0.5 rounded-md border border-[#E09D3D]/30">
                                {getDepartment(item.name)}
                              </span>
                              <h3 className="text-sm font-black text-[#331E17] mt-1">{item.name}</h3>
                              <p className="text-[11px] text-[#745E55]">
                                Cost: ₹{item.unitCost} / {item.unit} {item.supplier ? `• ${item.supplier.name}` : ''}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                isOut
                                  ? "bg-red-100 text-red-900 border border-red-300"
                                  : isLow
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              }`}
                            >
                              {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                            </span>
                          </div>

                          {/* Stock Level Counter & Progress Bar */}
                          <div className="bg-[#F7F2EA] p-3 rounded-2xl border border-[#E8E1D6] space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-[#745E55]">Current Balance</p>
                                <p className="text-xl font-black text-[#AA1B2A]">
                                  {item.currentStock.toFixed(2)} <span className="text-xs font-bold text-slate-500">{item.unit}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-[#745E55]">Min Threshold</p>
                                <p className="text-xs font-bold text-[#331E17]">{item.minStockAlert} {item.unit}</p>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isOut ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick Adjust Buttons */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleQuickAdjust(item, -1)}
                                disabled={item.currentStock <= 0 || quickAdjustLoadingId === item.id}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
                                title="Subtract 1"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(item, -5)}
                                disabled={item.currentStock < 5 || quickAdjustLoadingId === item.id}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
                                title="Subtract 5"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(item, 5)}
                                disabled={quickAdjustLoadingId === item.id}
                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold cursor-pointer"
                                title="Add +5"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(item, 10)}
                                disabled={quickAdjustLoadingId === item.id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                                title="Add +10"
                              >
                                +10
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedIngredient(item);
                                  setAdjustActionType("PURCHASE");
                                  setAdjustQty("10");
                                  setAdjustReason("Direct Market Purchase");
                                  setAdjustCost(String(item.unitCost || ""));
                                  setIsAdjustModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                                title="Open Full Adjustment Dialog"
                              >
                                Full Adjust
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Ingredient"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteIngredient(item.id, item.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Delete ingredient"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: RECIPE BOMS */}
        {activeTab === "BOM" && (
          <div className="bg-white rounded-3xl border border-[#E8E1D6] p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8E1D6] pb-3">
              <div>
                <h3 className="font-black text-sm text-[#331E17]">Dish Recipe Bill of Materials (BOM)</h3>
                <p className="text-xs text-[#745E55]">
                  When orders are placed, ingredient stock is automatically deducted based on these mapped quantities.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FEFBF5] rounded-2xl border border-[#E8E1D6] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-[#331E17]">Dal Makhani Handi (Single Portion)</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Auto-Deducts</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                  • 0.15 KG Urad Dal (Black Lentils)<br />
                  • 0.05 LITER Vedic Desi Bilona Ghee<br />
                  • 0.05 LITER Fresh Dairy Cream<br />
                  • 0.02 KG Shahi Garam Masala Blend
                </p>
              </div>

              <div className="p-4 bg-[#FEFBF5] rounded-2xl border border-[#E8E1D6] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-[#331E17]">Kadai Paneer (Single Portion)</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Auto-Deducts</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                  • 0.20 KG Fresh Malai Paneer<br />
                  • 0.04 KG Amul Table Butter<br />
                  • 0.06 KG Capsicum &amp; Onion Dices<br />
                  • 0.02 KG Shahi Garam Masala Blend
                </p>
              </div>

              <div className="p-4 bg-[#FEFBF5] rounded-2xl border border-[#E8E1D6] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-[#331E17]">Butter Chicken (Single Portion)</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Auto-Deducts</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                  • 0.25 KG Fresh Farm Chicken<br />
                  • 0.05 KG Amul Table Butter<br />
                  • 0.05 LITER Fresh Dairy Cream<br />
                  • 0.03 KG Shahi Garam Masala Blend
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK AUDIT TRANSACTIONS */}
        {activeTab === "TRANSACTIONS" && (
          <div className="bg-white rounded-3xl border border-[#E8E1D6] p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E1D6] pb-3">
              <div>
                <h3 className="font-black text-sm text-[#331E17]">Immutable Stock Transaction Ledger</h3>
                <p className="text-xs text-[#745E55]">
                  Full audit trail of all purchases, consumption, wastage, and manual corrections
                </p>
              </div>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-1.5 bg-[#AA1B2A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#F7F2EA] border-b border-[#E8E1D6] text-[#745E55] font-black uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Ingredient</th>
                    <th className="py-2.5 px-3">Movement Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No stock transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    stockTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-amber-50/40">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                          {new Date(txn.createdAt).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#331E17]">
                          {txn.ingredient?.name || "Ingredient"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              txn.quantity >= 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {txn.type}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-black ${txn.quantity >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                          {txn.quantity >= 0 ? "+" : ""}{txn.quantity} {txn.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{txn.notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SUPPLIERS */}
        {activeTab === "SUPPLIERS" && (
          <div className="bg-white rounded-3xl border border-[#E8E1D6] p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8E1D6] pb-3">
              <div>
                <h3 className="font-black text-sm text-[#331E17]">Registered Raw Material Suppliers</h3>
                <p className="text-xs text-[#745E55]">Vendors for dairy, farm produce, poultry, spices, and packaging</p>
              </div>

              <button
                onClick={() => setIsSupplierModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Vendor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suppliers.map((sup) => (
                <div key={sup.id} className="p-4 bg-[#FEFBF5] rounded-2xl border border-[#E8E1D6] space-y-1">
                  <h4 className="font-black text-xs text-[#331E17]">{sup.name}</h4>
                  <p className="text-[11px] text-slate-600">Contact: {sup.contactPerson || "Manager"}</p>
                  <p className="text-[11px] text-slate-600 font-mono">📞 {sup.phone}</p>
                  {sup.gstin && <p className="text-[10px] text-slate-400 font-mono">GSTIN: {sup.gstin}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD / EDIT INGREDIENT MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-black text-sm text-[#331E17]">
                  {editingIngId ? "Edit Raw Material in Database" : "Add New Raw Material"}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveIngredient} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#331E17] mb-1">Raw Material Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Fresh Malai Paneer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#AA1B2A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#331E17] mb-1">Unit of Measure *</label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="KG">KG (Kilograms)</option>
                      <option value="GRAM">GRAM</option>
                      <option value="LITER">LITER</option>
                      <option value="PIECE">PIECE</option>
                      <option value="PORTION">PORTION</option>
                      <option value="PACK">PACK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#331E17] mb-1">Current Stock ({formUnit}) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#331E17] mb-1">Min Alert Stock ({formUnit}) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formMinAlert}
                      onChange={(e) => setFormMinAlert(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#331E17] mb-1">Purchase Unit Cost (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#331E17] mb-1">Preferred Supplier (Optional)</label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">-- Direct Local Mandi / Market --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#AA1B2A] hover:bg-[#8e1422] text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
                  >
                    {editingIngId ? "Save Changes to DB" : "Add to Database"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STOCK IN / WASTAGE ADJUSTMENT MODAL */}
        {isAdjustModalOpen && selectedIngredient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-black text-sm text-[#331E17]">Adjust Stock</h3>
                  <p className="text-xs text-[#745E55]">{selectedIngredient.name}</p>
                </div>
                <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#331E17] mb-1">Adjustment Action *</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["PURCHASE", "USAGE", "WASTAGE"] as const).map((act) => (
                      <button
                        key={act}
                        type="button"
                        onClick={() => setAdjustActionType(act)}
                        className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          adjustActionType === act
                            ? act === "PURCHASE"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : act === "USAGE"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-red-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {act === "PURCHASE" ? "➕ Purchase" : act === "USAGE" ? "🍳 Kitchen" : "🗑️ Wastage"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#331E17] mb-1">
                      Quantity ({selectedIngredient.unit}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#331E17] mb-1">Current Stock</label>
                    <div className="px-3 py-2 bg-[#F7F2EA] rounded-xl text-xs font-mono font-black text-[#AA1B2A]">
                      {selectedIngredient.currentStock} {selectedIngredient.unit}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#331E17] mb-1">Reason / Reference Notes</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Mandi invoice #412 or prep wastage"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#AA1B2A] hover:bg-[#8e1422] text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
                  >
                    Confirm Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUPPLIER MODAL */}
        {isSupplierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-black text-sm text-[#331E17]">Add Raw Material Supplier / Vendor</h3>
                <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSupplier} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#331E17] mb-1">Supplier / Firm Name *</label>
                  <input
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="e.g. Haryana Fresh Dairy Farms"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#331E17] mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={supContact}
                      onChange={(e) => setSupContact(e.target.value)}
                      placeholder="Manager Name"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#331E17] mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={supPhone}
                      onChange={(e) => setSupPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#331E17] mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={supGstin}
                    onChange={(e) => setSupGstin(e.target.value)}
                    placeholder="06AAAAA0000A1Z5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#331E17] mb-1">Address / Mandi Location</label>
                  <input
                    type="text"
                    value={supAddress}
                    onChange={(e) => setSupAddress(e.target.value)}
                    placeholder="e.g. Grain Market, Fatehabad"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSupplierModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
                  >
                    Save Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}