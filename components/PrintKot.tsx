'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PrintKotData } from '@/lib/types';
import { Printer, X } from 'lucide-react';

interface PrintKotProps {
  data: PrintKotData;
  onClose?: () => void;
  autoPrint?: boolean;
}

export default function PrintKot({
  data,
  onClose,
  autoPrint = false,
}: PrintKotProps) {
  const { kot, items } = data;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mounted, autoPrint]);

  if (!mounted) return null;

  return createPortal(
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm !important;
          }
          *, *:before, *:after {
            box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
          }
          html, body {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #thermal-kot-modal,
          #thermal-kot-modal * {
            visibility: visible;
          }
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          #thermal-kot-modal {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            display: block !important;
            z-index: 999999 !important;
          }
          .print-container {
            width: 72mm !important;
            max-width: 72mm !important;
            margin: 0mm auto !important;
            padding: 1mm 1mm 2mm 1mm !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            border: 2px dashed #000000 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
        }
      `}</style>
      <div id="thermal-kot-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
        {/* Top Floating Controls */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print KOT Ticket</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-xl shadow-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 80mm KOT Ticket Container */}
        <div className="print-container bg-white text-black p-4 rounded-xl shadow-2xl max-w-[340px] w-full font-mono text-[12px] leading-tight border-2 border-dashed border-black">
        {/* Header */}
        <div className="text-center pb-2 border-b-2 border-black space-y-1">
          <p className="text-xl font-black tracking-widest uppercase">*** KITCHEN ORDER TICKET ***</p>
          <p className="text-sm font-black">{kot.stationName || 'MAIN KITCHEN'}</p>
          <p className="text-xs font-bold">TICKET NO: {kot.humanKotNumber}</p>
        </div>

        {/* Vehicle & Order Details */}
        <div className="py-2 border-b-2 border-black space-y-1.5 text-xs">
          <div className="flex justify-between font-black">
            <span>ORDER: {kot.orderNumber}</span>
            <span className="bg-black text-white px-1.5 py-0.5 text-[11px] uppercase">
              {kot.orderType?.replace('_', ' ')}
            </span>
          </div>

          {kot.carNumber && (
            <div className="bg-black text-white p-1 text-center font-black text-sm tracking-wider">
              🚗 CAR NO: {kot.carNumber}
            </div>
          )}

          {kot.customerName && (
            <div className="font-bold">
              <span>Customer: {kot.customerName}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-700 flex justify-between">
            <span>Date: {new Date(kot.createdAt).toLocaleDateString('en-IN')}</span>
            <span>Time: {new Date(kot.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Items List (No Prices on KOT) */}
        <div className="py-2 border-b-2 border-black">
          <div className="flex justify-between font-black pb-1 text-xs uppercase border-b border-black">
            <span className="flex-1">Dish Name &amp; Variation</span>
            <span className="w-12 text-right">Qty</span>
          </div>

          <div className="space-y-2 pt-2">
            {items.map((item, idx) => (
              <div key={idx} className="border-b border-dotted border-slate-400 pb-1.5 last:border-0 last:pb-0">
                <div className="flex justify-between items-start font-black text-xs">
                  <span className="flex-1 pr-2">
                    {item.isVeg ? '[VEG]' : '[NON-VEG]'} {item.productName}
                    {item.selectedVariation && ` (${item.selectedVariation})`}
                  </span>
                  <span className="text-base font-black border border-black px-1.5 rounded">
                    {item.quantity}
                  </span>
                </div>
                {item.itemNotes && (
                  <p className="text-[11px] italic text-slate-800 mt-0.5">Note: {item.itemNotes}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special Cooking Instructions */}
        {kot.specialInstructions && (
          <div className="py-2 border-b-2 border-black">
            <p className="font-black text-[11px] uppercase">GUEST SPECIAL INSTRUCTIONS:</p>
            <p className="text-xs font-bold bg-slate-100 p-1 border border-black mt-1">
              "{kot.specialInstructions}"
            </p>
          </div>
        )}

        <div className="text-center pt-2 text-[10px] font-bold">
          *** FIRE TO KITCHEN CHEF ***
        </div>
      </div>
    </div>
    </>,
    document.body
  );
}
