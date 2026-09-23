'use client';

import React, { useState } from 'react';
import {
  PauseCircle,
  Play,
  Trash2,
  X,
  Car,
  ShoppingBag,
  Clock,
  Printer,
  Search,
  AlertCircle,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { CartItem } from '@/lib/types';

export interface HeldOrder {
  id: string;
  holdNumber: number;
  title?: string;
  createdAt: string;
  time: string;
  cartItems: CartItem[];
  orderType: 'CAR_SERVICE' | 'TAKEAWAY';
  customerName: string;
  customerPhone: string;
  carNumber: string;
  cookingInstructions: string;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'SPLIT';
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  itemCount: number;
}

export function getAmountColorTier(amount: number) {
  if (amount < 100) {
    return {
      tier: 'GREEN' as const,
      label: '🟢 Green Zone (< ₹100)',
      subtext: 'Budget / Low Ticket',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      cardClass: 'border-l-4 border-l-emerald-500 border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/40',
      textClass: 'text-emerald-700',
      lineClass: 'bg-emerald-500',
      accentColor: '#10B981',
    };
  }
  if (amount > 2000) {
    return {
      tier: 'RED' as const,
      label: '🔴 Red Zone (> ₹2,000)',
      subtext: 'High Value / VIP Alert',
      badgeClass: 'bg-red-100 text-red-800 border-red-300 font-black animate-pulse',
      cardClass: 'border-l-4 border-l-red-600 border-red-300 bg-red-50/30 hover:bg-red-50/50 shadow-sm',
      textClass: 'text-red-700 font-black',
      lineClass: 'bg-red-600',
      accentColor: '#DC2626',
    };
  }
  if (amount > 1000) {
    return {
      tier: 'ORANGE' as const,
      label: '🟠 Orange Zone (> ₹1,000)',
      subtext: 'Medium Value (> ₹1k)',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 font-bold',
      cardClass: 'border-l-4 border-l-orange-500 border-orange-200 bg-orange-50/20 hover:bg-orange-50/40',
      textClass: 'text-orange-700 font-bold',
      lineClass: 'bg-orange-500',
      accentColor: '#F97316',
    };
  }
  return {
    tier: 'STANDARD' as const,
    label: '⚪ Standard (₹100 - ₹1,000)',
    subtext: 'Regular Order',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    cardClass: 'border-l-4 border-l-slate-300 border-slate-200 bg-white hover:bg-slate-50',
    textClass: 'text-[#AA1B2A] font-bold',
    lineClass: 'bg-slate-400',
    accentColor: '#AA1B2A',
  };
}

interface PosHoldOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  heldOrders: HeldOrder[];
  onResumeOrder: (held: HeldOrder) => void;
  onDeleteHeldOrder: (id: string) => void;
  onClearAllHeldOrders: () => void;
  onDirectSettle?: (held: HeldOrder) => void;
  maxHoldCapacity?: number;
}

