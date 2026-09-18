'use client';

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Users2,
  Search,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Heart,
  Sparkles,
  ShoppingBag,
  Car,
  X,
  Clock,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.carNumbers || []).some((car: string) => car.toLowerCase().includes(q))
    );
  });

  const handleOpenWhatsapp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const targetPhone = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;
    const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(
      `Hello ${name}, thank you for dining with Aapno Khaano (आपणो खाणो)! Here is our latest special menu and royal discounts for your next visit.`
    )}`;
    window.open(url, "_blank");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#AA1B2A]/10 border border-[#AA1B2A]/20 flex items-center justify-center text-[#AA1B2A]">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm text-[#331E17]">Customer CRM &amp; Order History</h1>
              <p className="text-xs text-[#745E55]">
                Full guest profiles • WhatsApp order history lookup &amp; vehicle registry
              </p>
            </div>
          </div>

          <div className="text-xs font-bold text-[#745E55] bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200">
            Total Unique Patrons: <b className="text-[#AA1B2A]">{customers.length}</b>
          </div>
        </div>

        {/* Sticky Search Bar */}
        <div className="sticky top-0 z-20 bg-[#FEFBF5] pt-0 pb-1">
          <div className="bg-white p-3.5 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patron by Name, WhatsApp phone number, or Car Plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
              />
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Patron Name</th>
                  <th className="py-3 px-4">WhatsApp Phone</th>
                  <th className="py-3 px-4">Vehicles</th>
                  <th className="py-3 px-4 text-center">Total Visits</th>
                  <th className="py-3 px-4 text-right">Lifetime Spend</th>
                  <th className="py-3 px-4 text-right">Avg Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No patrons found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4 font-black text-[#331E17]">{c.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-700 font-bold">{c.phone}</td>
                      <td className="py-3 px-4">
                        {(c.carNumbers || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {c.carNumbers.map((car: string) => (
                              <span key={car} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {car}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-[#AA1B2A]">
                        {c.totalVisits} orders
                      </td>
                      <td className="py-3 px-4 text-right font-black text-[#331E17]">
                        ₹{c.totalSpend?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-bold">
                        ₹{c.avgOrderValue}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenWhatsapp(c.phone, c.name)}
                            className="p-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl cursor-pointer border border-[#25D366]/30"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Order History ({c.orders?.length || 0})
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

        {/* CUSTOMER ORDER HISTORY MODAL */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-black text-sm text-[#331E17]">
                    Order History for {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedCustomer.phone} • Lifetime Spend: ₹{selectedCustomer.totalSpend?.toLocaleString()} ({selectedCustomer.totalVisits} visits)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                {(selectedCustomer.orders || []).length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">No recorded orders for this patron.</p>
                ) : (
                  (selectedCustomer.orders || []).map((ord: any) => (
                    <div
                      key={ord.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:bg-amber-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-[#AA1B2A]">
                            {ord.humanOrderId}
                          </span>
                          {ord.carNumber && (
                            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              🚗 {ord.carNumber}
                            </span>
                          )}
                          <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {ord.orderType || "CAR_SERVICE"}
                          </span>
                        </div>

                        <span className="font-mono font-black text-sm text-[#331E17]">
                          ₹{ord.grandTotal?.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        {ord.itemsSummary || "Food Items"}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                        <span>📅 {new Date(ord.createdAt).toLocaleString("en-IN")}</span>
                        <span className="font-bold text-emerald-700 uppercase">{ord.paymentMethod} (PAID)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t flex justify-end">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
