'use client';

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Boxes,
  Plus,
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
} from "lucide-react";

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<"STOCK" | "BOM" | "TRANSACTIONS" | "SUPPLIERS">("STOCK");
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
        }
      }
    } catch (err) {
      console.error("Error saving ingredient:", err);
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
  const totalStockValue = ingredients.reduce((sum, i) => sum + (i.currentStock || 0) * (i.unitCost || 0), 0);

  const filteredIngredients = ingredients.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#AA1B2A]/10 border border-[#AA1B2A]/20 flex items-center justify-center text-[#AA1B2A]">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm text-[#331E17]">Raw Inventory &amp; Recipe BOM Engine</h1>
              <p className="text-xs text-[#745E55]">
                Real-time stock ledger • Automatic recipe deduction upon order confirmation
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
              <span>+ Add Raw Ingredient</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Total Ingredients Tracked</p>
            <h3 className="text-xl font-black text-[#331E17] mt-0.5">{ingredients.length} Items</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Active raw material catalog</p>
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
            <p className="text-[10px] text-slate-400 mt-0.5">Require immediate market replenishment</p>
          </div>
        </div>

        {/* Low Stock Banner */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-3xl flex items-center gap-3 text-xs text-amber-900 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-black text-xs text-amber-950">Low Stock Alert ({lowStockItems.length} items below minimum threshold):</p>
              <p className="text-amber-800 mt-0.5">
                {lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit} left)`).join(" • ")}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#E8E1D6] pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("STOCK")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "STOCK"
                  ? "bg-[#AA1B2A] text-white shadow-xs"
                  : "bg-white text-[#745E55] hover:bg-[#F7F2EA]"
              }`}
            >
              📦 Stock Balances ({ingredients.length})
            </button>
            <button
              onClick={() => setActiveTab("BOM")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "BOM"
                  ? "bg-[#AA1B2A] text-white shadow-xs"
                  : "bg-white text-[#745E55] hover:bg-[#F7F2EA]"
              }`}
            >
              🍲 Dish Recipe BOMs ({recipes.length})
            </button>
            <button
              onClick={() => setActiveTab("TRANSACTIONS")}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "TRANSACTIONS"
                  ? "bg-[#AA1B2A] text-white shadow-xs"
                  : "bg-white text-[#745E55] hover:bg-[#F7F2EA]"
              }`}
            >
              📜 Stock Log &amp; Deductions ({stockTransactions.length})
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
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search raw ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
          )}
        </div>

        {/* TAB 1: STOCK BALANCES GRID */}
        {activeTab === "STOCK" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIngredients.map((item) => {
              const isLow = item.currentStock <= (item.minStockAlert || 5);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-3xl bg-white border-2 shadow-xs flex flex-col justify-between space-y-3 ${
                    isLow ? "border-amber-400 bg-amber-50/20" : "border-[#E8E1D6]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-black text-[#331E17]">{item.name}</h3>
                      <p className="text-[11px] text-[#745E55]">Unit Cost: ₹{item.unitCost} / {item.unit}</p>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isLow ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      }`}
                    >
                      {isLow ? "Low Stock" : "In Stock"}
                    </span>
                  </div>

                  <div className="bg-[#F7F2EA] p-3 rounded-2xl border border-[#E8E1D6] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#745E55]">Current Balance</p>
                      <p className="text-lg font-black text-[#AA1B2A]">
                        {item.currentStock.toFixed(2)} <span className="text-xs font-bold text-slate-500">{item.unit}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-[#745E55]">Min Alert</p>
                      <p className="text-xs font-bold text-[#331E17]">{item.minStockAlert} {item.unit}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedIngredient(item);
                          setAdjustActionType("PURCHASE");
                          setAdjustQty("10");
                          setAdjustReason("Direct Market Purchase");
                          setAdjustCost(String(item.unitCost || ""));
                          setIsAdjustModalOpen(true);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        + Stock In
                      </button>

                      <button
                        onClick={() => {
                          setSelectedIngredient(item);
                          setAdjustActionType("WASTAGE");
                          setAdjustQty("2");
                          setAdjustReason("Kitchen Wastage / Spoilage");
                          setIsAdjustModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold cursor-pointer border border-amber-300"
                      >
                        - Wastage
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                        title="Edit Ingredient"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteIngredient(item.id, item.name)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
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

        {/* TAB 2: RECIPE BOMS */}
        {activeTab === "BOM" && (
          <div className="bg-white rounded-3xl border border-[#E8E1D6] p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-[#331E17]">Dish Recipe Bill of Materials (BOM)</h3>
                <p className="text-xs text-[#745E55]">
                  When orders are placed, ingredient stock is automatically deducted based on these mapped quantities.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-[#331E17]">Dal Makhani Handi (Single Portion)</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Auto-Deducts</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  • 0.15 KG Urad Dal (Black Lentils)<br />
                  • 0.05 LITER Vedic Desi Bilona Ghee<br />
                  • 0.05 LITER Fresh Dairy Cream<br />
                  • 0.02 KG Shahi Garam Masala Blend
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-[#331E17]">Kadai Paneer (Single Portion)</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Auto-Deducts</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  • 0.20 KG Fresh Malai Paneer<br />
                  • 0.04 KG Amul Table Butter<br />
                  • 0.06 KG Capsicum &amp; Onion Dices<br />
                  • 0.02 KG Shahi Garam Masala Blend
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK AUDIT TRANSACTIONS */}
        {activeTab === "TRANSACTIONS" && (
          <div className="bg-white rounded-3xl border border-[#E8E1D6] p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-[#331E17]">Immutable Stock Transaction Ledger</h3>
                <p className="text-xs text-[#745E55]">
                  Full audit trail of all purchases, consumption, wastage, and manual corrections
                </p>
              </div>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-1.5 bg-[#AA1B2A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
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
                      <td colSpan={5} className="py-8 text-center text-slate-400">
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-[#331E17]">Registered Raw Material Suppliers</h3>
                <p className="text-xs text-[#745E55]">Vendors for dairy, farm produce, spices, and packaging</p>
              </div>

              <button
                onClick={() => setIsSupplierModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vendor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suppliers.map((sup) => (
                <div key={sup.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
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
                  {editingIngId ? "Edit Raw Ingredient" : "Add New Raw Ingredient"}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveIngredient} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ingredient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desi Bilona Ghee / Paneer"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measure</label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="KG">KG (Kilogram)</option>
                      <option value="GRAM">GRAM (Grams)</option>
                      <option value="LITER">LITER</option>
                      <option value="ML">ML (Milliliters)</option>
                      <option value="PIECE">PIECE / Unit</option>
                      <option value="PACKET">PACKET</option>
                      <option value="BOX">BOX</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Min Stock Alert Level</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formMinAlert}
                      onChange={(e) => setFormMinAlert(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#AA1B2A] hover:bg-[#8e1421] text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    Save Ingredient
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
                <h3 className="font-black text-sm text-[#331E17]">
                  Stock Adjustment: {selectedIngredient.name}
                </h3>
                <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Action</label>
                  <select
                    value={adjustActionType}
                    onChange={(e: any) => setAdjustActionType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="PURCHASE">Stock In (Purchase / Refill)</option>
                    <option value="USAGE">Stock Out (Manual Usage)</option>
                    <option value="WASTAGE">Wastage / Spoilage / Overcooking</option>
                    <option value="DAMAGE">Broken / Damaged</option>
                    <option value="RETURN">Return to Vendor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity ({selectedIngredient.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Invoice Note</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. Mandi Purchase Bill #1042"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#AA1B2A] hover:bg-[#8e1421] text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    Confirm Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD SUPPLIER MODAL */}
        {isSupplierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-black text-sm text-[#331E17]">Add Vendor / Supplier</h3>
                <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSupplier} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatehabad Dairy Farm &amp; Co."
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      value={supContact}
                      onChange={(e) => setSupContact(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={supPhone}
                      onChange={(e) => setSupPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSupplierModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
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
