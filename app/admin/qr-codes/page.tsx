'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import AdminLayout from '@/components/AdminLayout';
import { QrCode, Download, Printer, ExternalLink, Sparkles, Copy, Check } from 'lucide-react';

export default function QrStudioPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadQrs() {
      try {
        const [resTables, resRest] = await Promise.all([
          fetch('/api/tables'),
          fetch('/api/restaurants/aapno-khano'),
        ]);

        const tablesData = await resTables.json();
        const restData = await resRest.json();

        if (restData.restaurant) setRestaurant(restData.restaurant);

        if (tablesData.tables) {
          setTables(tablesData.tables);
          const urls: Record<string, string> = {};

          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

          for (const t of tablesData.tables) {
            const tableUrl = `${baseUrl}/r/${restData.restaurant?.slug || 'aapno-khano'}/table-${t.tableNumber}`;
            const qrData = await QRCode.toDataURL(tableUrl, {
              width: 360,
              margin: 1,
              color: { dark: '#0f172a', light: '#ffffff' },
            });
            urls[t.id] = qrData;
          }
          setQrImages(urls);
        }
      } catch (err) {
        console.error('Error generating table QRs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQrs();
  }, []);

  const handleCopyLink = (tableNum: string, tableId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const tableUrl = `${baseUrl}/r/${restaurant?.slug || 'aapno-khano'}/table-${tableNum}`;
    navigator.clipboard.writeText(tableUrl);
    setCopiedId(tableId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadPng = (tableNum: string, qrDataUrl: string) => {
    const link = document.createElement('a');
    link.download = `QR_Table_${tableNum}_${restaurant?.name || 'AapnoKhano'}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrintAllStands = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs no-print">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-orange-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">QR Code Generator Studio</h2>
              <p className="text-xs text-slate-500">
                High-resolution branded table QR stands &amp; instant digital ordering links
              </p>
            </div>
          </div>

          <button
            onClick={handlePrintAllStands}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print All Table Standees</span>
          </button>
        </div>

        {/* QR Stands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => {
            const qrImg = qrImages[table.id];

            return (
              <div
                key={table.id}
                className="bg-white rounded-3xl border-2 border-slate-200 shadow-md p-5 flex flex-col items-center text-center space-y-3 relative overflow-hidden group hover:border-orange-500 transition-all"
              >
                {/* Stand Header Branding */}
                <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-sm border border-slate-200 flex items-center justify-center">
                  <img
                    src={restaurant?.logoUrl || '/images/aapno-khano-logo.png'}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    {restaurant?.name || 'आपणो खाणो'}
                  </h3>
                  <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-black mt-1 shadow-xs">
                    TABLE {table.tableNumber}
                  </div>
                </div>

                {/* QR Display */}
                <div className="p-3 bg-white border-2 border-dashed border-orange-400 rounded-2xl shadow-inner">
                  {qrImg ? (
                    <img src={qrImg} alt={`Table ${table.tableNumber} QR`} className="w-44 h-44 object-contain" />
                  ) : (
                    <div className="w-44 h-44 bg-slate-100 animate-pulse rounded-xl" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                    Scan to Order &amp; Pay
                  </p>
                  <p className="text-[10px] text-slate-400">No App Installation Required</p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 w-full flex items-center justify-center gap-2 no-print">
                  <button
                    onClick={() => handleDownloadPng(table.tableNumber, qrImg)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs flex items-center gap-1 font-bold transition-colors cursor-pointer"
                    title="Download High-Res PNG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(table.tableNumber, table.id)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs flex items-center gap-1 font-bold transition-colors cursor-pointer"
                    title="Copy Menu URL"
                  >
                    {copiedId === table.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === table.id ? 'Copied' : 'Link'}</span>
                  </button>

                  <a
                    href={`/r/aapno-khano/table-${table.tableNumber}`}
                    target="_blank"
                    className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-xs flex items-center gap-1 font-bold transition-colors"
                    title="Test Open in Browser"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
