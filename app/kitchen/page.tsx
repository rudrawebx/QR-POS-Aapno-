'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PrintKot from '@/components/PrintKot';
import { PrintKotData } from '@/lib/types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Printer,
  RefreshCw,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Car,
  ShoppingBag,
} from 'lucide-react';

import { playKitchenAlert, unlockAudioContext } from '@/lib/sound';

export default function KitchenDisplayPage() {
  const [kots, setKots] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [activeKotForPrint, setActiveKotForPrint] = useState<PrintKotData | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const seenKotIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialLoadRef = React.useRef(true);

  const fetchKots = async () => {
    try {
      const res = await fetch('/api/kot');
      const data = await res.json();
      if (data.kots && Array.isArray(data.kots)) {
        if (isInitialLoadRef.current) {
          data.kots.forEach((k: any) => {
            if (k.id) seenKotIdsRef.current.add(k.id);
            if (k.humanKotNumber) seenKotIdsRef.current.add(k.humanKotNumber);
          });
          isInitialLoadRef.current = false;
        } else {
          for (const k of data.kots) {
            const kotKey = k.id || k.humanKotNumber;
            if (kotKey && !seenKotIdsRef.current.has(kotKey)) {
              seenKotIdsRef.current.add(kotKey);
              if (audioEnabled) {
                playKitchenAlert();
              }
              break;
            }
          }
        }
        setKots(data.kots);
      }
    } catch (err) {
      console.error('Error loading KOTs:', err);
    }
  };

  useEffect(() => {
    unlockAudioContext();
    fetchKots();
    const interval = setInterval(fetchKots, 2000);
    return () => clearInterval(interval);
  }, [audioEnabled]);

  const handleUpdateKotStatus = async (kotId: string, nextStatus: string) => {
    try {
      await fetch('/api/kot', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: kotId, status: nextStatus }),
      });
      fetchKots();
    } catch (err) {
      console.error('Error updating KOT:', err);
    }
  };

  const handlePrintKot = (kot: any) => {
    setActiveKotForPrint({
      kot: {
        humanKotNumber: kot.humanKotNumber,
        orderNumber: kot.order?.humanOrderId || 'AK-2026-XXXX',
        createdAt: kot.createdAt,
        stationName: kot.kitchenStation?.name || 'ALL STATIONS',
        carNumber: kot.carNumber || kot.order?.carNumber,
        customerName: kot.customerName || kot.order?.customerName,
        orderType: kot.orderType || kot.order?.orderType || 'CAR_SERVICE',
        specialInstructions: kot.specialInstructions || kot.order?.cookingInstructions,
      },
      items: kot.kotItems.map((ki: any) => ({
        productName: ki.productName,
        selectedVariation: ki.selectedVariation,
        quantity: ki.quantity,
        isVeg: ki.isVeg,
        modifierSummary: ki.modifierSummary,
        itemNotes: ki.itemNotes,
      })),
    });
  };

  const filteredKots = kots.filter((k) => {
    if (selectedStation !== 'ALL' && k.kitchenStationId !== selectedStation) return false;
    return k.status !== 'COMPLETED' && k.status !== 'CANCELLED';
  });

  const getElapsedTimeMinutes = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top KDS Header - Sticky */}
      <header className="h-16 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0 z-20 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7A0C16] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center font-bold shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              <span>आपणो खाणो • Kitchen Display (KDS)</span>
              <span className="bg-[#7A0C16] text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                Live Stations
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {filteredKots.length} Active KOT tickets fired from verified payments
            </p>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-700">
            <button
              onClick={() => setSelectedStation('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedStation === 'ALL' ? 'bg-[#7A0C16] text-white shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Stations
            </button>
            <button
              onClick={() => setSelectedStation('station-main-kitchen')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedStation === 'station-main-kitchen' ? 'bg-[#7A0C16] text-white shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Wok &amp; Handi
            </button>
            <button
              onClick={() => setSelectedStation('station-tandoor')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedStation === 'station-tandoor' ? 'bg-[#7A0C16] text-white shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tandoor &amp; Grill
            </button>
            <button
              onClick={() => setSelectedStation('station-snacks')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedStation === 'station-snacks' ? 'bg-[#7A0C16] text-white shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Snacks &amp; Chaat
            </button>
          </div>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Toggle Sound Alerts"
          >
            {audioEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          <Link
            href="/admin/pos"
            className="hidden md:flex px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors"
          >
            Admin POS →
          </Link>
        </div>
      </header>

      {/* Main KDS Grid */}
      <main className="flex-1 p-4 overflow-y-auto max-w-7xl mx-auto w-full">
        {filteredKots.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-slate-900/40 rounded-3xl border border-slate-800">
            <ChefHat className="w-16 h-16 text-slate-700 mb-3" />
            <h3 className="text-lg font-black text-slate-300">All Kitchen Orders Clear!</h3>
            <p className="text-xs text-slate-500 mt-1">Waiting for new verified orders from QR &amp; Car Service...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredKots.map((kot) => {
              const elapsed = getElapsedTimeMinutes(kot.createdAt);
              const isUrgent = elapsed >= 15;
              const isWarning = elapsed >= 8 && elapsed < 15;

              return (
                <div
                  key={kot.id}
                  className={`rounded-3xl border-2 shadow-xl flex flex-col justify-between overflow-hidden transition-all ${
                    isUrgent
                      ? 'bg-red-950/40 border-red-500 shadow-red-950/50'
                      : isWarning
                      ? 'bg-amber-950/40 border-amber-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar: Ticket No, Station, Timer */}
                  <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-base text-white">{kot.humanKotNumber}</span>
                        <span className="bg-[#7A0C16] text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {kot.orderType?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">
                        {kot.kitchenStation?.name || 'MAIN KITCHEN'}
                      </p>
                    </div>

                    {/* Elapsed Prep Timer */}
                    <div
                      className={`flex items-center gap-1 font-mono font-black text-xs px-2.5 py-1 rounded-xl border ${
                        isUrgent
                          ? 'bg-red-600 text-white border-red-400 animate-pulse'
                          : isWarning
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-slate-800 text-emerald-400 border-slate-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsed}m</span>
                    </div>
                  </div>

                  {/* Vehicle / Customer Callout */}
                  {(kot.carNumber || kot.customerName) && (
                    <div className="bg-amber-500/10 border-b border-amber-500/30 px-3.5 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Car className="w-4 h-4 text-amber-400" />
                        <span>CAR NO: <b className="text-white font-mono">{kot.carNumber || 'PARK & DINE'}</b></span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                        {kot.customerName}
                      </span>
                    </div>
                  )}

                  {/* KOT Items List */}
                  <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto max-h-64">
                    {kot.kotItems.map((ki: any) => (
                      <div
                        key={ki.id}
                        className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={ki.isVeg ? 'text-emerald-400' : 'text-red-400'}>
                              {ki.isVeg ? '🟢' : '🔴'}
                            </span>
                            <span className="font-bold text-white text-xs">
                              {ki.productName}
                            </span>
                          </div>

                          {ki.selectedVariation && (
                            <span className="inline-block bg-[#7A0C16] text-[#D4AF37] text-[10px] font-black px-1.5 py-0.2 rounded mt-1">
                              {ki.selectedVariation} Portion
                            </span>
                          )}

                          {ki.itemNotes && (
                            <p className="text-[10px] text-amber-300 italic mt-1">
                              Note: {ki.itemNotes}
                            </p>
                          )}
                        </div>

                        <span className="text-base font-black text-amber-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-xl flex-shrink-0">
                          {ki.quantity}x
                        </span>
                      </div>
                    ))}

                    {kot.specialInstructions && (
                      <div className="bg-amber-950/60 border border-amber-700/60 p-2.5 rounded-2xl text-[11px] text-amber-200">
                        <span className="font-bold uppercase text-[9px] block text-amber-400">Guest Instruction:</span>
                        <span>"{kot.specialInstructions}"</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handlePrintKot(kot)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Print 80mm KOT Ticket"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {kot.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateKotStatus(kot.id, 'READY')}
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Dishes Ready</span>
                      </button>
                    )}

                    {kot.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateKotStatus(kot.id, 'COMPLETED')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Handover to Runner</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Print KOT Modal */}
      {activeKotForPrint && (
        <PrintKot data={activeKotForPrint} onClose={() => setActiveKotForPrint(null)} />
      )}
    </div>
  );
}
