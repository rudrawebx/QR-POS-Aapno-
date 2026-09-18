'use client';

import React, { useState, useEffect } from 'react';
import { PrintReceiptData, PrintKotData } from '@/lib/types';
import { Printer, X, Scissors, PlusCircle, FileText, ChefHat } from 'lucide-react';

interface PrintDualThermalProps {
  billData?: PrintReceiptData | null;
  kotData?: PrintKotData | null;
  mode?: 'PRINT_BOTH' | 'PRINT_BILL' | 'PRINT_KOT';
  onClose?: () => void;
  autoPrint?: boolean;
}

export default function PrintDualThermal({
  billData,
  kotData,
  mode: initialMode = 'PRINT_BOTH',
  onClose,
  autoPrint = true,
}: PrintDualThermalProps) {
  const [activeMode, setActiveMode] = useState<'PRINT_BOTH' | 'PRINT_BILL' | 'PRINT_KOT'>(initialMode);

  
  useEffect(() => {
    // Trigger auto-print with small render delay to allow 2X logo & DOM to paint
    const isPaidOrder = billData?.order?.paymentStatus === 'PAID' || !billData;
    if (autoPrint && isPaidOrder) {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.warn("Print error:", e);
        }
        fetch("/api/print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: activeMode,
            orderId: billData?.order?.humanOrderId,
            notes: `Auto-printed via ${activeMode}`,
          }),
        }).catch(console.error);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [autoPrint, activeMode, billData]);


  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePrint = (printMode?: 'PRINT_BOTH' | 'PRINT_BILL' | 'PRINT_KOT') => {
    if (printMode) setActiveMode(printMode);
    setTimeout(() => window.print(), 80);
  };

  const handleShareWhatsapp = () => {
    if (!billData) return;
    const phone = (billData.order.customerPhone || "").replace(/\D/g, "");
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const itemsText = (billData.items || [])
      .map(
        (it) =>
          `• ${it.quantity}x ${it.name}${it.selectedVariation ? ` [${it.selectedVariation}]` : ""} - ₹${(it.totalPrice || it.unitPrice * it.quantity).toFixed(2)}`
      )
      .join("\n");

    const message = `👑 *${billData.restaurant.name}* 👑\n📍 ${billData.restaurant.address}\n📞 Tel: ${billData.restaurant.phone}\n${billData.restaurant.gstin ? `GSTIN: ${billData.restaurant.gstin}\n` : ""}${billData.restaurant.fssaiNumber ? `FSSAI: ${billData.restaurant.fssaiNumber}\n` : ""}----------------------------------------\n🧾 *GST TAX INVOICE:* ${billData.order.humanOrderId}\n${billData.order.carNumber ? `🚗 *CAR / TABLE:* ${billData.order.carNumber}\n` : ""}👤 *Customer:* ${billData.order.customerName}\n📅 *Date:* ${new Date(billData.order.createdAt).toLocaleDateString("en-IN")} | *Time:* ${new Date(billData.order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}\n----------------------------------------\n*ITEMS ORDERED:*\n${itemsText}\n----------------------------------------\n💵 Subtotal: ₹${billData.order.subtotal?.toFixed(2)}\n🏛️ GST Tax (5%): ₹${((billData.order.cgstAmount || 0) + (billData.order.sgstAmount || 0)).toFixed(2)}\n${billData.order.discountAmount ? `🎉 Discount: -₹${billData.order.discountAmount.toFixed(2)}\n` : ""}💰 *GRAND TOTAL: ₹${billData.order.grandTotal?.toFixed(2)}*\n✅ *Payment:* ${billData.order.paymentMethod} (PAID)\n----------------------------------------\n🙏 _${billData.restaurant.defaultReceiptFooter || "Padharo Mhare Desh! Thank you for visiting Aapno Khaano."}_`;

    const whatsappUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Universal 80mm ESC/POS CSS & Crisp PDF Export - 100% Guaranteed Non-Blank Print & Clean Alignment */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm 0mm 4mm 0mm !important;
          }
          *, *:before, *:after {
            box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
          }
          html, body {
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0mm auto !important;
            padding: 0mm !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide all surrounding DOM, modals, fixed overlays and backgrounds */
          .no-print, header, nav, aside, footer {
            display: none !important;
          }
          #thermal-print-overlay {
            position: static !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
            padding: 0mm !important;
            margin: 0mm auto !important;
            overflow: visible !important;
            width: 100% !important;
            max-width: 80mm !important;
            display: block !important;
          }
          #thermal-print-root {
            position: static !important;
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0mm auto !important;
            padding: 0mm !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            display: block !important;
          }
          .thermal-doc {
            width: 72mm !important;
            max-width: 72mm !important;
            margin: 0mm auto !important;
            padding: 2mm 1mm 4mm 1mm !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
          /* PHYSICAL HARDWARE AUTO-CUT TRIGGER: Sends Page Break to printer driver to fire cutter knife between Bill and KOT */
          .thermal-bill-page {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
          .thermal-kot-page {
            page-break-before: always !important;
            break-before: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
          /* Hide the visual on-screen tear banner during physical print so printer cuts cleanly without printing tear text */
          .thermal-cut-line {
            display: none !important;
          }
          .thermal-feed-spacer {
            height: 10mm !important;
            display: block !important;
          }
        }
      `}</style>

      {/* Screen Overlay (Hidden in print via #thermal-print-overlay) */}
      <div
        id="thermal-print-overlay"
        className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      >
        {/* Top Floating Action Bar (Hidden during print) */}
        <div className="sticky top-2 z-50 w-full max-w-xl bg-slate-900 border border-slate-700 p-2.5 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-2 mb-4 no-print">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Print Both Button */}
            <button
              type="button"
              onClick={() => handlePrint("PRINT_BOTH")}
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 ${
                activeMode === "PRINT_BOTH"
                  ? "bg-[#AA1B2A] text-white border border-[#E09D3D]"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>🖨️ Print (Bill + KOT)</span>
            </button>

            {/* Print Bill Only */}
            <button
              type="button"
              onClick={() => handlePrint("PRINT_BILL")}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                activeMode === "PRINT_BILL"
                  ? "bg-[#AA1B2A] text-white border border-[#E09D3D]"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bill Only</span>
            </button>

            {/* Print KOT Only */}
            <button
              type="button"
              onClick={() => handlePrint("PRINT_KOT")}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                activeMode === "PRINT_KOT"
                  ? "bg-[#AA1B2A] text-white border border-[#E09D3D]"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>KOT Only</span>
            </button>

            {/* WhatsApp Share Button */}
            {billData && (
              <button
                type="button"
                onClick={handleShareWhatsapp}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer transition-transform active:scale-95"
                title="Share Tax Invoice on WhatsApp"
              >
                <span>📱 WhatsApp</span>
              </button>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer transition-transform active:scale-95 border border-emerald-400"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white" />
              <span>Next Bill</span>
            </button>
          )}
        </div>

        {/* Printable Area */}
        <div id="thermal-print-root" className="print-container thermal-print-wrapper space-y-4 pb-12 w-full max-w-[330px] mx-auto">
          {/* Document 1: 80mm Customer GST Tax Bill */}
          {(activeMode === "PRINT_BOTH" || activeMode === "PRINT_BILL") && billData && (
            <div
              id="thermal-bill-doc"
              className={`thermal-doc bg-white text-black p-4 rounded-xl shadow-2xl w-full font-mono text-[11px] leading-tight border border-slate-300 mx-auto ${
                activeMode === "PRINT_BOTH" ? "thermal-bill-page" : ""
              }`}
            >
              {/* Header */}
              <div className="text-center pb-2 border-b border-dashed border-black space-y-0.5">
                <div className="w-14 h-14 mx-auto mb-1 flex items-center justify-center">
                  <img
                    src="/images/aapno-khano-logo.png"
                    alt="Aapno Khaano"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm font-black uppercase tracking-wider">
                  {billData.restaurant.name}
                </p>
                <p className="text-[10px]">{billData.restaurant.address}, {billData.restaurant.city}</p>
                <p className="text-[10px]">Tel: {billData.restaurant.phone}</p>
                {billData.restaurant.gstin && <p className="text-[10px] font-bold">GSTIN: {billData.restaurant.gstin}</p>}
                {billData.restaurant.fssaiNumber && <p className="text-[10px]">FSSAI: {billData.restaurant.fssaiNumber}</p>}
                <p className="text-[10px] font-black uppercase tracking-widest pt-1 border-t border-dotted border-black">*** GST TAX INVOICE ***</p>
              </div>

              {/* Order Meta */}
              <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
                <div className="flex justify-between font-black text-xs">
                  <span>ORDER: {billData.order.humanOrderId}</span>
                  <span className="uppercase">{billData.order.orderType?.replace("_", " ")}</span>
                </div>

                {billData.order.carNumber && (
                  <div className="bg-white p-1 border-2 border-black font-black text-center text-xs tracking-wider uppercase">
                    🚗 CAR NO: {billData.order.carNumber}
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Customer: {billData.order.customerName}</span>
                  <span>Mob: {billData.order.customerPhone}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Date: {new Date(billData.order.createdAt).toLocaleDateString("en-IN")}</span>
                  <span>Time: {new Date(billData.order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2 border-b border-dashed border-black">
                <div className="flex justify-between font-bold pb-1 text-[10px] uppercase border-b border-black">
                  <span className="flex-1">Item [Var]</span>
                  <span className="w-8 text-center">Qty</span>
                  <span className="w-12 text-right">Rate</span>
                  <span className="w-14 text-right">Total</span>
                </div>

                <div className="space-y-1.5 pt-1.5">
                  {(billData.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[10px]">
                      <div className="flex-1 pr-1">
                        <p className="font-bold">
                          {item.isVeg ? "🟢" : "🔴"} {item.name}
                          {item.selectedVariation && ` (${item.selectedVariation})`}
                        </p>
                      </div>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <span className="w-12 text-right">{Number(item.unitPrice || 0).toFixed(2)}</span>
                      <span className="w-14 text-right font-bold">{Number(item.totalPrice || (item.unitPrice * item.quantity) || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Taxes */}
              <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{Number(billData.order.subtotal || 0).toFixed(2)}</span>
                </div>

                {billData.order.discountAmount ? (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Discount:</span>
                    <span>-₹{Number(billData.order.discountAmount || 0).toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <span>CGST (2.5%):</span>
                  <span>₹{Number(billData.order.cgstAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%):</span>
                  <span>₹{Number(billData.order.sgstAmount || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
                  <span>GRAND TOTAL:</span>
                  <span>₹{Number(billData.order.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>TENDER METHOD:</span>
                  <span className="uppercase">{billData.order.paymentMethod} (PAID ✓)</span>
                </div>
                <p className="text-[9px] text-slate-600">UPI: {billData.restaurant.upiId || "9996213962@hdfc"}</p>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 space-y-0.5 text-[9px]">
                <p className="font-bold">*** धन्यवाद! फिर पधारें ***</p>
                <p>{billData.restaurant.defaultReceiptFooter || "Padharo Mhare Desh! Thank you for visiting Aapno Khaano."}</p>
              </div>
              <div className="thermal-feed-spacer h-3" />
            </div>
          )}

          {/* TVS TEAR / CUT SEPARATOR */}
          {activeMode === "PRINT_BOTH" && billData && kotData && (
            <div className="thermal-cut-line my-3 text-center text-black font-mono text-[11px] font-black w-full mx-auto bg-slate-50 p-2 border-y-2 border-dashed border-black">
              <p className="tracking-widest uppercase text-[10px] py-0.5">✂️ - - - - - - - - - - - - - - - - - ✂️</p>
              <p className="text-[11px] font-black tracking-wider uppercase">✂️ TEAR / CUT HERE (यहाँ से अलग करें) ✂️</p>
              <p className="text-[9px] font-bold text-slate-800">⬆️ [ CUSTOMER BILL ] • ⬇️ [ KITCHEN KOT ]</p>
              <p className="tracking-widest uppercase text-[10px] py-0.5">✂️ - - - - - - - - - - - - - - - - - ✂️</p>
              <div className="thermal-feed-spacer h-3" />
            </div>
          )}

          {/* Document 2: 80mm Kitchen Order Ticket (KOT) */}
          {(activeMode === "PRINT_BOTH" || activeMode === "PRINT_KOT") && kotData && (
            <div
              id="thermal-kot-doc"
              className={`thermal-doc bg-white text-black p-4 rounded-xl shadow-2xl w-full font-mono text-[11px] leading-tight border border-slate-300 mx-auto ${
                activeMode === "PRINT_BOTH" ? "thermal-kot-page" : ""
              }`}
            >
              {/* Header */}
              <div className="text-center pb-2 border-b-2 border-black space-y-0.5">
                <p className="text-base font-black tracking-wider uppercase">*** KITCHEN ORDER TICKET ***</p>
                <div className="border-2 border-black bg-white text-black px-3 py-0.5 rounded-sm font-black text-xs inline-block">
                  {kotData.kot.humanKotNumber}
                </div>
                <p className="text-[10px] font-bold">Order Ref: {kotData.kot.orderNumber}</p>
              </div>

              {/* Vehicle & Station */}
              <div className="py-2 border-b-2 border-black text-xs space-y-1">
                {kotData.kot.carNumber ? (
                  <div className="border-2 border-black bg-white text-black p-1 text-center font-black text-sm tracking-widest uppercase rounded-sm">
                    🚗 CAR NO: {kotData.kot.carNumber}
                  </div>
                ) : (
                  <div className="border-2 border-black bg-white text-black p-1 text-center font-bold uppercase rounded-sm">
                    TYPE: {kotData.kot.orderType?.replace("_", " ")}
                  </div>
                )}

                <div className="flex justify-between text-[10px] pt-1">
                  <span>Guest: <b>{kotData.kot.customerName}</b></span>
                  <span>Time: <b>{new Date(kotData.kot.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</b></span>
                </div>
              </div>

              {/* KOT Items */}
              <div className="py-2 border-b-2 border-black">
                <div className="flex justify-between font-bold pb-1 text-[10px] uppercase border-b border-black">
                  <span className="flex-1">Dish Description</span>
                  <span className="w-12 text-right">QTY</span>
                </div>

                <div className="space-y-2 pt-2">
                  {(kotData.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start border-b border-dotted border-slate-300 pb-1">
                      <div className="flex-1 pr-2">
                        <p className="font-black text-xs">
                          {item.isVeg ? "🟢" : "🔴"} {item.productName}
                        </p>
                        {item.selectedVariation && (
                          <p className="text-[10px] font-bold text-slate-800 bg-slate-100 inline-block px-1 rounded">
                            Portion: {item.selectedVariation}
                          </p>
                        )}
                        {item.itemNotes && (
                          <p className="text-[10px] text-red-600 font-bold italic">
                            Note: {item.itemNotes}
                          </p>
                        )}
                      </div>
                      <span className="w-12 text-right font-black text-base bg-slate-200 px-1 rounded">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {kotData.kot.specialInstructions && (
                <div className="py-2 border-b-2 border-black bg-amber-50 p-1.5 my-1">
                  <p className="text-[9px] font-bold uppercase text-amber-900">⚡ Chef Note:</p>
                  <p className="font-black text-xs text-amber-950">{kotData.kot.specialInstructions}</p>
                </div>
              )}

              <div className="text-center pt-2 text-[9px] font-bold">
                <p>*** RUSH ORDER • PREPARE FRESH ***</p>
              </div>
              <div className="thermal-feed-spacer h-8" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
