'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PrintDualThermal from '@/components/PrintDualThermal';
import {
  Settings,
  Store,
  Clock,
  Printer,
  CreditCard,
  Check,
  Sparkles,
  ShieldCheck,
  Save,
  Smartphone,
  QrCode,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Power,
  Globe,
  Share2,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Profile State
  const [name, setName] = useState('आपणो खाणो (Aapno Khaano)');
  const [phone, setPhone] = useState('+91 99962 13962');
  const [email, setEmail] = useState('contact@aapnokhano.com');
  const [address, setAddress] = useState('Main Highway Plaza, Car-Service & QSR Drive-In');
  const [gstin, setGstin] = useState('08AABCU9603R1ZM');
  const [fssai, setFssai] = useState('12224026000189');

  // Store Controls
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [openingHoursText, setOpeningHoursText] = useState('11:00 AM - 11:30 PM');
  const [closureMessage, setClosureMessage] = useState('We are currently closed for orders. Please visit during regular hours.');
  const [supportWhatsapp, setSupportWhatsapp] = useState('+919996213962');

  // Payment Gateway Configuration State
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_demo123456');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('demo_secret_key_restaurant');
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('demo_webhook_secret_restaurant');
  const [paymentMode, setPaymentMode] = useState('TEST');
  const [upiId, setUpiId] = useState('9996213962m@pnb');
  const [merchantName, setMerchantName] = useState('AAPNO KHANO');

  // Printer Configuration State
  const [printerIpBill, setPrinterIpBill] = useState('192.168.1.200:9100');
  const [printerIpKot, setPrinterIpKot] = useState('192.168.1.201:9100');
  const [autoPrintBill, setAutoPrintBill] = useState(true);
  const [autoPrintKot, setAutoPrintKot] = useState(true);
  const [receiptFooter, setReceiptFooter] = useState('Padharo Mhare Desh! Thank you for visiting Aapno Khaano.');

  // Test Print modal state
  const [testPrintData, setTestPrintData] = useState<any | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          setName(data.restaurant.name);
          setPhone(data.restaurant.phone);
          setEmail(data.restaurant.email || '');
          setAddress(data.restaurant.address || '');
          setGstin(data.restaurant.gstin || '08AABCU9603R1ZM');
          setFssai(data.restaurant.fssaiNumber || '12224026000189');

          const s = data.restaurant.settings;
          if (s) {
            setIsRestaurantOpen(s.isRestaurantOpen ?? true);
            setOpeningHoursText(s.openingHoursText || '11:00 AM - 11:30 PM');
            setClosureMessage(s.closureMessage || 'We are currently closed for orders.');
            setSupportWhatsapp(s.supportWhatsappNumber || '+919996213962');
            setRazorpayKeyId(s.razorpayKeyId || 'rzp_test_demo123456');
            setRazorpayKeySecret(s.razorpayKeySecret || 'demo_secret_key_restaurant');
            setRazorpayWebhookSecret(s.razorpayWebhookSecret || 'demo_webhook_secret_restaurant');
            setUpiId(s.upiId || '9996213962m@pnb');
            setMerchantName(s.upiMerchantName || 'AAPNO KHANO');
            setPrinterIpBill(s.printerIpBill || '192.168.1.200:9100');
            setPrinterIpKot(s.printerIpKot || '192.168.1.201:9100');
            setAutoPrintBill(s.autoPrintBill ?? true);
            setAutoPrintKot(s.autoPrintKot ?? true);
            setReceiptFooter(s.defaultReceiptFooter || 'Padharo Mhare Desh! Thank you for visiting Aapno Khaano.');
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          address,
          gstin,
          fssaiNumber: fssai,
          isRestaurantOpen,
          openingHoursText,
          closureMessage,
          supportWhatsappNumber: supportWhatsapp,
          upiId,
          upiMerchantName: merchantName,
          razorpayKeyId,
          razorpayKeySecret,
          razorpayWebhookSecret,
          printerIpBill,
          printerIpKot,
          autoPrintBill,
          autoPrintKot,
          defaultReceiptFooter: receiptFooter,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Settings save error:', err);
    }
  };

  const handleTestPrint = (docType: 'BILL' | 'KOT' | 'BOTH') => {
    const sampleBill = {
      restaurant: {
        name: 'आपणो खाणो (Aapno Khaano)',
        address: 'Main Highway Plaza, QSR Drive-In',
        city: 'Jaipur',
        phone: '+91 99962 13962',
        gstin: gstin || '08AABCU9603R1ZM',
        fssaiNumber: fssai || '12224026000189',
        currencySymbol: '₹',
        defaultReceiptFooter: receiptFooter,
      },
      order: {
        humanOrderId: 'AK-2026-TEST',
        createdAt: new Date(),
        customerName: 'Vikramaditya Singh',
        customerPhone: '9996213962',
        carNumber: 'RJ 14 CA 9999',
        orderType: 'CAR_SERVICE',
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        transactionId: 'UPI9996213962_TEST',
        subtotal: 500,
        cgstAmount: 12.5,
        sgstAmount: 12.5,
        grandTotal: 525,
      },
      items: [
        { name: 'Aapno Special Chicken Handi', selectedVariation: 'Full', quantity: 1, unitPrice: 500, totalPrice: 500, isVeg: false },
      ],
    };

    const sampleKot = {
      kot: {
        humanKotNumber: 'KOT-TEST-80MM',
        orderNumber: 'AK-2026-TEST',
        createdAt: new Date(),
        stationName: 'TANDOOR & HANDI STATION',
        carNumber: 'RJ 14 CA 9999',
        customerName: 'Vikramaditya Singh',
        orderType: 'CAR_SERVICE',
        specialInstructions: '80mm dual thermal alignment verification test',
      },
      items: [
        { productName: 'Aapno Special Chicken Handi', selectedVariation: 'Full', quantity: 1, isVeg: false, itemNotes: 'Deliver hot to Bay 4' },
      ],
    };

    setTestPrintData({
      billData: docType === 'KOT' ? null : sampleBill,
      kotData: docType === 'BILL' ? null : sampleKot,
      mode: docType === 'BILL' ? 'PRINT_BILL' : docType === 'KOT' ? 'PRINT_KOT' : 'PRINT_BOTH',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#FEFBF5] pt-0 pb-1">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#AA1B2A]/10 border border-[#AA1B2A]/20 flex items-center justify-center text-[#AA1B2A]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-sm text-[#331E17]">Restaurant Settings &amp; Payment Configuration</h1>
                <p className="text-xs text-[#745E55]">
                  Multi-tenant Razorpay gateway, UPI standee VPA, 80mm dual printing &amp; operational hours
                </p>
              </div>
            </div>

            {savedSuccess && (
              <span className="text-emerald-900 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-xs animate-in zoom-in-95">
                <Check className="w-4 h-4 text-emerald-700" /> Settings Saved!
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Card 1: Operating Status & Timings */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D6] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-[#AA1B2A] uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#AA1B2A]" /> Operating Hours &amp; Ordering Availability
              </h2>
              <button
                type="button"
                onClick={() => setIsRestaurantOpen(!isRestaurantOpen)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                  isRestaurantOpen
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isRestaurantOpen ? 'Ordering Open' : 'Ordering Paused'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Operating Hours Display Text</label>
                <input
                  type="text"
                  value={openingHoursText}
                  onChange={(e) => setOpeningHoursText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Support WhatsApp Number</label>
                <input
                  type="text"
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Store Closed Message (Shown when paused)</label>
                <input
                  type="text"
                  value={closureMessage}
                  onChange={(e) => setClosureMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Card 2: UPI Apps & PNB QR Standee Configuration */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D6] shadow-xs space-y-4">
            <h2 className="text-xs font-black text-[#AA1B2A] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Smartphone className="w-4 h-4 text-[#AA1B2A]" /> Official PNB UPI Standee &amp; VPA Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-center">
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Merchant UPI ID (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-[#AA1B2A] text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Merchant Registered Business Name</label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  />
                </div>
              </div>

              {/* Clean QR Standee Preview */}
              <div className="flex flex-col items-center justify-center p-3 bg-[#FEFBF5] rounded-2xl border border-[#E8E1D6]">
                <img
                  src="/images/pnb-upi-qr.png"
                  alt="Aapno Khaano UPI QR"
                  className="w-32 h-32 object-contain rounded-xl border border-slate-200 shadow-2xs"
                />
                <span className="text-[10px] font-black text-[#AA1B2A] mt-1.5 font-mono">9996213962m@pnb</span>
              </div>
            </div>
          </div>

          {/* Card 3: Multi-Tenant Razorpay Gateway */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D6] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-[#AA1B2A] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#AA1B2A]" /> Razorpay Payment Gateway &amp; Webhook Keys
              </h2>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Razorpay Key Secret</label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showSecret ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Card 4: 80mm ESC/POS Thermal Printers & Test Printing */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D6] shadow-xs space-y-4">
            <h2 className="text-xs font-black text-[#AA1B2A] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Printer className="w-4 h-4 text-[#AA1B2A]" /> 80mm Dual Thermal Printer Hardware &amp; Formats
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Billing Counter 80mm Printer IP / Port</label>
                <input
                  type="text"
                  placeholder="192.168.1.200:9100"
                  value={printerIpBill}
                  onChange={(e) => setPrinterIpBill(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kitchen Station 80mm KOT Printer IP / Port</label>
                <input
                  type="text"
                  placeholder="192.168.1.201:9100"
                  value={printerIpKot}
                  onChange={(e) => setPrinterIpKot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">GST Tax Invoice Footer Note</label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Test Print Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleTestPrint('BILL')}
                className="px-4 py-2 rounded-2xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-[#331E17] font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[#E8E1D6]"
              >
                <Printer className="w-3.5 h-3.5 text-[#AA1B2A]" />
                <span>Test 80mm GST Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestPrint('KOT')}
                className="px-4 py-2 rounded-2xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-[#331E17] font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[#E8E1D6]"
              >
                <Printer className="w-3.5 h-3.5 text-red-700" />
                <span>Test 80mm Kitchen KOT</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestPrint('BOTH')}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-[#FEFBF5] font-black text-xs flex items-center gap-1.5 cursor-pointer border border-[#E09D3D] shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-[#E09D3D]" />
                <span>Simultaneous Dual Print</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white font-black px-7 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl border border-[#E09D3D] transition-transform active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#E09D3D]" />
              <span>Save Restaurant Settings &amp; Gateway Keys</span>
            </button>
          </div>
        </form>
      </div>

      {/* Test Print Preview Modal */}
      {testPrintData && (
        <PrintDualThermal
          billData={testPrintData.billData}
          kotData={testPrintData.kotData}
          mode={testPrintData.mode}
          onClose={() => setTestPrintData(null)}
          autoPrint={true}
        />
      )}
    </AdminLayout>
  );
}
