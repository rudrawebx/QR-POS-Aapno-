'use client';

import React from 'react';
import { Search, Car, ShoppingBag, UtensilsCrossed, Phone, Sparkles, Filter } from 'lucide-react';

interface CustomerHeaderProps {
  restaurant: any;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
  categories: any[];
  activeCategory: string;
  onCategorySelect: (id: string) => void;
}

export default function CustomerHeader({
  restaurant,
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterSelect,
  categories,
  activeCategory,
  onCategorySelect,
}: CustomerHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-2xl">
      {/* Top Heritage Bar */}
      <div className="bg-[#80101C] px-4 py-1.5 border-b border-[#E09D3D]/30 flex items-center justify-between text-[11px] font-medium text-[#FEFBF5]">
        <div className="flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-[#E09D3D] animate-pulse" />
          <span className="font-bold text-[#E09D3D]">Car-Service &amp; QSR Drive-In Available</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <a href="tel:+919996213962" className="flex items-center gap-1 hover:text-white transition-colors">
            <Phone className="w-3 h-3 text-[#E09D3D]" />
            <span className="hidden sm:inline">+91 99962 13962</span>
          </a>
        </div>
      </div>

      {/* Main Brand Header */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-[#E09D3D] overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img
              src="/images/aapno-khano-logo.png"
              alt="आपणो खाणो"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>आपणो खाणो</span>
              <span className="text-xs font-normal text-[#E09D3D] hidden sm:inline">(Aapno Khaano)</span>
            </h1>
            <p className="text-[11px] text-[#FEFBF5]/90 font-medium">
              Royal Rajasthani Handi, Tandoor &amp; QSR Ordering
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-[#80101C]/80 border border-[#E09D3D]/40 px-3 py-1.5 rounded-2xl text-xs text-[#E09D3D] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pure Desi Ghee &amp; Authentic Spices</span>
        </div>
      </div>

      {/* Search & Veg/Non-Veg Filter Controls */}
      <div className="max-w-4xl mx-auto px-4 py-2 space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#E09D3D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chats, handi curries, tandoor, breads..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#80101C] border border-[#E09D3D]/40 rounded-2xl text-xs text-white placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-[#E09D3D] shadow-inner"
            />
          </div>

          {/* Veg / Non-Veg Quick Toggles */}
          <div className="flex items-center gap-1 bg-[#80101C] p-1 rounded-2xl border border-[#E09D3D]/30">
            <button
              onClick={() => onFilterSelect('ALL')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-[#E09D3D] text-[#331E17] shadow-sm font-black'
                  : 'text-amber-100/80 hover:text-white'
              }`}
            >
              All
            </button>

            <button
              onClick={() => onFilterSelect(selectedFilter === 'VEG' ? 'ALL' : 'VEG')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedFilter === 'VEG'
                  ? 'bg-[#3B9D51] text-white shadow-sm ring-1 ring-white/50 font-black'
                  : 'text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              <span className="w-3 h-3 rounded-xs border border-white flex items-center justify-center bg-[#3B9D51]">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
              <span>Veg</span>
            </button>

            <button
              onClick={() => onFilterSelect(selectedFilter === 'NON_VEG' ? 'ALL' : 'NON_VEG')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedFilter === 'NON_VEG'
                  ? 'bg-red-600 text-white shadow-sm ring-1 ring-white/50 font-black'
                  : 'text-red-400 hover:bg-red-950/40'
              }`}
            >
              <span className="w-3 h-3 rounded-xs border border-white flex items-center justify-center bg-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Navigation Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          <button
            onClick={() => onCategorySelect('ALL')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-[#E09D3D] text-[#331E17] shadow-md scale-105 font-black'
                : 'bg-[#80101C] text-[#FEFBF5] hover:bg-[#80101C]/80 border border-[#E09D3D]/30'
            }`}
          >
            All Royal Dishes
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E09D3D] text-[#331E17] shadow-md scale-105 font-black'
                    : 'bg-[#80101C] text-[#FEFBF5] hover:bg-[#80101C]/80 border border-[#E09D3D]/30'
                }`}
              >
                {cat.isVegCategory ? (
                  <span className="w-2.5 h-2.5 rounded-xs border border-green-400 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-green-400" />
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-xs border border-red-400 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                  </span>
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
