'use client';

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  BarChart3,
  Calendar,
  Download,
  DollarSign,
  TrendingUp,
  Percent,
  ShoppingCart,
  Users,
  Printer,
  Sunrise,
  Moon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  Receipt,
  Wallet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState("TODAY");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Day Session State
  const [daySessionData, setDaySessionData] = useState<any>(null);
  const [isStartDayModalOpen, setIsStartDayModalOpen] = useState(false);
  const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState("2000");
  const [actualCashInput, setActualCashInput] = useState("");
  const [closingNotesInput, setClosingNotesInput] = useState("");
  const [itemSearchQuery, setItemSearchQuery] = useState("");

  const fetchDaySession = async () => {
    try {
      const res = await fetch("/api/day-session");
      const d = await res.json();
      setDaySessionData(d);
    } catch (e) {
      console.error("Error loading day session:", e);
    }
  };

  const fetchReports = async (selectedRange: string, start?: string, end?: string) => {
    try {
      setLoading(true);
      let url = `/api/reports?range=${selectedRange}`;
      if (selectedRange === "CUSTOM" && start) {
        url += `&startDate=${start}`;
        if (end) url += `&endDate=${end}`;
      }
      const res = await fetch(url);
      const repData = await res.json();
      setData(repData);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaySession();
    fetchReports(range, customStartDate, customEndDate);
  }, [range]);

  const handleApplyCustomRange = () => {
    if (!customStartDate) {
      alert("Please select a Start Date");
      return;
    }
    setRange("CUSTOM");
    fetchReports("CUSTOM", customStartDate, customEndDate);
  };

  const handleStartNewDay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/day-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START",
          openingCash: parseFloat(openingCashInput || "0"),
        }),
      });
      if (res.ok) {
        setIsStartDayModalOpen(false);
        fetchDaySession();
        fetchReports("TODAY");
      }
    } catch (err) {
      console.error("Start day error:", err);
    }
  };

  const handleCloseDay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/day-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CLOSE",
          actualCashCount: parseFloat(actualCashInput || "0"),
          closingNotes: closingNotesInput,
        }),
      });
      if (res.ok) {
        setIsCloseDayModalOpen(false);
        fetchDaySession();
        fetchReports("TODAY");
      }
    } catch (err) {
      console.error("Close day error:", err);
    }
  };

  const handleExportCsv = () => {
    const items = data?.itemBreakdown || data?.bestsellers || [];
    if (items.length === 0) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Dish Name,Diet,Quantity Sold,Total Revenue (INR)\n" +
      items.map((b: any) => `"${b.name}",${b.isVeg !== false ? "VEG" : "NON-VEG"},${b.quantity},${b.revenue}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Aapno_Khano_Sales_Report_${range}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredItems = (data?.itemBreakdown || data?.bestsellers || []).filter((item: any) =>
    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#AA1B2A]/10 border border-[#AA1B2A]/20 flex items-center justify-center text-[#AA1B2A]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm text-[#331E17]">Advanced Sales &amp; Multi-Period Analytics</h1>
              <p className="text-xs text-[#745E55]">
                Complete daily, weekly, monthly, 3-month &amp; 6-month GST sales ledger • Shift EOD Manager
              </p>
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExportCsv}
            className="bg-[#AA1B2A] hover:bg-[#8e1421] text-white px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer border border-[#E09D3D]"
          >
            <Download className="w-3.5 h-3.5 text-[#E09D3D]" />
            <span>Export Full CSV</span>
          </button>
        </div>

        {/* DAY SESSION MANAGEMENT WIDGET (Start New Day / Close Day) */}
        <div className="bg-gradient-to-r from-[#AA1B2A] to-[#8C101C] text-white p-5 rounded-3xl shadow-md border border-[#E09D3D]/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              {daySessionData?.isDayOpen ? (
                <Sunrise className="w-6 h-6 text-amber-300 animate-pulse" />
              ) : (
                <Moon className="w-6 h-6 text-slate-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wide">
                  Business Day: {daySessionData?.todayDate || "Today"}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    daySessionData?.isDayOpen
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-400 text-[#331E17]"
                  }`}
                >
                  {daySessionData?.isDayOpen ? "● Day Active / Open" : "○ Day Closed"}
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5">
                {daySessionData?.isDayOpen
                  ? `Opening Float: ₹${daySessionData.currentSession?.openingCash || 0} • Today Live Sales: ₹${daySessionData.currentSession?.liveTotalSales?.toLocaleString() || 0} (${daySessionData.currentSession?.liveOrdersCount || 0} Bills)`
                  : `Last Closed Day Sale: ₹${daySessionData?.lastClosedSession?.totalSales?.toLocaleString() || 0} (${daySessionData?.lastClosedSession?.totalOrders || 0} Orders)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!daySessionData?.isDayOpen ? (
              <button
                onClick={() => setIsStartDayModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-transform active:scale-95 border border-emerald-300"
              >
                <Sunrise className="w-4 h-4 text-white" />
                <span>Start New Business Day</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCloseDayModalOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-[#331E17] font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-transform active:scale-95 border border-amber-200"
              >
                <Moon className="w-4 h-4 text-[#331E17]" />
                <span>Close Day &amp; Z-Report</span>
              </button>
            )}
          </div>
        </div>

        {/* STICKY MULTI-PERIOD DATE RANGE FILTERS */}
        <div className="sticky top-0 z-20 bg-[#FEFBF5] pt-0 pb-1">
          <div className="bg-white p-3.5 rounded-3xl border border-[#E8E1D6] shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black text-[#745E55] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#AA1B2A]" /> Select Reporting Period:
              </span>

              <div className="flex flex-wrap items-center gap-1 bg-[#F7F2EA] p-1 rounded-2xl text-xs font-bold border border-[#E8E1D6]">
                {[
                  { id: "TODAY", label: "Today (आज)" },
                  { id: "YESTERDAY", label: "Yesterday (कल)" },
                  { id: "7DAYS", label: "7 Days (हफ़्ता)" },
                  { id: "30DAYS", label: "30 Days (महीना)" },
                  { id: "3MONTHS", label: "3 Months (तिमाही)" },
                  { id: "6MONTHS", label: "6 Months (छमाही)" },
                  { id: "ALL", label: "Lifetime (ऑल टाइम)" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRange(r.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      range === r.id
                        ? "bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-2xs font-black"
                        : "text-[#745E55] hover:text-[#331E17]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range Picker */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500">Or Custom Date Range:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                />
                <span className="text-slate-400 font-bold">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                />
                <button
                  onClick={handleApplyCustomRange}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Apply Custom
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TOP 6 FINANCIAL & OPERATIONAL METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Total Sales */}
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Total Sales (कुल बिक्री)</p>
            <h3 className="text-xl font-black text-[#AA1B2A] mt-1">
              ₹{data?.summary?.totalSales?.toLocaleString() || "0"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{data?.summary?.completedOrders || 0} settled bills</p>
          </div>

          {/* Net Profit */}
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Net Profit (शुद्ध लाभ)</p>
            <h3 className="text-xl font-black text-emerald-700 mt-1">
              ₹{data?.summary?.netProfit?.toLocaleString() || data?.summary?.totalSales?.toLocaleString() || "0"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Sales minus expenses</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Total Orders (कुल ऑर्डर)</p>
            <h3 className="text-xl font-black text-[#331E17] mt-1">
              {data?.summary?.totalOrders || 0}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{data?.summary?.pendingOrders || 0} ongoing</p>
          </div>

          {/* Average Order Value */}
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Avg Bill (औसत बिल)</p>
            <h3 className="text-xl font-black text-blue-700 mt-1">
              ₹{data?.summary?.avgOrderValue || 0}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Per order average</p>
          </div>

          {/* GST Tax Collected */}
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">GST Tax (5% टैक्स)</p>
            <h3 className="text-xl font-black text-indigo-700 mt-1">
              ₹{data?.summary?.totalTax?.toLocaleString() || "0"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">CGST 2.5% + SGST 2.5%</p>
          </div>

          {/* Discounts */}
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Discounts (दी गई छूट)</p>
            <h3 className="text-xl font-black text-amber-700 mt-1">
              ₹{data?.summary?.totalDiscounts?.toLocaleString() || "0"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Coupon &amp; bill cuts</p>
          </div>
        </div>

        {/* REVENUE TIMELINE CHART & PAYMENT BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Sales Chart (2/3) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-[#E8E1D6] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-black text-[#331E17] uppercase tracking-wide">
                    Revenue &amp; Order Distribution ({range})
                  </h3>
                  <p className="text-[11px] text-[#745E55]">Sales velocity over selected period</p>
                </div>
                <span className="text-xs font-bold text-[#AA1B2A] bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                  ₹{data?.summary?.totalSales?.toLocaleString() || 0} Total
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.salesTimeline || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EAE1" />
                    <XAxis dataKey="label" stroke="#745E55" fontSize={10} tickLine={false} />
                    <YAxis stroke="#745E55" fontSize={10} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`₹${val}`, "Revenue"]}
                      contentStyle={{ backgroundColor: "#331E17", borderRadius: "12px", border: "none", color: "#FEFBF5", fontSize: "11px" }}
                    />
                    <Bar dataKey="sales" fill="#AA1B2A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Payment Method Split (1/3) */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D6] shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-[#331E17] uppercase tracking-wide mb-1">
                Payment Breakdown (पेमेंट मोड)
              </h3>
              <p className="text-[11px] text-[#745E55] mb-4">UPI vs Cash vs Card Collections</p>

              <div className="space-y-3">
                {(data?.paymentMethods || []).map((pm: any) => {
                  const total = data?.summary?.totalSales || 1;
                  const pct = Math.round((pm.value / total) * 100);
                  return (
                    <div key={pm.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#331E17]">{pm.name}</span>
                        <span className="text-[#AA1B2A]">
                          ₹{pm.value?.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50/50 rounded-2xl border border-amber-200/50 text-[11px] text-amber-900">
              <p className="font-bold">💡 Note on Cash Float:</p>
              <p className="text-amber-800 text-[10px]">
                Always verify cash drawer balance against the Z-Report closing summary before ending the shift.
              </p>
            </div>
          </div>
        </div>

        {/* DISH VELOCITY & ITEM-WISE SALES BREAKDOWN TABLE */}
        <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xs p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-[#331E17]">Dish Velocity &amp; Item Sales Ledger</h3>
              <p className="text-xs text-[#745E55]">
                Exact count of dishes sold and revenue earned for period: <span className="font-bold text-[#AA1B2A]">{range}</span>
              </p>
            </div>

            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dish name..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Dish Name</th>
                  <th className="py-2.5 px-3">Diet</th>
                  <th className="py-2.5 px-3 text-center">Quantity Sold</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No dish sales recorded for this period.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: any, idx: number) => (
                    <tr key={item.name} className="hover:bg-amber-50/40">
                      <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-black text-[#331E17]">{item.name}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.isVeg !== false
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          {item.isVeg !== false ? "VEG" : "NON-VEG"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                        {item.quantity} orders
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-[#AA1B2A]">
                        ₹{item.revenue?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* START NEW DAY MODAL */}
        {isStartDayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sunrise className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#331E17]">Start New Business Day</h3>
                  <p className="text-xs text-slate-500">Date: {daySessionData?.todayDate || "Today"}</p>
                </div>
              </div>

              <form onSubmit={handleStartNewDay} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opening Cash Float in Drawer (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 2000"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Initial change cash kept in drawer before opening.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsStartDayModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    Confirm &amp; Open Day
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CLOSE DAY / Z-REPORT MODAL */}
        {isCloseDayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#331E17]">Close Business Day (Z-Report)</h3>
                  <p className="text-xs text-slate-500">Tally drawer and end shift session</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Opening Float:</span>
                  <span className="font-mono font-bold">₹{daySessionData?.currentSession?.openingCash || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Today Cash Sales:</span>
                  <span className="font-mono font-bold text-emerald-600">+₹{daySessionData?.currentSession?.liveCashSales || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Today UPI Sales:</span>
                  <span className="font-mono font-bold text-blue-600">₹{daySessionData?.currentSession?.liveUpiSales || 0}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                  <span className="text-slate-800">Expected Cash in Drawer:</span>
                  <span className="font-mono text-[#AA1B2A]">
                    ₹{(daySessionData?.currentSession?.openingCash || 0) + (daySessionData?.currentSession?.liveCashSales || 0)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleCloseDay} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Actual Physical Cash Counted (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter cash physically present"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Closing Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={closingNotesInput}
                    onChange={(e) => setClosingNotesInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. Shift handed over smoothly to morning staff."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCloseDayModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#AA1B2A] hover:bg-[#8e1421] text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    Confirm &amp; Close Day
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
