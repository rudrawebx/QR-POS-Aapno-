'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Sparkles, Check } from 'lucide-react';
import { CartItem } from '@/lib/types';

interface FoodCustomizationModalProps {
  product: any;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export default function FoodCustomizationModal({
  product,
  onClose,
  onAddToCart,
}: FoodCustomizationModalProps) {
  // Variation State (Small/Large or Half/Full)
  const [selectedVar, setSelectedVar] = useState<'Small' | 'Large' | 'Half' | 'Full' | null>(() => {
    if (product.hasVariations) {
      if (product.variationType === 'SMALL_LARGE') return 'Small';
      if (product.variationType === 'HALF_FULL') return 'Half';
    }
    return null;
  });

  const [quantity, setQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');

  // Calculate Unit Price based on variation
  let unitPrice = product.basePrice;
  if (selectedVar === 'Small' || selectedVar === 'Half') {
    unitPrice = product.priceSmallHalf ?? product.basePrice;
  } else if (selectedVar === 'Large' || selectedVar === 'Full') {
    unitPrice = product.priceLargeFull ?? product.basePrice;
  }

  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart({
      cartId: `${product.id}_${selectedVar || 'base'}_${Date.now()}`,
      productId: product.id,
      name: product.name,
      basePrice: product.basePrice,
      selectedVariation: selectedVar,
      unitPrice,
      quantity,
      isVeg: product.isVeg,
      imageUrl: product.imageUrl,
      modifiers: [],
      specialNotes: specialNotes.trim() || undefined,
      kitchenStationId: product.kitchenStationId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div
        className="w-full max-w-lg bg-[#FEFBF5] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200 border border-[#E09D3D]/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Image & Close */}
        <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'}
            alt={product.name} className="w-full h-full object-cover opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              {/* Veg / Non-Veg Badge */}
              <span
                className={`w-4 h-4 rounded-xs border-2 bg-white flex items-center justify-center shadow-xs ${
                  product.isVeg ? 'border-emerald-600' : 'border-red-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    product.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                  }`}
                />
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  product.isVeg
                    ? 'bg-[#3B9D51]/90 text-white border border-[#3B9D51]'
                    : 'bg-red-600/90 text-white border border-red-400'
                }`}
              >
                {product.isVeg ? 'Vegetarian 🟢' : 'Non-Vegetarian 🔴'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white drop-shadow-sm">{product.name}</h2>
            {product.localName && (
              <p className="text-xs text-[#E09D3D] font-bold">{product.localName}</p>
            )}
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800 flex-1">
          {product.description && (
            <p className="text-xs text-[#745E55] leading-relaxed bg-[#F7F2EA] p-3 rounded-2xl border border-[#E8E1D6]">
              {product.description}
            </p>
          )}

          {/* Selectable Variation (Small/Large or Half/Full) */}
          {product.hasVariations && (
            <div className="space-y-2">
              <label className="text-xs font-black text-[#AA1B2A] uppercase tracking-wider flex items-center gap-1">
                <span>Select Portion Size</span>
                <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {product.variationType === 'SMALL_LARGE' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedVar('Small')}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedVar === 'Small'
                          ? 'border-[#AA1B2A] bg-[#AA1B2A]/5 ring-2 ring-[#AA1B2A]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#331E17]">Small Portion</span>
                        {selectedVar === 'Small' && <Check className="w-4 h-4 text-[#AA1B2A]" />}
                      </div>
                      <p className="text-sm font-black text-[#AA1B2A] mt-1">
                        ₹{product.priceSmallHalf ?? product.basePrice}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedVar('Large')}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedVar === 'Large'
                          ? 'border-[#AA1B2A] bg-[#AA1B2A]/5 ring-2 ring-[#AA1B2A]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#331E17]">Large Portion</span>
                        {selectedVar === 'Large' && <Check className="w-4 h-4 text-[#AA1B2A]" />}
                      </div>
                      <p className="text-sm font-black text-[#AA1B2A] mt-1">
                        ₹{product.priceLargeFull ?? product.basePrice}
                      </p>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedVar('Half')}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedVar === 'Half'
                          ? 'border-[#AA1B2A] bg-[#AA1B2A]/5 ring-2 ring-[#AA1B2A]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#331E17]">Half Handi (1-2 Pax)</span>
                        {selectedVar === 'Half' && <Check className="w-4 h-4 text-[#AA1B2A]" />}
                      </div>
                      <p className="text-sm font-black text-[#AA1B2A] mt-1">
                        ₹{product.priceSmallHalf ?? product.basePrice}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedVar('Full')}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedVar === 'Full'
                          ? 'border-[#AA1B2A] bg-[#AA1B2A]/5 ring-2 ring-[#AA1B2A]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#331E17]">Full Handi (3-4 Pax)</span>
                        {selectedVar === 'Full' && <Check className="w-4 h-4 text-[#AA1B2A]" />}
                      </div>
                      <p className="text-sm font-black text-[#AA1B2A] mt-1">
                        ₹{product.priceLargeFull ?? product.basePrice}
                      </p>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Cooking Notes Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Special Cooking Request (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Extra spicy, less oil, crispy tandoor preparation"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E8E1D6] rounded-xl text-xs text-[#331E17] focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
            />
          </div>
        </div>

        {/* Modal Bottom Bar: Qty + Add to Cart Button */}
        <div className="p-4 bg-white border-t border-[#E8E1D6] flex items-center justify-between gap-4">
          <div className="flex items-center bg-[#F7F2EA] p-1 rounded-2xl border border-[#E8E1D6]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center font-bold shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-black text-sm text-[#331E17]">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center font-bold shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-between cursor-pointer border border-[#E09D3D]"
          >
            <span>Add to Order</span>
            <span className="font-black text-[#FEFBF5]">₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
