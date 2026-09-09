'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PrintDualThermal from '@/components/PrintDualThermal';
import { PrintKotData, PrintReceiptData } from '@/lib/types';
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  UtensilsCrossed,
  Receipt,
  Printer,
  CreditCard,
  XCircle,
  Sparkles,
  ChevronRight,
  Filter,
  Car,
  ShoppingBag,
  Check,
  Download,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<string>('TODAY');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('ALL');

  // Dual Print Modal state
  const [activeDualPrint, setActiveDualPrint] = useState<{
    billData?: PrintReceiptData | null;
    kotData?: PrintKotData | null;
    mode: 'PRINT_BOTH' | 'PRINT_BILL' | 'PRINT_KOT';
  } | null>(null);

  // Refund Modal state
  const [refundingOrder, setRefundingOrder] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState('Customer Request');

  const fetchOrders = async (selectedRange = range) => {
    try {
      const res = await fetch(`/api/orders?range=${selectedRange}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(range);
    const interval = setInterval(() => fetchOrders(range), 4000);
    return () => clearInterval(interval);
  }, [range]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, staffName: 'Admin Manager' }),
      });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleProcessRefund = async () => {
    if (!refundingOrder) return;
    try {
      await fetch(`/api/orders/${refundingOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REFUND',
          refundAmount: refundingOrder.grandTotal,
          refundReason,
          staffName: 'Admin Manager',
        }),
      });
      setRefundingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Refund processing error:', err);
    }
  };

  const buildPrintData = (order: any) => {
    const billData: PrintReceiptData = {
      restaurant: {
        name: 'आपणो खाणो (Aapno Khaano)',
        address: 'Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053',
        city: 'Fatehabad',
        state: 'Haryana',
        postalCode: '125053',
        phone: '+91 99962 13962',
        gstin: '08AABCU9603R1ZM',
        fssaiNumber: '12224026000189',
        currencySymbol: '₹',
        defaultReceiptFooter: 'Padharo Mhare Desh! Thank you for visiting Aapno Khaano.',
      },
      order: {
        humanOrderId: order.humanOrderId,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        carNumber: order.carNumber,
        orderType: order.orderType,
        cookingInstructions: order.cookingInstructions,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        subtotal: order.subtotal,
        cgstAmount: +(order.taxAmount / 2).toFixed(2),
        sgstAmount: +(order.taxAmount / 2).toFixed(2),
        grandTotal: order.grandTotal,
        discountAmount: order.discountAmount,
      },
      items: order.items.map((it: any) => ({
        name: it.productName,
        selectedVariation: it.selectedVariation,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        isVeg: it.isVeg,
      })),
    };

    const kotData: PrintKotData = {
      kot: {
        humanKotNumber: `KOT-${order.humanOrderId.replace('AK-2026-', '')}`,
        orderNumber: order.humanOrderId,
        createdAt: order.createdAt,
        stationName: 'ALL STATIONS / EXPEDITER',
        carNumber: order.carNumber,
        customerName: order.customerName,
        orderType: order.orderType,
        specialInstructions: order.cookingInstructions,
      },
      items: order.items.map((it: any) => ({
        productName: it.productName,
        selectedVariation: it.selectedVariation,
        quantity: it.quantity,
        isVeg: it.isVeg,
        itemNotes: it.itemNotes,
      })),
    };

    return { billData, kotData };
  };

  const handlePrintBoth = (order: any) => {
    if (order.paymentStatus !== 'PAID') {
      alert('Security Protection: Cannot generate or print Tax Bill & KOT for unpaid/pending orders.');
      return;
    }
    const { billData, kotData } = buildPrintData(order);
    setActiveDualPrint({ billData, kotData, mode: 'PRINT_BOTH' });
  };

  const handlePrintBill = (order: any) => {
    if (order.paymentStatus !== 'PAID') {
      alert('Security Protection: Cannot print Tax Bill for unpaid/pending orders.');
      return;
    }
    const { billData } = buildPrintData(order);
    setActiveDualPrint({ billData, mode: 'PRINT_BILL' });
  };

  const handlePrintKot = (order: any) => {
    if (order.paymentStatus !== 'PAID') {
      alert('Security Protection: Cannot print KOT for unpaid/pending orders.');
      return;
    }
    const { kotData } = buildPrintData(order);
    setActiveDualPrint({ kotData, mode: 'PRINT_KOT' });
  };

  const handleConfirmCashOrder = async (order: any) => {
    if (!confirm(`Confirm Cash Payment of ₹${order.grandTotal} received by Cashier for order ${order.humanOrderId}?`)) {
      return;
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          action: 'CONFIRM_CASH',
          isStaffCashConfirmed: true,
          staffId: 'ADMIN_MGR',
          receivedAmount: order.grandTotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.error || 'Failed to confirm cash order');
      }
    } catch (err) {
      console.error('Error confirming cash order:', err);
    }
  };

  const columns = [
    { key: 'AWAITING_PAYMENT', title: 'Pending Payment', color: 'border-amber-500 bg-amber-50/50 text-amber-900', icon: Clock },
    { key: 'CONFIRMED', title: 'Paid & Fired', color: 'border-emerald-600 bg-emerald-50/50 text-emerald-900', icon: CheckCircle2 },
    { key: 'PREPARING', title: 'Handi & Tandoor', color: 'border-amber-600 bg-amber-50/50 text-amber-900', icon: ChefHat },
    { key: 'READY', title: 'Ready for Car / Pickup', color: 'border-[#AA1B2A] bg-red-50/50 text-[#AA1B2A]', icon: Bell },
    { key: 'SERVED', title: 'Delivered to Vehicle', color: 'border-cyan-600 bg-cyan-50/50 text-cyan-900', icon: Car },
    { key: 'COMPLETED', title: 'Completed Archive', color: 'border-slate-400 bg-slate-50 text-slate-800', icon: Receipt },
  ];

  const filteredOrders = orders.filter((ord) => {
    if (orderTypeFilter !== 'ALL' && ord.orderType !== orderTypeFilter) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-4 max-w-full">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#AA1B2A]/10 border border-[#AA1B2A]/20 flex items-center justify-center text-[#AA1B2A]">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#331E17]">Live Order Operations</h1>
              <p className="text-xs text-[#745E55]">
                Real-time Kitchen &amp; Car Service KOT pipeline with strict payment verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick date range switcher */}
            <div className="flex items-center bg-[#F7F2EA] p-1 rounded-2xl border border-[#E8E1D6] text-xs">
              <button
                onClick={() => {
                  setRange('TODAY');
                  fetchOrders('TODAY');
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  range === 'TODAY'
                    ? 'bg-[#AA1B2A] text-white font-bold shadow-2xs'
                    : 'text-[#745E55] hover:text-[#331E17]'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  setRange('WEEK');
                  fetchOrders('WEEK');
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  range === 'WEEK'
                    ? 'bg-[#AA1B2A] text-white font-bold shadow-2xs'
                    : 'text-[#745E55] hover:text-[#331E17]'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => {
                  setRange('ALL');
                  fetchOrders('ALL');
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  range === 'ALL'
                    ? 'bg-[#AA1B2A] text-white font-bold shadow-2xs'
                    : 'text-[#745E55] hover:text-[#331E17]'
                }`}
              >
                All Time
              </button>
            </div>

            {/* Order Type Filter */}
            <div className="flex items-center bg-[#F7F2EA] p-1 rounded-2xl border border-[#E8E1D6] text-xs">
              <button
                onClick={() => setOrderTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  orderTypeFilter === 'ALL'
                    ? 'bg-[#331E17] text-white shadow-2xs font-black'
                    : 'text-[#745E55]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setOrderTypeFilter('CAR_SERVICE')}
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                  orderTypeFilter === 'CAR_SERVICE'
                    ? 'bg-[#331E17] text-white shadow-2xs font-black'
                    : 'text-[#745E55]'
                }`}
              >
                <Car className="w-3 h-3" />
                <span>Car</span>
              </button>
              <button
                onClick={() => setOrderTypeFilter('TAKEAWAY')}
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                  orderTypeFilter === 'TAKEAWAY'
                    ? 'bg-[#331E17] text-white shadow-2xs font-black'
                    : 'text-[#745E55]'
                }`}
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Takeaway</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start overflow-x-auto pb-6">
          {columns.map((col) => {
            const colOrders = filteredOrders.filter((o) => o.status === col.key);
            const Icon = col.icon;

            return (
              <div
                key={col.key}
                className="bg-white rounded-3xl border border-[#E8E1D6] shadow-2xs flex flex-col max-h-[82vh] min-w-[260px]"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b-2 ${col.color} rounded-t-3xl flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">{col.title}</span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-white text-slate-900 font-black text-xs flex items-center justify-center shadow-2xs">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 overflow-y-auto flex-1 space-y-2.5 min-h-[140px]">
                  {colOrders.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-center text-slate-400 text-xs italic">
                      No orders in {col.title.toLowerCase()}
                    </div>
                  ) : (
                    colOrders.map((ord) => {
                      const isPaid = ord.paymentStatus === 'PAID';

                      return (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-2xl border border-[#E8E1D6] bg-white hover:border-[#E09D3D] shadow-xs space-y-2.5 transition-all text-xs"
                      >
                        {/* Order Header: ID, Car No, Type */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-[#331E17] font-mono">{ord.humanOrderId}</span>
                              <span className="bg-[#AA1B2A] text-white font-black text-[9px] px-1.5 py-0.5 rounded uppercase">
                                {ord.orderType?.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#745E55] font-semibold mt-0.5">
                              {ord.customerName} ({ord.customerPhone})
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-[#AA1B2A] text-sm">₹{ord.grandTotal}</span>
                            <span className={`text-[9px] font-bold block uppercase ${
                              ord.paymentStatus === 'REFUNDED'
                                ? 'text-red-700'
                                : ord.paymentStatus === 'PAID'
                                ? 'text-emerald-700'
                                : 'text-amber-700 bg-amber-100 px-1 rounded'
                            }`}>
                              {ord.paymentStatus === 'REFUNDED' ? 'REFUNDED' : ord.paymentStatus === 'PAID' ? 'PAID ✓' : 'UNPAID ⏳'}
                            </span>
                          </div>
                        </div>

                        {/* Vehicle Number Callout */}
                        {ord.carNumber && (
                          <div className="bg-amber-50 p-2 rounded-xl border border-amber-300 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-amber-900 flex items-center gap-1">
                              <Car className="w-3.5 h-3.5 text-[#AA1B2A]" />
                              <span>CAR NO:</span>
                            </span>
                            <span className="font-mono font-black text-slate-900 tracking-wider">
                              {ord.carNumber}
                            </span>
                          </div>
                        )}

                        {/* Items list */}
                        <div className="bg-[#FEFBF5] p-2.5 rounded-2xl border border-[#E8E1D6] space-y-1 text-[11px]">
                          {ord.items.map((it: any) => (
                            <div key={it.id} className="flex justify-between text-slate-800">
                              <span className="truncate pr-1">
                                <span className={it.isVeg ? 'text-emerald-600' : 'text-red-600'}>
                                  {it.isVeg ? '🟢' : '🔴'}
                                </span>{' '}
                                <b>{it.quantity}x</b> {it.productName}
                                {it.selectedVariation && (
                                  <span className="ml-1 text-[10px] text-[#AA1B2A] font-bold">
                                    ({it.selectedVariation})
                                  </span>
                                )}
                              </span>
                              <span className="font-bold text-slate-900">₹{it.totalPrice}</span>
                            </div>
                          ))}
                        </div>

                        {/* Cooking instructions */}
                        {ord.cookingInstructions && (
                          <p className="text-[10px] text-amber-900 bg-amber-50/80 p-2 rounded-xl italic border border-amber-200">
                            &ldquo;{ord.cookingInstructions}&rdquo;
                          </p>
                        )}

                        {/* Action Buttons Toolbar */}
                        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                          {isPaid ? (
                            <>
                              {/* Print Both (Bill + KOT) */}
                              <button
                                onClick={() => handlePrintBoth(ord)}
                                className="bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-[#FEFBF5] px-2.5 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1 border border-[#E09D3D] shadow-2xs cursor-pointer"
                                title="Print Both Bill &amp; KOT"
                              >
                                <Printer className="w-3 h-3 text-[#E09D3D]" />
                                <span>Print Both</span>
                              </button>

                              {/* Print Bill Only */}
                              <button
                                onClick={() => handlePrintBill(ord)}
                                className="p-1.5 rounded-xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-[#AA1B2A] transition-colors cursor-pointer border border-[#E8E1D6]"
                                title="Print 80mm Customer Bill"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </button>

                              {/* Print KOT Only */}
                              <button
                                onClick={() => handlePrintKot(ord)}
                                className="p-1.5 rounded-xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-slate-700 transition-colors cursor-pointer border border-[#E8E1D6]"
                                title="Print 80mm KOT Ticket"
                              >
                                <ChefHat className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 w-full">
                              <button
                                onClick={() => handleConfirmCashOrder(ord)}
                                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 px-2 rounded-xl text-[10px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                                <span>Confirm Cash Received</span>
                              </button>
                            </div>
                          )}

                          {/* Refund Trigger */}
                          {ord.paymentStatus === 'PAID' && (
                            <button
                              onClick={() => setRefundingOrder(ord)}
                              className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
                              title="Refund Order"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Next Status Step */}
                          {ord.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <span>Cooking</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {ord.status === 'PREPARING' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'READY')}
                              className="flex-1 bg-red-700 hover:bg-red-800 text-white font-black py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <span>Mark Ready</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {ord.status === 'READY' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'SERVED')}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <span>Deliver</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {ord.status === 'SERVED' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                              className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <span>Complete</span>
                              <Check className="w-3 h-3 text-emerald-400" />
                            </button>
                          )}
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
      </div>

      {/* Dual Print Modal */}
      {activeDualPrint && (
        <PrintDualThermal
          billData={activeDualPrint.billData}
          kotData={activeDualPrint.kotData}
          mode={activeDualPrint.mode}
          onClose={() => setActiveDualPrint(null)}
          autoPrint={true}
        />
      )}

      {/* Refund Modal */}
      {refundingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-red-200">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Refund Order {refundingOrder.humanOrderId}</span>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to refund <b>₹{refundingOrder.grandTotal}</b>? This will cancel the order and log an audit trail entry.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Refund:</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRefundingOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
