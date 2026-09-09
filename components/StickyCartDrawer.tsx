'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ChevronUp,
  X,
  Plus,
  Minus,
  Trash2,
  Car,
  Utensils,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { CartItem } from '@/lib/types';

interface StickyCartDrawerProps {
  cart: CartItem[];
  lockedTableNumber?: string | null;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onProceedToPayment: (orderDetails: {
    customerName: string;
    customerPhone: string;
    carNumber: string;
    orderType: 'CAR_SERVICE' | 'TAKEAWAY' | 'DINE_IN';
    cookingInstructions: string;
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
  }) => void;
}

export default function StickyCartDrawer({
  cart,
  lockedTableNumber,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToPayment,
}: StickyCartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [orderType, setOrderType] = useState<'CAR_SERVICE' | 'TAKEAWAY' | 'DINE_IN'>(
    lockedTableNumber ? 'DINE_IN' : 'CAR_SERVICE'
  );
  const [instructions, setInstructions] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (lockedTableNumber) {
      setOrderType('DINE_IN');
    }
  }, [lockedTableNumber]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cgstAmount = +(subtotal * 0.025).toFixed(2);
  const sgstAmount = +(subtotal * 0.025).toFixed(2);
  const taxAmount = +(cgstAmount + sgstAmount).toFixed(2);
  const grandTotal = +(subtotal + taxAmount).toFixed(2);

  if (cart.length === 0) return null;

  const handleCheckoutClick = () => {
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please enter customer full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (orderType === 'CAR_SERVICE' && !carNumber.trim()) {
      setFormError('Please enter car / vehicle registration number for Car Service delivery.');
      return;
    }

    onProceedToPayment({
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      carNumber: lockedTableNumber ? `Table ${lockedTableNumber}` : carNumber.trim().toUpperCase(),
      orderType,
      cookingInstructions: instructions.trim(),
      subtotal,
      taxAmount,
      grandTotal,
    });
  };

  return (
    <>
      {/* Sticky Bottom Floating Bar on Mobile/Desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white p-3.5 rounded-3xl shadow-2xl border-2 border-[#E09D3D] flex items-center justify-between transition-all active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E09D3D] text-[#331E17] flex items-center justify-center font-black shadow-inner">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#FEFBF5]">
                  {totalItems} {totalItems === 1 ? 'Dish' : 'Dishes'} in Cart
                </p>
                <p className="text-[11px] text-[#E09D3D] font-bold flex items-center gap-1">
                  <span>Tap to Review &amp; Pay</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-base font-black text-white">₹{grandTotal}</p>
              <p className="text-[10px] text-amber-200/90 font-medium">Incl. 5% GST</p>
            </div>
          </button>
        </div>
      </div>

      {/* Expanded Slide-Up Checkout Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-[#FEFBF5] rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200 border-t-2 border-[#E09D3D]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white flex items-center justify-between border-b border-[#E09D3D]/30">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#E09D3D]" />
                <div>
                  <h3 className="font-black text-sm text-white">Aapno Khaano • Order Checkout</h3>
                  <p className="text-[11px] text-[#E09D3D] font-bold">{totalItems} items selected</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1">
              {/* Error Notice if any */}
              {formError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3.5 py-2.5 rounded-2xl font-bold">
                  {formError}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2.5">
                <p className="font-black text-[#AA1B2A] uppercase tracking-wider text-[11px]">Selected Dishes</p>
                <div className="divide-y divide-slate-200 bg-white rounded-3xl p-3 border border-[#E8E1D6] shadow-2xs">
                  {cart.map((item) => (
                    <div key={item.cartId} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center flex-shrink-0 ${
                              item.isVeg ? 'border-emerald-600 bg-emerald-50' : 'border-red-600 bg-red-50'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                              }`}
                            />
                          </span>
                          <p className="font-bold text-[#331E17] truncate">
                            {item.name}
                            {item.selectedVariation && (
                              <span className="ml-1 text-[10px] text-[#AA1B2A] font-black bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {item.selectedVariation}
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">₹{item.unitPrice} each</p>
                        {item.specialNotes && (
                          <p className="text-[10px] text-amber-800 italic mt-0.5">"{item.specialNotes}"</p>
                        )}
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) onRemoveItem(item.cartId);
                            else onUpdateQuantity(item.cartId, -1);
                          }}
                          className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 cursor-pointer"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="w-5 text-center font-black text-[#331E17]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, 1)}
                          className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[50px]">
                        <span className="font-black text-[#AA1B2A]">₹{item.unitPrice * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QSR Order Type Selection */}
              <div className="space-y-2">
                <label className="font-black text-[#AA1B2A] uppercase tracking-wider text-[11px] block">
                  Select Order Service Type
                </label>
                {lockedTableNumber ? (
                  <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl flex items-center gap-2 text-emerald-900 font-bold">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span>Locked to Dine-In: Table {lockedTableNumber}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('CAR_SERVICE')}
                      className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        orderType === 'CAR_SERVICE'
                          ? 'border-[#AA1B2A] bg-[#AA1B2A]/10 font-bold text-[#AA1B2A]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Car className="w-4 h-4 mx-auto mb-1 text-[#AA1B2A]" />
                      <span className="text-[11px] block font-bold">Car Service</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType('TAKEAWAY')}
                      className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        orderType === 'TAKEAWAY'
                          ? 'border-[#AA1B2A] bg-[#AA1B2A]/10 font-bold text-[#AA1B2A]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                      <span className="text-[11px] block font-bold">Takeaway</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType('DINE_IN')}
                      className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        orderType === 'DINE_IN'
                          ? 'border-[#AA1B2A] bg-[#AA1B2A]/10 font-bold text-[#AA1B2A]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Utensils className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                      <span className="text-[11px] block font-bold">Quick Dine-In</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Info Form */}
              <div className="bg-white rounded-3xl p-4 border border-[#E8E1D6] space-y-3 shadow-2xs">
                <p className="font-black text-[#331E17] text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Customer &amp; Vehicle Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Singh"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-bold text-slate-700 font-mono">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder="99962 13962"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-r-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#AA1B2A] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {orderType === 'CAR_SERVICE' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Car / Vehicle Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RJ 14 CA 9999"
                      value={carNumber}
                      onChange={(e) => setCarNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-xs text-slate-900 uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Our runner will deliver your hot order directly to your car window!
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Special Cooking / Delivery Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra green chutney, less spicy, parking bay 4"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
                  />
                </div>
              </div>

              {/* Bill Breakdown Summary */}
              <div className="bg-amber-50/60 p-3.5 rounded-3xl border border-amber-200/80 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Item Total:</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (CGST 2.5% + SGST 2.5%):</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#AA1B2A] pt-2 border-t border-amber-200">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Checkout Action */}
            <div className="p-4 bg-white border-t border-slate-200">
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white font-black py-3.5 px-4 rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-[#E09D3D] transition-all active:scale-98"
              >
                <span>Proceed to Verified Payment</span>
                <span className="font-black text-[#FEFBF5]">(₹{grandTotal})</span>
                <ArrowRight className="w-4 h-4 text-[#E09D3D]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
