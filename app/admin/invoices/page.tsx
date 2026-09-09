'use client';

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import PrintThermalReceipt from "@/components/PrintThermalReceipt";
import { PrintReceiptData } from "@/lib/types";
import {
  FileText,
  Search,
  Printer,
  Calendar,
  CreditCard,
  CheckCircle2,
  DollarSign,
  Download,
  Filter,
  Car,
  Utensils,
  ShoppingBag,
  TrendingUp,
  Smartphone,
  Coins,
  RefreshCw,
  MessageSquareShare,
} from "lucide-react";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("TODAY");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePrintReceipt, setActivePrintReceipt] = useState<PrintReceiptData | null>(null);

  const fetchInvoices = async (selectedRange = range, start?: string, end?: string) => {
    try {
      setLoading(true);
      let url = `/api/invoices?range=${selectedRange}`;
      if (selectedRange === "CUSTOM" && start) {
        url += `&startDate=${start}`;
        if (end) url += `&endDate=${end}`;
      }
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(range, customStartDate, customEndDate);
  }, [range]);

  const handleApplyCustomRange = () => {
    if (!customStartDate) {
      alert("Please select a Start Date");
      return;
    }
    setRange("CUSTOM");
    fetchInvoices("CUSTOM", customStartDate, customEndDate);
  };

  const handleReprint = (inv: any) => {
    setActivePrintReceipt({
      restaurant: {
        name: "आपणो खाणो (Aapno Khaano)",
        address: "Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053",
        city: "Fatehabad",
        phone: "+91 99962 13962",
        gstin: "08AABCU9603R1ZM",
        fssaiNumber: "12224026000189",
        currencySymbol: "₹",
        defaultReceiptFooter: "Padharo Mhare Desh! Thank you for visiting Aapno Khaano.",
      },
      order: {
        humanOrderId: inv.order?.humanOrderId || inv.humanInvoiceNumber,
        createdAt: inv.createdAt,
        customerName: inv.customerName || "Direct Guest",
        customerPhone: inv.customerPhone || "9996213962",
        carNumber: inv.carNumber,
        orderType: inv.orderType || "CAR_SERVICE",
        cookingInstructions: inv.order?.cookingInstructions || null,
        paymentMethod: inv.paymentMethod || "UPI",
        paymentStatus: inv.paymentStatus || "PAID",
        transactionId: inv.transactionId,
        subtotal: inv.subtotal,
        cgstAmount: inv.cgstAmount,
        sgstAmount: inv.sgstAmount,
        grandTotal: inv.grandTotal,
        discountAmount: inv.discountAmount,
      },
      items: inv.order?.items?.map((it: any) => ({
        name: it.productName,
        selectedVariation: it.selectedVariation,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        isVeg: it.isVeg,
      })) || [{ name: "Assorted Royal Dishes", quantity: 1, unitPrice: inv.subtotal, totalPrice: inv.subtotal, isVeg: true }],
    });
  };

  const handleShareWhatsapp = (inv: any) => {
    const phone = (inv.customerPhone || "").replace(/\D/g, "");
    const cleanPhone = phone.length === 10 ? "91" + phone : phone;

    const itemsText = (inv.order?.items || [])
      .map((it: any) => `• ${it.quantity}x ${it.productName}${it.selectedVariation ? " [" + it.selectedVariation + "]" : ""} - ₹${(it.totalPrice || it.unitPrice * it.quantity).toFixed(2)}`)
      .join("\n");

    const message = `👑 *आपणो खाणो (Aapno Khaano)* 👑\n📍 Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053\n📞 Tel: +91 99962 13962\nGSTIN: 08AABCU9603R1ZM\nFSSAI: 12224026000189\n----------------------------------------\n🧾 *GST TAX INVOICE:* ${inv.humanInvoiceNumber}\n${inv.carNumber ? "🚗 *CAR / TABLE:* " + inv.carNumber + "\n" : ""}👤 *Customer:* ${inv.customerName || "Direct Guest"}\n📅 *Date:* ${new Date(inv.createdAt).toLocaleDateString("en-IN")} | *Time:* ${new Date(inv.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}\n----------------------------------------\n*ITEMS ORDERED:*\n${itemsText || "• Food Items Ordered"}\n----------------------------------------\n💵 Subtotal: ₹${inv.subtotal?.toFixed(2)}\n🏛️ GST Tax (5%): ₹${((inv.cgstAmount || 0) + (inv.sgstAmount || 0)).toFixed(2)}\n${inv.discountAmount ? "🎉 Discount: -₹" + inv.discountAmount.toFixed(2) + "\n" : ""}💰 *GRAND TOTAL: ₹${inv.grandTotal?.toFixed(2)}*\n✅ *Payment:* ${inv.paymentMethod} (PAID)\n----------------------------------------\n🙏 _Padharo Mhare Desh! Thank you for visiting Aapno Khaano._`;

    const whatsappUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const totalTax = invoices.reduce((sum, inv) => sum + (inv.cgstAmount || 0) + (inv.sgstAmount || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#AA1B2A]/10 border border-[#AA1B2A]/20 flex items-center justify-center text-[#AA1B2A]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm text-[#331E17]">Tax Invoices &amp; Bill Records</h1>
              <p className="text-xs text-[#745E55]">
                Permanent GST billing repository • 80mm reprint &amp; WhatsApp share
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchInvoices(range, customStartDate, customEndDate)}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Bills</span>
          </button>
        </div>

        {/* METRICS SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Settled Period Revenue</p>
            <h3 className="text-xl font-black text-[#AA1B2A] mt-0.5">
              ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Bills Count</p>
            <h3 className="text-xl font-black text-[#331E17] mt-0.5">{invoices.length} Bills</h3>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#745E55]">Total GST Collected</p>
            <h3 className="text-xl font-black text-indigo-700 mt-0.5">
              ₹{totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Multi-Period Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-[#F7F2EA] p-1 rounded-2xl text-xs font-bold border border-[#E8E1D6]">
              {[
                { id: "TODAY", label: "Today" },
                { id: "YESTERDAY", label: "Yesterday" },
                { id: "7DAYS", label: "7 Days" },
                { id: "30DAYS", label: "30 Days" },
                { id: "3MONTHS", label: "3 Months" },
                { id: "6MONTHS", label: "6 Months" },
                { id: "ALL", label: "All Bills" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    range === r.id
                      ? "bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-2xs font-black"
                      : "text-[#745E55] hover:text-[#331E17]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Bill #, Guest Name, Mobile, Car Plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchInvoices(range, customStartDate, customEndDate)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Custom Date Range Picker */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-500">Custom Date Filter:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
            />
            <button
              onClick={handleApplyCustomRange}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* INVOICES LIST TABLE */}
        <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3.5">Invoice #</th>
                  <th className="py-3 px-3.5">Customer &amp; Vehicle</th>
                  <th className="py-3 px-3.5">Date &amp; Time</th>
                  <th className="py-3 px-3.5">Order Type</th>
                  <th className="py-3 px-3.5">Payment</th>
                  <th className="py-3 px-3.5 text-right">Grand Total</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No invoices recorded for this period.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-black text-[#AA1B2A]">
                        {inv.humanInvoiceNumber}
                      </td>
                      <td className="py-3 px-3.5">
                        <p className="font-bold text-[#331E17]">{inv.customerName || "Direct Guest"}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {inv.customerPhone ? "+91 " + inv.customerPhone.replace(/\D/g, "").slice(-10) : "No Mobile"}
                          {inv.carNumber && " • " + inv.carNumber}
                        </p>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}{" "}
                        {new Date(inv.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {inv.orderType || "CAR_SERVICE"}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200">
                          {inv.paymentMethod || "UPI"} (PAID)
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-black text-sm text-[#331E17]">
                        ₹{inv.grandTotal?.toFixed(2)}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleShareWhatsapp(inv)}
                            className="p-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl cursor-pointer transition-colors border border-[#25D366]/30"
                            title="Share on WhatsApp"
                          >
                            <MessageSquareShare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReprint(inv)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Print 80mm Receipt"
                          >
                            <Printer className="w-3 h-3 text-[#E09D3D]" />
                            <span>Reprint</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REPRINT THERMAL MODAL */}
        {activePrintReceipt && (
          <PrintThermalReceipt
            data={activePrintReceipt}
            autoPrint={false}
            onClose={() => setActivePrintReceipt(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
