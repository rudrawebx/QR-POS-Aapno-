'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  Building2,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  PhoneCall,
  User,
  UserPlus,
  ChefHat,
  QrCode,
  BarChart3,
  Receipt,
  FileText,
  Monitor,
  Headphones,
} from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [pinCode, setPinCode] = useState('');
  const [isPinMode, setIsPinMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [resetTokenReceived, setResetTokenReceived] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigateToDashboard = (role: string) => {
    if (role === 'SUPER_ADMIN') {
      window.location.href = '/superadmin';
    } else if (role === 'KITCHEN') {
      window.location.href = '/kitchen';
    } else if (role === 'CASHIER' || role === 'WAITER') {
      window.location.href = '/admin/pos';
    } else {
      if (redirectPath && !redirectPath.startsWith('/superadmin')) {
        window.location.href = redirectPath;
      } else {
        window.location.href = '/admin/orders';
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isPinMode ? { pinCode } : { identifier: email, email, password, rememberMe }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== 'undefined' && data.user) {
          localStorage.setItem('auth_session', JSON.stringify(data.user));
        }
        navigateToDashboard(data.user?.role || 'OWNER');
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      console.error('Login exception:', err);
      setError('Login error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage(data.message);
        if (data.resetToken) {
          setResetTokenReceived(data.resetToken);
        }
      } else {
        setForgotMessage(data.error || 'Failed to process request');
      }
    } catch {
      setForgotMessage('Error requesting reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetTokenReceived, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setResetSuccess(false);
          setResetTokenReceived('');
        }, 2000);
      } else {
        setForgotMessage(data.error || 'Failed to reset password');
      }
    } catch {
      setForgotMessage('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md p-5 xl:p-7 rounded-[26px] border border-[#E7DDD0] shadow-[0_24px_60px_-15px_rgba(60,24,14,0.16)] space-y-3.5 xl:space-y-4 w-full">
      {/* Card Header */}
      <div className="text-center space-y-0.5">
        <div className="lg:hidden mb-2">
          <img
            src="/images/aapno-khano-login-logo.png"
            alt="Aapno Khaano"
            className="h-14 w-auto mx-auto object-contain"
          />
        </div>
        <p className="text-xs font-bold text-[#331E17]">Welcome to</p>
        <h2 className="text-xl xl:text-2xl font-black text-[#8E1521] tracking-tight">Aapno Khano POS</h2>
        <p className="text-[11px] text-[#745E55] font-medium">Restaurant Management System</p>
      </div>

      {/* Top Segmented Pill: Login | Register */}
      <div className="grid grid-cols-2 bg-[#F5EFE6] p-1 rounded-full text-xs font-bold border border-[#EAE0D2]">
        <button
          type="button"
          onClick={() => {
            setIsPinMode(false);
            setError('');
          }}
          className="py-2 rounded-full bg-gradient-to-r from-[#8E1521] to-[#B01F2E] text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <User className="w-3.5 h-3.5" />
          <span>Login</span>
        </button>
        <Link
          href="/register"
          className="py-2 rounded-full text-[#5C463E] hover:text-[#8E1521] flex items-center justify-center gap-1.5 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-3 text-xs">
        {!isPinMode ? (
          <>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8E7368] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Email Address / Mobile Number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl text-[#331E17] placeholder-[#8E7368] font-medium focus:outline-none focus:ring-2 focus:ring-[#8E1521] focus:bg-white transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-[#8E7368] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl text-[#331E17] placeholder-[#8E7368] font-medium focus:outline-none focus:ring-2 focus:ring-[#8E1521] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E7368] hover:text-[#331E17] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-[#8E1521]"
                />
                <span className="text-[11px] font-bold text-[#5C463E]">Remember me for 30 days</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[11px] font-bold text-[#8E1521] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </>
        ) : (
          <div>
            <label className="block font-bold text-[#331E17] mb-1.5 text-center">Enter 4-Digit Staff POS PIN</label>
            <input
              type="password"
              maxLength={4}
              required
              placeholder="••••"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full px-4 py-3 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl text-[#8E1521] font-mono text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#8E1521]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#8E1521] to-[#AE1D2B] hover:from-[#7A101B] hover:to-[#961724] text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-[#8E1521]/20 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
        </button>

        {/* Subtle PIN / Password Mode Switcher */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsPinMode(!isPinMode);
              setError('');
            }}
            className="text-[11px] font-bold text-[#745E55] hover:text-[#8E1521] inline-flex items-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            <span>{isPinMode ? 'Use Email / Mobile & Password instead' : 'Staff Quick PIN Login'}</span>
          </button>
        </div>
      </form>

      {/* OR Divider */}
      <div className="relative flex items-center py-0.5">
        <div className="flex-grow border-t border-[#EAE0D2]" />
        <span className="flex-shrink mx-3 text-[11px] font-bold text-[#8E7368]">or</span>
        <div className="flex-grow border-t border-[#EAE0D2]" />
      </div>

      {/* Create New Restaurant Account Button */}
      <Link
        href="/register"
        className="w-full py-3 px-4 bg-[#FCF9F4] hover:bg-[#FFF0E8] text-[#8E1521] font-black rounded-xl border border-[#DFC7B0] flex items-center justify-center gap-2 text-xs transition-colors"
      >
        <Building2 className="w-4 h-4" />
        <span>Create New Restaurant Account</span>
      </Link>

      {/* Bottom Links */}
      <div className="pt-2 border-t border-[#F0E8DC] flex items-center justify-between text-[11px] font-bold text-[#5C463E]">
        <Link href="/application-status" className="inline-flex items-center gap-1.5 hover:text-[#8E1521] hover:underline">
          <FileText className="w-3.5 h-3.5 text-[#8E7368]" />
          <span>Check Application Status</span>
        </Link>
        <span className="text-[#E0D4C4]">|</span>
        <a
          href="https://wa.me/917082040809?text=Hello%20Support%2C%20I%20need%20help%20with%20Aapno%20Khano%20POS."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-[#8E1521] hover:underline"
        >
          <Headphones className="w-3.5 h-3.5 text-[#8E7368]" />
          <span>Contact Support</span>
        </a>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#E8E1D6] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#331E17]">Reset Password</h3>
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setResetTokenReceived('');
                  setForgotMessage('');
                }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <p className="font-bold text-sm text-emerald-800">Password Updated Successfully!</p>
                <p className="text-xs text-slate-500">You can now login with your new password.</p>
              </div>
            ) : !resetTokenReceived ? (
              <form onSubmit={handleForgotPassword} className="space-y-3 text-xs">
                <p className="text-slate-600 text-[11px]">
                  Enter your registered account email to receive a secure password reset token:
                </p>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="owner@aapnokhano.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                {forgotMessage && <p className="text-[11px] text-[#AA1B2A] font-bold">{forgotMessage}</p>}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-[#8E1521] text-white rounded-xl font-bold hover:bg-[#7A101B] shadow-xs"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <p className="text-slate-600 text-[11px]">
                  Enter your new password for account <b className="text-slate-900">{forgotEmail}</b>:
                </p>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                {forgotMessage && <p className="text-[11px] text-red-600 font-bold">{forgotMessage}</p>}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-[#8E1521] text-white rounded-xl font-bold hover:bg-[#7A101B] shadow-xs"
                  >
                    {loading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden relative bg-gradient-to-br from-[#FBF7F0] via-[#F4E9D8] to-[#EBDCBF] flex flex-col justify-between font-sans selection:bg-[#E09D3D] selection:text-[#8E1521]">
      {/* Warm Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#E09D3D]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-[#8E1521]/10 blur-3xl" />

      <div className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-3 flex items-center min-h-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* LEFT HERO & HARDWARE SHOWCASE (Desktop) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col space-y-3.5 xl:space-y-4">
            {/* Brand Badge */}
            <Link href="/" className="inline-flex items-center gap-3 w-fit group">
              <img
                src="/images/aapno-khano-login-logo.png"
                alt="Aapno Khaano"
                className="h-14 xl:h-16 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-lg bg-[#8E1521] text-white text-xs font-black tracking-wider shadow-xs">
                    POS
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#5C463E] mt-1">Restaurant Management System</p>
              </div>
            </Link>

            {/* Hero Headline */}
            <div className="space-y-1.5">
              <h1 className="text-3xl xl:text-[40px] font-black text-[#2B1810] leading-[1.1] tracking-tight">
                Run Your Restaurant
                <br />
                Smarter with{' '}
                <span className="text-[#8E1521] relative inline-block">
                  Aapno Khano POS
                  <span className="block h-1 w-full bg-gradient-to-r from-[#8E1521] via-[#E09D3D] to-transparent rounded-full mt-0.5" />
                </span>
              </h1>
              <p className="text-xs xl:text-sm text-[#5C463E] max-w-md leading-relaxed font-medium">
                A complete POS, KDS and restaurant management platform for QSRs, cafés and hotels.
              </p>
            </div>

            {/* 4 Feature Icon Badges */}
            <div className="grid grid-cols-4 gap-2.5 max-w-xl">
              <div className="bg-white/75 backdrop-blur-xs border border-[#E5D9C8] rounded-2xl p-2.5 text-center shadow-xs">
                <div className="w-8 h-8 mx-auto rounded-xl bg-[#FFF0E8] text-[#8E1521] flex items-center justify-center mb-1">
                  <Monitor className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-[#331E17] leading-tight">Smart POS &amp; Billing</p>
              </div>
              <div className="bg-white/75 backdrop-blur-xs border border-[#E5D9C8] rounded-2xl p-2.5 text-center shadow-xs">
                <div className="w-8 h-8 mx-auto rounded-xl bg-[#FFF0E8] text-[#8E1521] flex items-center justify-center mb-1">
                  <ChefHat className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-[#331E17] leading-tight">Kitchen Display (KDS)</p>
              </div>
              <div className="bg-white/75 backdrop-blur-xs border border-[#E5D9C8] rounded-2xl p-2.5 text-center shadow-xs">
                <div className="w-8 h-8 mx-auto rounded-xl bg-[#FFF0E8] text-[#8E1521] flex items-center justify-center mb-1">
                  <QrCode className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-[#331E17] leading-tight">QR Menu &amp; Ordering</p>
              </div>
              <div className="bg-white/75 backdrop-blur-xs border border-[#E5D9C8] rounded-2xl p-2.5 text-center shadow-xs">
                <div className="w-8 h-8 mx-auto rounded-xl bg-[#FFF0E8] text-[#8E1521] flex items-center justify-center mb-1">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-[#331E17] leading-tight">Reports &amp; Analytics</p>
              </div>
            </div>

            {/* POS Terminal + Thermal Printer + Scanner + QR Standee Image */}
            <div className="pt-1 max-w-xl">
              <img
                src="/images/pos-hardware-showcase.png"
                alt="Aapno Khano POS Terminal, Thermal Printer & QR Standee"
                className="w-full max-h-[210px] xl:max-h-[250px] object-contain object-left drop-shadow-[0_18px_30px_rgba(43,24,16,0.16)]"
              />
            </div>
          </div>

          {/* RIGHT LOGIN CARD */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <Suspense
              fallback={
                <div className="bg-white p-8 rounded-[26px] text-center text-xs font-bold text-slate-500 shadow-xl border border-[#E8E1D6]">
                  Loading authentication portal...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-2.5 text-center text-[11px] text-[#5C463E] flex-shrink-0">
        © All Copyright 2026 by{' '}
        <a
          href="https://rudrawebx.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8E1521] font-black hover:underline"
        >
          Rudra Web X
        </a>
      </footer>
    </div>
  );
}
