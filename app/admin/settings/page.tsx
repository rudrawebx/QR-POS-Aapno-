'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PrintDualThermal from '@/components/PrintDualThermal';
import {
  Settings,
  Store,
  Printer,
  CreditCard,
  Check,
  ShieldCheck,
  Save,
  QrCode,
  KeyRound,
  AlertCircle,
  Power,
  Upload,
  Trash2,
  History,
  MonitorSmartphone,
  LogOut,
  FileText,
} from 'lucide-react';

type SettingsTab = 'PROFILE' | 'TAX' | 'PAYMENTS' | 'PRINTERS' | 'SECURITY' | 'LOGS';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE');
  const [restaurant, setRestaurant] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Profile State (Zero hardcoded tenant defaults)
  const [qsrNumber, setQsrNumber] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Business & Tax (GST & FSSAI - Optional)
  const [gstRegistered, setGstRegistered] = useState(false);
  const [gstin, setGstin] = useState('');
  const [gstBusinessName, setGstBusinessName] = useState('');
  const [fssaiRegistered, setFssaiRegistered] = useState(false);
  const [fssai, setFssai] = useState('');
  const [fssaiBusinessName, setFssaiBusinessName] = useState('');

  // Store Controls
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [openingHoursText, setOpeningHoursText] = useState('11:00 AM - 11:30 PM');
  const [closureMessage, setClosureMessage] = useState('We are currently closed for orders.');
  const [supportWhatsapp, setSupportWhatsapp] = useState('');

  // Payment Gateway & UPI State (Strictly Tenant-Isolated)
  const [upiQrEnabled, setUpiQrEnabled] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [upiQrImageUrl, setUpiQrImageUrl] = useState('');

  // Printer Configuration State
  const [printerIpBill, setPrinterIpBill] = useState('');
  const [printerIpKot, setPrinterIpKot] = useState('');
  const [autoPrintBill, setAutoPrintBill] = useState(true);
  const [autoPrintKot, setAutoPrintKot] = useState(true);
  const [receiptFooter, setReceiptFooter] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  // Test Print modal state
  const [testPrintData, setTestPrintData] = useState<any | null>(null);

  const loadAllData = async () => {
    try {
      const [settingsRes, sessRes] = await Promise.all([
        fetch('/api/settings?includeLogs=true'),
        fetch('/api/auth/sessions'),
      ]);
      const data = await settingsRes.json();
      if (data.restaurant) {
        const r = data.restaurant;
        setRestaurant(r);
        setQsrNumber(r.qsrNumber || (r.slug === 'aapno-khano' ? 'QSR01' : r.slug === 'mr-bagri' ? 'QSR02' : ''));
        setName(r.name || '');
        setDisplayName(r.displayName || r.name || '');
        setOwnerName(r.ownerName || '');
        setDescription(r.description || '');
        setPhone(r.phone || '');
        setEmail(r.email || '');
        setAddress(r.address || '');
        setCity(r.city || '');
        setStateName(r.state || '');
        setPostalCode(r.postalCode || '');
        setLogoUrl(r.logoUrl || '');
        setBannerUrl(r.bannerUrl || '');

        setGstRegistered(Boolean(r.gstRegistered || r.gstin));
        setGstin(r.gstin || '');
        setGstBusinessName(r.gstBusinessName || '');
        setFssaiRegistered(Boolean(r.fssaiRegistered || r.fssaiNumber));
        setFssai(r.fssaiNumber || '');
        setFssaiBusinessName(r.fssaiBusinessName || '');

        const s = r.settings;
        if (s) {
          setIsRestaurantOpen(s.isRestaurantOpen ?? true);
          setOpeningHoursText(s.openingHoursText || '11:00 AM - 11:30 PM');
          setClosureMessage(s.closureMessage || 'We are currently closed for orders.');
          setSupportWhatsapp(s.supportWhatsappNumber || '');
          setUpiQrEnabled(s.upiQrEnabled ?? Boolean(s.upiId));
          setUpiId(s.upiId || '');
          setMerchantName(s.upiMerchantName || r.name || '');
          setUpiQrImageUrl(s.upiQrImageUrl || '');
          setPrinterIpBill(s.printerIpBill || '');
          setPrinterIpKot(s.printerIpKot || '');
          setAutoPrintBill(s.autoPrintBill ?? true);
          setAutoPrintKot(s.autoPrintKot ?? true);
          setReceiptFooter(s.defaultReceiptFooter || `Thank you for visiting ${r.name}!`);
        }
      }
      if (Array.isArray(data.auditLogs)) {
        setAuditLogs(data.auditLogs);
      }

      if (sessRes.ok) {
        const sData = await sessRes.json();
        setSessions(sData.sessions || []);
        setCurrentSessionId(sData.currentSessionId || null);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'cover' | 'upiQr') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        if (target === 'logo') setLogoUrl(data.url);
        else if (target === 'cover') setBannerUrl(data.url);
        else setUpiQrImageUrl(data.url);
      } else {
        setErrorMsg(data.error || 'Image upload failed');
      }
    } catch {
      setErrorMsg('Failed to upload image');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          displayName,
          ownerName,
          description,
          phone,
          email,
          address,
          city,
          state: stateName,
          postalCode,
          logoUrl,
          bannerUrl,
          gstRegistered,
          gstin: gstRegistered ? gstin : '',
          gstBusinessName: gstRegistered ? gstBusinessName : '',
          fssaiRegistered,
          fssaiNumber: fssaiRegistered ? fssai : '',
          fssaiBusinessName: fssaiRegistered ? fssaiBusinessName : '',
          isRestaurantOpen,
          openingHoursText,
          closureMessage,
          supportWhatsappNumber: supportWhatsapp,
          upiQrEnabled,
          upiId,
          upiMerchantName: merchantName,
          upiQrImageUrl,
          printerIpBill,
          printerIpKot,
          autoPrintBill,
          autoPrintKot,
          defaultReceiptFooter: receiptFooter,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to save settings');
      }
    } catch {
      setErrorMsg('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwdMsg('Password updated successfully! Other sessions have been logged out.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Password update failed');
      }
    } catch {
      setErrorMsg('Failed to update password');
    }
  };

  const handleRevokeSession = async (sessionId?: string, all = false) => {
    const url = all ? '/api/auth/sessions?all=true' : `/api/auth/sessions?sessionId=${sessionId}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) {
      if (all) {
        localStorage.removeItem('auth_session');
        window.location.href = '/login';
      } else {
        loadAllData();
      }
    }
  };

  const dynamicUpiQrString = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName || name || 'Restaurant')}&cu=INR`
    : '';
  const dynamicUpiQrImgUrl = dynamicUpiQrString
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(dynamicUpiQrString)}`
    : '';

  const handleTestPrint = () => {
    setTestPrintData({
      billData: {
        restaurant: {
          name: displayName || name,
          logoUrl,
          address,
          city,
          state: stateName,
          postalCode,
          phone,
          gstin: gstRegistered ? gstin : '',
          fssaiNumber: fssaiRegistered ? fssai : '',
          currencySymbol: '₹',
          defaultReceiptFooter: receiptFooter,
        },
        order: {
          humanOrderId: 'TEST-999',
          createdAt: new Date(),
          customerName: 'Test Guest',
          customerPhone: '9876543210',
          carNumber: 'Table 1',
          orderType: 'DINE_IN',
          paymentMethod: 'UPI',
          paymentStatus: 'PAID',
          subtotal: 200,
          cgstAmount: 5,
          sgstAmount: 5,
          grandTotal: 210,
        },
        items: [{ name: 'Sample Dish', quantity: 1, unitPrice: 200, totalPrice: 200, isVeg: true }],
      },
      kotData: null,
    });
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: any }> = [
    { id: 'PROFILE', label: 'Restaurant Profile', icon: Store },
    { id: 'TAX', label: 'GST & FSSAI', icon: FileText },
    { id: 'PAYMENTS', label: 'UPI & Payments', icon: CreditCard },
    { id: 'PRINTERS', label: 'Thermal Printers', icon: Printer },
    { id: 'SECURITY', label: 'Security & Sessions', icon: KeyRound },
    { id: 'LOGS', label: 'Activity Logs', icon: History },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#331E17] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#AA1B2A]" />
                <span>Restaurant Settings</span>
              </h1>
              {qsrNumber && (
                <span className="px-2.5 py-0.5 rounded-lg bg-[#E09D3D] text-[#331E17] font-mono font-black text-xs shadow-2xs">
                  {qsrNumber} (Read-Only)
                </span>
              )}
            </div>
            <p className="text-xs text-[#745E55] mt-0.5">
              Self-service configuration for your restaurant profile, tax compliance, UPI payments, and security.
            </p>
          </div>

          {savedSuccess && (
            <div className="px-3.5 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Settings Saved!</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {pwdMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{pwdMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E1D6] pb-2 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === t.id
                    ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-md'
                    : 'bg-white text-[#745E55] hover:text-[#331E17] border border-[#E8E1D6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-8 text-center text-xs font-bold text-[#745E55] border border-[#E8E1D6]">
            Loading restaurant configuration...
          </div>
        ) : (
          <>
            {/* TABS 1-4: FORM-BASED SETTINGS */}
            {['PROFILE', 'TAX', 'PAYMENTS', 'PRINTERS'].includes(activeTab) && (
              <form onSubmit={handleSave} className="space-y-5 text-xs">
                {activeTab === 'PROFILE' && (
                  <div className="bg-white rounded-3xl border border-[#E8E1D6] p-6 space-y-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-[#331E17]">Store Status &amp; Profile</h3>
                        <p className="text-[11px] text-[#745E55]">Control your restaurant visibility, address, and brand logo.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRestaurantOpen(!isRestaurantOpen)}
                        className={`px-4 py-2 rounded-xl font-black flex items-center gap-1.5 cursor-pointer ${
                          isRestaurantOpen
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isRestaurantOpen ? 'Store OPEN' : 'Store CLOSED'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-[#331E17] mb-1">QSR Number (Read-Only)</label>
                        <input
                          type="text"
                          readOnly
                          value={qsrNumber || 'Assigned by Super Admin'}
                          className="w-full px-3.5 py-2.5 bg-slate-100 border border-[#E8E1D6] rounded-xl font-mono font-black text-[#AA1B2A] cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#331E17] mb-1">Restaurant Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#331E17] mb-1">Display Name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#331E17] mb-1">Owner Name</label>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#331E17] mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#331E17] mb-1">Business Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#331E17] mb-1">Full Address</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#331E17] mb-1">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-[#331E17] mb-1">State</label>
                          <input
                            type="text"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#331E17] mb-1">Pincode</label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#331E17] mb-1">Restaurant Description</label>
                        <textarea
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Logo & Cover Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div className="p-3 bg-[#FEFBF5] rounded-2xl border border-[#E8E1D6] space-y-2">
                        <p className="font-black text-[#331E17]">Restaurant Logo (1000x1000 PNG/JPG)</p>
                        {logoUrl && (
                          <div className="flex items-center gap-3">
                            <img src={logoUrl} alt="Logo" className="w-14 h-14 rounded-xl object-contain bg-white border border-[#E8E1D6] p-1" />
                            <button
                              type="button"
                              onClick={() => setLogoUrl('')}
                              className="text-red-600 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        )}
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-dashed border-[#AA1B2A]/40 rounded-xl cursor-pointer font-bold text-[#AA1B2A]">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New Logo</span>
                          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                        </label>
                      </div>

                      <div className="p-3 bg-[#FEFBF5] rounded-2xl border border-[#E8E1D6] space-y-2">
                        <p className="font-black text-[#331E17]">Cover Image (Optional)</p>
                        {bannerUrl && (
                          <div className="flex items-center gap-3">
                            <img src={bannerUrl} alt="Cover" className="w-24 h-14 rounded-xl object-cover border border-[#E8E1D6]" />
                            <button
                              type="button"
                              onClick={() => setBannerUrl('')}
                              className="text-red-600 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        )}
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-dashed border-[#AA1B2A]/40 rounded-xl cursor-pointer font-bold text-[#AA1B2A]">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Cover Image</span>
                          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'TAX' && (
                  <div className="bg-white rounded-3xl border border-[#E8E1D6] p-6 space-y-5 shadow-xs">
                    <div>
                      <h3 className="text-sm font-black text-[#331E17]">Business &amp; Tax Information (GST &amp; FSSAI)</h3>
                      <p className="text-[11px] text-[#745E55]">
                        All GST and FSSAI details are optional. Updates apply to future bills while preserving historical invoices.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* GST Card */}
                      <div className="p-4 rounded-2xl bg-[#FEFBF5] border border-[#E8E1D6] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[#331E17]">GST Registration</span>
                          <label className="flex items-center gap-2 cursor-pointer font-bold">
                            <input
                              type="checkbox"
                              checked={gstRegistered}
                              onChange={(e) => {
                                setGstRegistered(e.target.checked);
                                if (!e.target.checked) {
                                  setGstin('');
                                  setGstBusinessName('');
                                }
                              }}
                              className="accent-[#AA1B2A]"
                            />
                            <span>{gstRegistered ? 'Yes, Registered' : 'No / Not Registered'}</span>
                          </label>
                        </div>

                        {gstRegistered && (
                          <div className="space-y-2.5 pt-2 border-t border-[#E8E1D6]">
                            <div>
                              <label className="block font-bold mb-1">GSTIN Number (15 chars)</label>
                              <input
                                type="text"
                                placeholder="e.g. 06ACOFA4890L1ZT"
                                value={gstin}
                                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 bg-white border border-[#E8E1D6] rounded-xl font-mono"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">GST Business / Legal Name</label>
                              <input
                                type="text"
                                placeholder="Legal Trade Name"
                                value={gstBusinessName}
                                onChange={(e) => setGstBusinessName(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#E8E1D6] rounded-xl"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* FSSAI Card */}
                      <div className="p-4 rounded-2xl bg-[#FEFBF5] border border-[#E8E1D6] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[#331E17]">FSSAI License</span>
                          <label className="flex items-center gap-2 cursor-pointer font-bold">
                            <input
                              type="checkbox"
                              checked={fssaiRegistered}
                              onChange={(e) => {
                                setFssaiRegistered(e.target.checked);
                                if (!e.target.checked) {
                                  setFssai('');
                                  setFssaiBusinessName('');
                                }
                              }}
                              className="accent-[#AA1B2A]"
                            />
                            <span>{fssaiRegistered ? 'Yes, Registered' : 'No / Not Registered'}</span>
                          </label>
                        </div>

                        {fssaiRegistered && (
                          <div className="space-y-2.5 pt-2 border-t border-[#E8E1D6]">
                            <div>
                              <label className="block font-bold mb-1">FSSAI License Number (14 digits)</label>
                              <input
                                type="text"
                                maxLength={14}
                                placeholder="e.g. 20826004003060"
                                value={fssai}
                                onChange={(e) => setFssai(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-3 py-2 bg-white border border-[#E8E1D6] rounded-xl font-mono"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-1">FSSAI Business Name</label>
                              <input
                                type="text"
                                placeholder="Registered FBO Name"
                                value={fssaiBusinessName}
                                onChange={(e) => setFssaiBusinessName(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#E8E1D6] rounded-xl"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'PAYMENTS' && (
                  <div className="bg-white rounded-3xl border border-[#E8E1D6] p-6 space-y-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-[#331E17]">UPI Payment Settings (Tenant Isolated)</h3>
                        <p className="text-[11px] text-[#745E55]">
                          Configure your restaurant&apos;s own UPI ID &amp; QR code. Cash payments remain available independently.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF0E8] border border-[#E09D3D]/50 cursor-pointer font-black text-[#AA1B2A]">
                        <input
                          type="checkbox"
                          checked={upiQrEnabled}
                          onChange={(e) => setUpiQrEnabled(e.target.checked)}
                          className="accent-[#AA1B2A]"
                        />
                        <span>Enable UPI Payments</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div className="space-y-4">
                        <div>
                          <label className="block font-bold text-[#331E17] mb-1">Your UPI ID / VPA</label>
                          <input
                            type="text"
                            placeholder="restaurant@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#331E17] mb-1">UPI Display / Merchant Name</label>
                          <input
                            type="text"
                            placeholder="Your Restaurant Name"
                            value={merchantName}
                            onChange={(e) => setMerchantName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-bold"
                          />
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                          <b>Payment Note:</b> UPI QR initiates customer payment directly to your VPA. Always confirm payment receipt before marking digital orders as PAID.
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FEFBF5] border border-[#E8E1D6] text-center space-y-2">
                        <p className="font-black text-[#331E17] flex items-center justify-center gap-1.5">
                          <QrCode className="w-4 h-4 text-[#AA1B2A]" />
                          <span>Live Restaurant UPI QR Preview</span>
                        </p>
                        {upiQrEnabled && upiId ? (
                          <>
                            <img
                              src={upiQrImageUrl || dynamicUpiQrImgUrl}
                              alt="Restaurant UPI QR"
                              className="w-44 h-44 mx-auto rounded-xl border border-[#E8E1D6] bg-white p-2"
                            />
                            <p className="font-mono font-bold text-[#AA1B2A]">{upiId}</p>
                            <p className="text-[10px] text-[#745E55]">{merchantName || name}</p>
                          </>
                        ) : (
                          <p className="py-10 text-[#745E55]">Enter your UPI ID and enable UPI Payments to preview your dynamic QR code.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'PRINTERS' && (
                  <div className="bg-white rounded-3xl border border-[#E8E1D6] p-6 space-y-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-[#331E17]">80mm Thermal Printer &amp; Receipt Footer</h3>
                        <p className="text-[11px] text-[#745E55]">Configure your thermal bill/KOT printers and custom invoice footer.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestPrint}
                        className="px-3.5 py-2 bg-[#F7F2EA] hover:bg-[#e7ded0] text-[#331E17] font-black rounded-xl border border-[#E8E1D6] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Test Receipt Preview</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold mb-1">Bill Printer IP:Port (Optional)</label>
                        <input
                          type="text"
                          placeholder="192.168.1.200:9100"
                          value={printerIpBill}
                          onChange={(e) => setPrinterIpBill(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Kitchen KOT Printer IP:Port (Optional)</label>
                        <input
                          type="text"
                          placeholder="192.168.1.201:9100"
                          value={printerIpKot}
                          onChange={(e) => setPrinterIpKot(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold mb-1">Receipt Footer Message</label>
                        <input
                          type="text"
                          value={receiptFooter}
                          onChange={(e) => setReceiptFooter(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white font-black rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 5: SECURITY & SESSIONS */}
            {activeTab === 'SECURITY' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                <form onSubmit={handleChangePassword} className="bg-white rounded-3xl border border-[#E8E1D6] p-6 space-y-4 shadow-xs">
                  <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2 border-b border-slate-100 pb-3">
                    <KeyRound className="w-4 h-4 text-[#AA1B2A]" />
                    <span>Change Password</span>
                  </h3>
                  <div>
                    <label className="block font-bold mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">New Password (min 8 chars + number)</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white font-black rounded-xl cursor-pointer"
                  >
                    Update Password &amp; Revoke Other Sessions
                  </button>
                </form>

                <div className="bg-white rounded-3xl border border-[#E8E1D6] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2">
                      <MonitorSmartphone className="w-4 h-4 text-[#AA1B2A]" />
                      <span>Active Sessions ({sessions.length})</span>
                    </h3>
                    <button
                      onClick={() => handleRevokeSession(undefined, true)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-black rounded-xl border border-red-200 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout All Devices</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {sessions.length === 0 ? (
                      <p className="text-[#745E55] py-4 text-center">No tracked active sessions.</p>
                    ) : (
                      sessions.map((s) => (
                        <div key={s.id} className="p-3 rounded-2xl bg-[#FEFBF5] border border-[#E8E1D6] flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-[#331E17] truncate">
                              {s.deviceInfo || 'Web Browser'} {s.id === currentSessionId && <span className="text-emerald-700">(Current)</span>}
                            </p>
                            <p className="text-[10px] text-[#745E55] font-mono">
                              IP: {s.ipAddress || 'Unknown'} • {new Date(s.createdAt).toLocaleString('en-IN')}
                            </p>
                          </div>
                          {s.id !== currentSessionId && (
                            <button
                              onClick={() => handleRevokeSession(s.id)}
                              className="px-2.5 py-1 bg-white border border-red-200 text-red-600 rounded-lg font-bold cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: RESTAURANT ACTIVITY LOGS */}
            {activeTab === 'LOGS' && (
              <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xs overflow-hidden text-xs">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-black text-[#331E17]">Restaurant Activity &amp; Security Audit Log</h3>
                  <p className="text-[11px] text-[#745E55]">Immutable log of logins, menu changes, and settings updates for {name}.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F7F2EA] text-[10px] uppercase font-black text-[#745E55] border-b border-[#E8E1D6]">
                      <tr>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Notes</th>
                        <th className="py-3 px-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E1D6]/60">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[#745E55]">No activity logs recorded yet.</td>
                        </tr>
                      ) : (
                        auditLogs.map((l) => (
                          <tr key={l.id}>
                            <td className="py-2.5 px-4 font-mono font-bold text-[#AA1B2A]">{l.action}</td>
                            <td className="py-2.5 px-4 font-bold">{l.userName || 'System'}</td>
                            <td className="py-2.5 px-4 text-[#745E55]">{l.notes || '-'}</td>
                            <td className="py-2.5 px-4 text-[11px] text-[#745E55]">{new Date(l.createdAt).toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {testPrintData && (
        <PrintDualThermal
          billData={testPrintData.billData}
          kotData={null}
          mode="PRINT_BILL"
          onClose={() => setTestPrintData(null)}
          autoPrint={false}
        />
      )}
    </AdminLayout>
  );
}
