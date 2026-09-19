'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Car,
  ShoppingBag,
  ChefHat,
  Bell,
  Printer,
  Star,
  ChevronRight,
  Phone,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import PrintThermalReceipt from '@/components/PrintThermalReceipt';
import FeedbackModal from '@/components/FeedbackModal';
import { PrintReceiptData } from '@/lib/types';

export default function CustomerOrderTrackerPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePrintReceipt, setActivePrintReceipt] = useState<PrintReceiptData | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [staffCalled, setStaffCalled] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error loading order tracker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-white p-2 shadow-lg border border-[#D4AF37] mb-3 flex items-center justify-center animate-spin">
          <ChefHat className="w-6 h-6 text-[#7A0C16]" />
        </div>
        <p className="font-bold text-[#7A0C16] text-xs">Tracking your QSR order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-base font-bold text-slate-800">Order not found</h2>
        <p className="text-xs text-slate-500 mt-1">Please check your order link or contact Aapno Khaano staff.</p>
        <Link href="/r/aapno-khano" className="mt-4 px-4 py-2 bg-[#7A0C16] text-white rounded-xl text-xs font-bold">
          Back to Menu
        </Link>
      </div>
    );
  }

  // Stepper calculations
  const getStepNumber = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'SERVED':
      case 'COMPLETED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStepNumber(order.status);

  const handleOpenReceipt = () => {
    setActivePrintReceipt({
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
        cgstAmount: order.taxAmount / 2,
        sgstAmount: order.taxAmount / 2,
        grandTotal: order.grandTotal,
        discountAmount: order.discountAmount,
      },
      items: order.items.map((i: any) => ({
        name: i.productName,
        selectedVariation: i.selectedVariation,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        isVeg: i.isVeg,
      })),
    });
  };

  const handleCallRunner = () => {
    setStaffCalled(true);
    setTimeout(() => setStaffCalled(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-slate-900 flex flex-col font-sans pb-16">
      {/* Header */}
      <header className="bg-[#7A0C16] text-white p-4 border-b border-[#D4AF37]/30 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/r/aapno-khano"
            className="flex items-center gap-1.5 text-xs text-[#FDF6E2] hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Menu</span>
          </Link>

          <div className="text-center">
            <h1 className="font-black text-sm text-white flex items-center justify-center gap-1.5">
              <span>आपणो खाणो</span>
              <span className="text-[10px] text-[#D4AF37] bg-[#600810] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                Live Status
              </span>
            </h1>
            <p className="text-[11px] text-[#D4AF37] font-mono font-bold mt-0.5">{order.humanOrderId}</p>
          </div>

          <button
            onClick={handleOpenReceipt}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="View Receipt"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-5 w-full space-y-4">
        {/* Car / Order Type Badge */}
        <div className="bg-white rounded-3xl p-4 border-2 border-[#D4AF37] shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#7A0C16] text-[#D4AF37] flex items-center justify-center shadow-inner flex-shrink-0">
              {order.orderType === 'CAR_SERVICE' ? (
                <Car className="w-6 h-6 animate-pulse" />
              ) : (
                <ShoppingBag className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">
                {order.orderType === 'CAR_SERVICE'
                  ? '🚗 Car-Service Park & Dine'
                  : order.orderType === 'TAKEAWAY'
                  ? '🛍️ Takeaway / Pickup'
                  : '🍽️ Quick Dine-In'}
              </p>
              {order.carNumber ? (
                <h3 className="text-lg font-black text-[#7A0C16] tracking-wider font-mono">
                  {order.carNumber}
                </h3>
              ) : (
                <h3 className="text-base font-bold text-slate-900">{order.customerName}</h3>
              )}
            </div>
          </div>

          <div className="text-right">
            {order.paymentStatus === 'PAID' ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300 uppercase">
                Paid ✓ ({order.paymentMethod || 'Online'})
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-300 uppercase animate-pulse">
                ⚠️ Pay at Counter: ₹{Number(order.grandTotal || 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Live Stepper Tracker */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider text-slate-400">
            Live Order Timeline
          </h3>

          <div className="space-y-4">
            {/* Step 1: Order Confirmed / Payment */}
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  currentStep >= 1 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-500'
                }`}
              >
                ✓
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-xs font-bold text-slate-900">
                  {order.paymentStatus === 'PAID' ? 'Payment Verified & KOT Fired' : 'Order Placed & KOT Fired'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {order.paymentStatus === 'PAID'
                    ? 'Payment verified • Kitchen cooking underway'
                    : `Food preparation started • Please pay ₹${Number(order.grandTotal || 0).toFixed(2)} at billing counter`}
                </p>
              </div>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  currentStep >= 2
                    ? 'bg-[#7A0C16] text-[#D4AF37] ring-4 ring-amber-100 animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                2
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-xs font-bold text-slate-900">Chef Preparing Handi &amp; Tandoor</p>
                <p className="text-[11px] text-slate-500">Authentic spices and slow cooking underway</p>
              </div>
            </div>

            {/* Step 3: Ready */}
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  currentStep >= 3
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-xs font-bold text-slate-900">
                  {order.orderType === 'CAR_SERVICE' ? 'Runner Delivering to Your Car' : 'Ready at Pickup Counter'}
                </p>
                <p className="text-[11px] text-slate-500">Hot food dispatched to your vehicle window</p>
              </div>
            </div>

            {/* Step 4: Completed */}
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  currentStep >= 4 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-500'
                }`}
              >
                4
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-xs font-bold text-slate-900">Delivered &amp; Enjoyed</p>
                <p className="text-[11px] text-slate-500">Padharo Mhare Desh! Thank you for dining with us</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Dishes Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider text-slate-400">
              Ordered Items ({order.items.length})
            </h3>
            <span className="font-black text-sm text-[#7A0C16]">₹{order.grandTotal}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-xs border flex items-center justify-center ${
                      item.isVeg ? 'border-emerald-600' : 'border-red-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">
                      {item.productName}
                      {item.selectedVariation && (
                        <span className="ml-1 text-[10px] text-[#7A0C16] font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                          {item.selectedVariation}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                  </div>
                </div>

                <span className="font-black text-slate-900">₹{item.totalPrice}</span>
              </div>
            ))}
          </div>

          {order.cookingInstructions && (
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 mt-2">
              <span className="font-bold">Special Notes: </span>
              <span>"{order.cookingInstructions}"</span>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleCallRunner}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              staffCalled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
            }`}
          >
            <Bell className="w-4 h-4 text-[#7A0C16]" />
            <span>{staffCalled ? 'Runner Notified! ✓' : 'Call Staff to Car'}</span>
          </button>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="p-3.5 rounded-2xl bg-[#7A0C16] hover:bg-[#600810] text-white border border-[#D4AF37] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Star className="w-4 h-4 text-[#D4AF37]" />
            <span>Rate Your Meal</span>
          </button>
        </div>
      </main>

      {/* Thermal Print Modal */}
      {activePrintReceipt && (
        <PrintThermalReceipt
          data={activePrintReceipt}
          onClose={() => setActivePrintReceipt(null)}
        />
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <FeedbackModal
          restaurantId={order.restaurantId}
          orderId={order.id}
          onClose={() => setIsFeedbackOpen(false)}
        />
      )}
    </div>
  );
}
