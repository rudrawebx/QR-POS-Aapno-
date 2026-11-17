'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Upload,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

export default function RegisterRestaurantPage() {
  const [form, setForm] = useState({
    ownerName: '',
    restaurantName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: 'Haryana',
    pincode: '',
    logoUrl: '',
    coverUrl: '',
    gstin: '',
    fssaiNumber: '',
    upiId: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otpTarget, setOtpTarget] = useState<'email' | 'mobile'>('mobile');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerifiedIdentifier, setOtpVerifiedIdentifier] = useState('');
  const [testOtpHint, setTestOtpHint] = useState('');

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState('');

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-slate-200', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-600', width: 'w-full' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSendOtp = async () => {
    setError('');
    const identifier = otpTarget === 'email' ? form.email.trim() : form.mobile.trim();
    if (!identifier) {
      setError(`Please enter your ${otpTarget === 'email' ? 'Email Address' : 'Mobile Number'} first.`);
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, purpose: 'REGISTRATION' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        if (data.testOtp) setTestOtpHint(data.testOtp);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch {
      setError('Network error sending OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const identifier = otpTarget === 'email' ? form.email.trim() : form.mobile.trim();
    if (!otpCode.trim()) {
      setError('Enter the 6-digit OTP code');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp: otpCode.trim(), purpose: 'REGISTRATION' }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setOtpVerifiedIdentifier(data.identifier);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch {
      setError('Network error verifying OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, [field]: data.url }));
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch {
      setError('Image upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpVerifiedIdentifier) {
      setError('Please complete OTP verification before submitting your registration.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, otpVerifiedIdentifier }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRef(data.applicationRef);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error submitting registration');
    } finally {
      setLoading(false);
    }
  };

  if (submittedRef) {
    return (
      <div className="min-h-screen bg-[#FEFBF5] flex items-center justify-center p-4 font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl border-2 border-[#E09D3D] shadow-2xl p-8 text-center space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black uppercase tracking-wider">
              Status: PENDING APPROVAL
            </span>
            <h1 className="text-2xl font-black text-[#331E17] mt-3">Registration Submitted!</h1>
            <p className="text-xs text-[#745E55] mt-1">
              Thank you for registering <b>{form.restaurantName}</b> with Aapno Khano SaaS POS.
            </p>
          </div>

          <div className="bg-[#FFF0E8] border border-[#E09D3D]/60 rounded-2xl p-4 space-y-1">
            <p className="text-[11px] font-bold text-[#745E55] uppercase">Application Reference Number</p>
            <p className="text-2xl font-black text-[#AA1B2A] font-mono tracking-wider">{submittedRef}</p>
            <p className="text-[11px] text-[#745E55] pt-1">
              Save this reference number. Once Super Admin approves your application, your unique <b>QSR Number</b> will be generated automatically and your POS login will be activated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/application-status?ref=${submittedRef}`}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white font-black rounded-xl text-xs shadow-md"
            >
              Track Application Status
            </Link>
            <Link
              href="/login"
              className="flex-1 py-2.5 px-4 bg-[#F7F2EA] text-[#331E17] font-bold rounded-xl text-xs border border-[#E8E1D6]"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFBF5] py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-black text-[#AA1B2A] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
          <Link href="/application-status" className="text-xs font-bold text-[#745E55] hover:text-[#AA1B2A] hover:underline">
            Already registered? Check Status →
          </Link>
        </div>

        <div className="text-center space-y-2">
          <img src="/images/aapno-khano-logo.png" alt="POS SaaS" className="h-16 w-auto mx-auto object-contain" />
          <h1 className="text-2xl sm:text-3xl font-black text-[#331E17]">Register Your Restaurant</h1>
          <p className="text-xs text-[#745E55] max-w-xl mx-auto">
            Onboard your restaurant to our multi-tenant Cloud POS, QR Ordering &amp; Kitchen KDS platform. Automatic QSR Number is assigned upon Super Admin approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xl p-6 sm:p-8 space-y-6 text-xs">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Owner & Restaurant Basics */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-[#AA1B2A] border-b border-[#E8E1D6] pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>1. Owner &amp; Restaurant Details</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#331E17] mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-[#331E17] mb-1">Restaurant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Spice Kitchen"
                  value={form.restaurantName}
                  onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-[#331E17] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="owner@restaurant.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#331E17] mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: OTP Verification */}
          <div className="bg-[#FFF0E8] border border-[#E09D3D]/60 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-black text-[#AA1B2A]">
                <KeyRound className="w-4 h-4" />
                <span>2. Verify Email or Mobile via OTP *</span>
              </div>
              {otpVerifiedIdentifier && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-black flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified ({otpVerifiedIdentifier})
                </span>
              )}
            </div>

            {!otpVerifiedIdentifier && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={otpTarget}
                    onChange={(e) => setOtpTarget(e.target.value as 'email' | 'mobile')}
                    className="px-3 py-2 bg-white border border-[#E8E1D6] rounded-xl font-bold"
                  >
                    <option value="mobile">Verify Mobile ({form.mobile || 'enter above'})</option>
                    <option value="email">Verify Email ({form.email || 'enter above'})</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="px-4 py-2 bg-[#AA1B2A] hover:bg-[#8e1421] text-white font-black rounded-xl cursor-pointer"
                  >
                    {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>

                {otpSent && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="px-3.5 py-2 bg-white border border-[#E8E1D6] rounded-xl font-mono font-black tracking-widest w-44"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl cursor-pointer"
                    >
                      Verify OTP
                    </button>
                    {testOtpHint && (
                      <span className="text-[11px] font-bold text-[#745E55]">
                        (Verification Code: <b className="text-[#AA1B2A] font-mono">{testOtpHint}</b>)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Password */}
          <div className="space-y-3">
            <h2 className="text-sm font-black text-[#AA1B2A] border-b border-[#E8E1D6] pb-2">3. Account Security</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#331E17] mb-1">Password * (min 8 chars + number)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} transition-all`} />
                    </div>
                    <p className="text-[10px] font-bold text-[#745E55]">Strength: {strength.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block font-bold text-[#331E17] mb-1">Confirm Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address */}
          <div className="space-y-3">
            <h2 className="text-sm font-black text-[#AA1B2A] border-b border-[#E8E1D6] pb-2">4. Restaurant Address</h2>
            <div>
              <label className="block font-bold text-[#331E17] mb-1">Full Address *</label>
              <input
                type="text"
                required
                placeholder="Shop / SCO No., Sector / Market, Landmark"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#331E17] mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panchkula"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#331E17] mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#331E17] mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="134113"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Optional Details */}
          <div className="space-y-3">
            <h2 className="text-sm font-black text-[#745E55] border-b border-[#E8E1D6] pb-2">
              5. Business, Payment &amp; Branding (Optional — You can add or edit these later)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#331E17] mb-1">GST Number (Optional)</label>
                <input
                  type="text"
                  placeholder="06XXXXX1234X1Z5"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-[#331E17] mb-1">FSSAI License No. (Optional)</label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="14-digit FSSAI"
                  value={form.fssaiNumber}
                  onChange={(e) => setForm({ ...form, fssaiNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-[#331E17] mb-1">UPI ID (Optional)</label>
                <input
                  type="text"
                  placeholder="restaurant@upi"
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FEFBF5] border border-dashed border-[#AA1B2A]/40 rounded-xl cursor-pointer hover:bg-[#FFF0E8] font-bold text-[#AA1B2A]">
                <Upload className="w-4 h-4" />
                <span>{form.logoUrl ? 'Logo Uploaded ✓' : 'Upload Restaurant Logo (Optional)'}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FEFBF5] border border-dashed border-[#AA1B2A]/40 rounded-xl cursor-pointer hover:bg-[#FFF0E8] font-bold text-[#AA1B2A]">
                <Upload className="w-4 h-4" />
                <span>{form.coverUrl ? 'Cover Uploaded ✓' : 'Upload Cover Image (Optional)'}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleImageUpload(e, 'coverUrl')} />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white font-black py-3.5 px-6 rounded-2xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Submitting Application...' : 'Submit Restaurant Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
