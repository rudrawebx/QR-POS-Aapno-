'use client';

import React from 'react';
import { PrintReceiptData } from '@/lib/types';
import { Printer, X } from 'lucide-react';

interface PrintThermalReceiptProps {
  data: PrintReceiptData;
  onClose?: () => void;
  autoPrint?: boolean;
}

export default function PrintThermalReceipt({
  data,
  onClose,
  autoPrint = false,
}: PrintThermalReceiptProps) {
  const { restaurant, order, items } = data;

  React.useEffect(() => {
    if (autoPrint) {
      setTimeout(() => {
        window.print();
      }, 400);
    }
  }, [autoPrint]);

  const handleManualPrint = () => {
    window.print();
  };

  const handleShareWhatsapp = () => {
    const phone = (order.customerPhone || '').replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const itemsText = (items || [])
      .map(
        (it) =>
          `• ${it.quantity}x ${it.name}${it.selectedVariation ? ` [${it.selectedVariation}]` : ''} - ₹${(it.totalPrice || it.unitPrice * it.quantity).toFixed(2)}`
      )
      .join('\n');

    const message = `👑 *${restaurant.name}* 👑\n📍 ${restaurant.address}\n📞 Tel: ${restaurant.phone}\n${restaurant.gstin ? `GSTIN: ${restaurant.gstin}\n` : ''}${restaurant.fssaiNumber ? `FSSAI: ${restaurant.fssaiNumber}\n` : ''}----------------------------------------\n🧾 *GST TAX INVOICE:* ${order.humanOrderId}\n${order.carNumber ? `🚗 *CAR / TABLE:* ${order.carNumber}\n` : ''}👤 *Customer:* ${order.customerName}\n📅 *Date:* ${new Date(order.createdAt).toLocaleDateString('en-IN')} | *Time:* ${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}\n----------------------------------------\n*ITEMS ORDERED:*\n${itemsText}\n----------------------------------------\n💵 Subtotal: ₹${order.subtotal?.toFixed(2)}\n🏛️ GST Tax (5%): ₹${((order.cgstAmount || 0) + (order.sgstAmount || 0)).toFixed(2)}\n${order.discountAmount ? `🎉 Discount: -₹${order.discountAmount.toFixed(2)}\n` : ''}💰 *GRAND TOTAL: ₹${order.grandTotal?.toFixed(2)}*\n✅ *Payment:* ${order.paymentMethod} (PAID)\n----------------------------------------\n🙏 _${restaurant.defaultReceiptFooter || 'Padharo Mhare Desh! Thank you for visiting Aapno Khaano.'}_`;

    const whatsappUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm 0mm 4mm 0mm !important;
          }
          html, body {
            width: 100% !important;
            margin: 0mm !important;
            padding: 0mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, header, nav, aside, footer {
            display: none !important;
          }
          #thermal-receipt-modal {
            position: static !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            padding: 0mm !important;
            margin: 0mm auto !important;
            overflow: visible !important;
            width: 100% !important;
            max-width: 80mm !important;
            display: block !important;
          }
          .print-container {
            width: 72mm !important;
            max-width: 72mm !important;
            margin: 0mm auto !important;
            padding: 2mm 1mm 4mm 1mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
        }
      `}</style>
      <div id="thermal-receipt-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
        {/* Top Floating Print & Close Controls (Hidden in Print) */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print">
        <button
          onClick={handleShareWhatsapp}
          className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer transition-transform active:scale-95"
        >
          <span>📱 WhatsApp</span>
        </button>
        <button
          onClick={handleManualPrint}
          className="bg-[#7A0C16] hover:bg-[#600810] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer border border-[#D4AF37]"
        >
          <Printer className="w-4 h-4 text-[#D4AF37]" />
          <span>Print 80mm Bill</span>
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

      {/* 80mm Thermal Receipt Layout */}
      <div className="print-container bg-white text-black p-4 rounded-xl shadow-2xl max-w-[340px] w-full font-mono text-[11px] leading-tight border border-slate-300">
        {/* Header */}
        <div className="text-center pb-2 border-b border-dashed border-black space-y-0.5">
          <p className="text-base font-black tracking-wide uppercase">{restaurant.name}</p>
          <p className="text-[10px]">{restaurant.address}</p>
          <p className="text-[10px]">Tel: {restaurant.phone}</p>
          {restaurant.gstin && <p className="text-[10px]">GSTIN: {restaurant.gstin}</p>}
          {restaurant.fssaiNumber && <p className="text-[10px]">FSSAI: {restaurant.fssaiNumber}</p>}
        </div>

        {/* QSR Order Meta Info */}
        <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
          <div className="flex justify-between font-black text-xs">
            <span>ORDER: {order.humanOrderId}</span>
            <span className="uppercase">{order.orderType?.replace('_', ' ')}</span>
          </div>

          {order.carNumber && (
            <div className="bg-slate-100 p-1 border border-black font-black text-center text-xs tracking-wider">
              🚗 CAR NO: {order.carNumber}
            </div>
          )}

          <div className="flex justify-between">
            <span>Customer: {order.customerName}</span>
            <span>Mob: {order.customerPhone}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
            <span>Time: {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Item Table */}
        <div className="py-2 border-b border-dashed border-black">
          <div className="flex justify-between font-bold pb-1 text-[10px] uppercase border-b border-black">
            <span className="flex-1">Item [Var]</span>
            <span className="w-8 text-center">Qty</span>
            <span className="w-12 text-right">Rate</span>
            <span className="w-14 text-right">Total</span>
          </div>

          <div className="space-y-1.5 pt-1.5">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-[10px]">
                <div className="flex-1 pr-1">
                  <p className="font-bold">
                    {item.isVeg ? '🟢' : '🔴'} {item.name}
                    {item.selectedVariation && ` (${item.selectedVariation})`}
                  </p>
                </div>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <span className="w-12 text-right">{item.unitPrice.toFixed(2)}</span>
                <span className="w-14 text-right font-bold">{item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Totals */}
        <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{restaurant.currencySymbol}{order.subtotal.toFixed(2)}</span>
          </div>

          {order.discountAmount ? (
            <div className="flex justify-between text-emerald-800 font-bold">
              <span>Discount:</span>
              <span>-{restaurant.currencySymbol}{order.discountAmount.toFixed(2)}</span>
            </div>
          ) : null}

          <div className="flex justify-between">
            <span>CGST (2.5%):</span>
            <span>{restaurant.currencySymbol}{order.cgstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>SGST (2.5%):</span>
            <span>{restaurant.currencySymbol}{order.sgstAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
            <span>GRAND TOTAL:</span>
            <span>{restaurant.currencySymbol}{order.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment & Audit Info */}
        <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
          <div className="flex justify-between font-bold">
            <span>TENDER METHOD:</span>
            <span className="uppercase">{order.paymentMethod} (PAID ✓)</span>
          </div>
          {order.transactionId && (
            <p className="truncate text-[9px]">Txn ID: {order.transactionId}</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-2 space-y-1 text-[9px]">
          <p className="font-bold">{restaurant.defaultReceiptFooter || 'Thank you for visiting Aapno Khaano!'}</p>
          <p className="text-slate-500">*** Software Powered by Aapno Khaano QSR ***</p>
        </div>
      </div>
    </div>
  </>
);
}