export default function PosHoldOrdersDrawer({
  isOpen,
  onClose,
  heldOrders,
  onResumeOrder,
  onDeleteHeldOrder,
  onClearAllHeldOrders,
  onDirectSettle,
  maxHoldCapacity = 20,
}: PosHoldOrdersDrawerProps) {
  const [filterTier, setFilterTier] = useState<'ALL' | 'GREEN' | 'ORANGE' | 'RED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter logic
  const filteredOrders = heldOrders.filter((ord) => {
    const tier = getAmountColorTier(ord.grandTotal).tier;
    if (filterTier === 'GREEN' && tier !== 'GREEN') return false;
    if (filterTier === 'ORANGE' && tier !== 'ORANGE') return false;
    if (filterTier === 'RED' && tier !== 'RED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCar = (ord.carNumber || '').toLowerCase().includes(q);
      const matchName = (ord.customerName || '').toLowerCase().includes(q);
      const matchPhone = (ord.customerPhone || '').includes(q);
      const matchId = ord.id.toLowerCase().includes(q) || `hold #${ord.holdNumber}`.includes(q);
      const matchItems = ord.cartItems.some((it) => it.name.toLowerCase().includes(q));
      return matchCar || matchName || matchPhone || matchId || matchItems;
    }
    return true;
  });

  const greenCount = heldOrders.filter((o) => getAmountColorTier(o.grandTotal).tier === 'GREEN').length;
  const orangeCount = heldOrders.filter((o) => getAmountColorTier(o.grandTotal).tier === 'ORANGE').length;
  const redCount = heldOrders.filter((o) => getAmountColorTier(o.grandTotal).tier === 'RED').length;
  const capacityPercent = Math.min(100, Math.round((heldOrders.length / maxHoldCapacity) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Container */}
      <div className="relative z-10 w-full max-w-2xl h-full bg-[#FEFBF5] shadow-2xl border-l-2 border-[#E09D3D] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white border-b border-[#E09D3D]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <PauseCircle className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-base text-white tracking-wide">
                    ऑर्डर होल्ड सेक्शन (Held Orders)
                  </h2>
                  <span className="px-2 py-0.5 bg-amber-400 text-[#331E17] text-xs font-black rounded-full shadow-2xs">
                    {heldOrders.length} / {maxHoldCapacity} Used
                  </span>
                </div>
                <p className="text-[11px] text-amber-100 font-medium">
                  Store up to {maxHoldCapacity} orders on hold • Resume anytime with 1-click
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-100 mb-1">
              <span>Hold Slots Capacity:</span>
              <span>{heldOrders.length} / {maxHoldCapacity} slots ({maxHoldCapacity - heldOrders.length} available)</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-300 ${
                  heldOrders.length >= maxHoldCapacity
                    ? 'bg-red-400'
                    : heldOrders.length >= 15
                    ? 'bg-orange-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search & Color Zone Filter Pills */}
        <div className="p-3 bg-white border-b border-[#E8E1D6] space-y-2.5 shadow-2xs">
          <div className="relative">
            <Search className="w-4 h-4 text-[#745E55] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search held orders by Car plate, Guest Name, Dish, Token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl text-xs text-[#331E17] placeholder-[#745E55] focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
            />
          </div>

          {/* Color Zone Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            <button
              type="button"
              onClick={() => setFilterTier('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterTier === 'ALL'
                  ? 'bg-[#331E17] text-white shadow-2xs'
                  : 'bg-[#F7F2EA] text-[#745E55] hover:bg-[#E8E1D6]'
              }`}
            >
              All Held ({heldOrders.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterTier('GREEN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterTier === 'GREEN'
                  ? 'bg-emerald-600 text-white font-black shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>&lt; ₹100 Green ({greenCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTier('ORANGE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterTier === 'ORANGE'
                  ? 'bg-orange-600 text-white font-black shadow-2xs'
                  : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>&gt; ₹1,000 Orange ({orangeCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTier('RED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterTier === 'RED'
                  ? 'bg-red-600 text-white font-black shadow-2xs'
                  : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>&gt; ₹2,000 Red Zone ({redCount})</span>
            </button>
          </div>
        </div>

        {/* Orders List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FEFBF5]">
          {heldOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
                <PauseCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="font-black text-sm text-[#331E17]">No Orders On Hold</h3>
              <p className="text-xs text-[#745E55] mt-1 max-w-xs">
                When you click &quot;Hold Order&quot; on the active billing ticket, it will appear here (up to 20 orders capacity).
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">No matching held orders found</p>
              <button
                type="button"
                onClick={() => {
                  setFilterTier('ALL');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs text-[#AA1B2A] font-bold underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredOrders.map((held) => {
              const tierInfo = getAmountColorTier(held.grandTotal);
              return (
                <div
                  key={held.id}
                  className={`p-3.5 rounded-2xl border transition-all ${tierInfo.cardClass} shadow-2xs hover:shadow-md`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-[#331E17] text-white flex items-center justify-center font-mono font-black text-xs">
                        #{held.holdNumber}
                      </span>

                      <div>
                        <div className="flex items-center gap-1.5">
                          {held.orderType === 'CAR_SERVICE' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-100 text-[#AA1B2A] font-black text-[10px] border border-red-200">
                              <Car className="w-3 h-3" />
                              <span>{held.carNumber || 'Car Order'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                              <ShoppingBag className="w-3 h-3" />
                              <span>Takeaway</span>
                            </span>
                          )}

                          <span className="text-[11px] font-bold text-[#331E17]">
                            {held.customerName || 'Direct Guest'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-[#745E55] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#745E55]" />
                            <span>{held.time}</span>
                          </span>
                          {held.customerPhone && (
                            <span>• 📱 +91 {held.customerPhone}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount Tier Badge */}
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${tierInfo.badgeClass} inline-block`}>
                        {tierInfo.label}
                      </span>
                      <div className={`text-base font-black ${tierInfo.textClass} mt-0.5`}>
                        ₹{held.grandTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Dishes Preview */}
                  <div className="py-2.5 space-y-1">
                    <div className="text-[10px] font-bold text-[#745E55] uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Items ({held.itemCount} qty):</span>
                      <span className="text-[10px] text-[#745E55]">Subtotal: ₹{held.subtotal.toFixed(2)} + GST: ₹{held.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-slate-200/80 space-y-1 max-h-28 overflow-y-auto">
                      {held.cartItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5 flex-1 pr-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                            <span className="font-bold text-[#331E17] line-clamp-1">{item.name}</span>
                            {item.selectedVariation && (
                              <span className="text-[10px] text-[#AA1B2A] font-bold">({item.selectedVariation})</span>
                            )}
                          </div>
                          <span className="font-mono text-xs font-bold text-[#331E17]">
                            ₹{item.unitPrice} × {item.quantity} = <b>₹{(item.unitPrice * item.quantity).toFixed(2)}</b>
                          </span>
                        </div>
                      ))}
                    </div>
                    {held.cookingInstructions && (
                      <p className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 font-medium">
                        📝 Note: {held.cookingInstructions}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => onResumeOrder(held)}
                      className="flex-1 py-2 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs border border-[#E09D3D]/40 cursor-pointer transition-transform active:scale-98"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume Order (लोड करें)</span>
                    </button>

                    {onDirectSettle && (
                      <button
                        type="button"
                        onClick={() => onDirectSettle(held)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Direct Settle & Print Bill"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Settle Bill</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteHeldOrder(held.id)}
                      className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-300 rounded-xl transition-colors cursor-pointer"
                      title="Discard Held Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area */}
        {heldOrders.length > 0 && (
          <div className="p-3 bg-white border-t border-[#E8E1D6] flex items-center justify-between text-xs">
            <span className="font-bold text-[#745E55]">
              Total {heldOrders.length} Held Orders on system
            </span>
            <button
              type="button"
              onClick={onClearAllHeldOrders}
              className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Clear All ({heldOrders.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
