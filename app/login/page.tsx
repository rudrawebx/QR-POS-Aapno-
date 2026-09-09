'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Store,
  ChefHat,
  CreditCard,
  Users,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify(isPinMode ? { pinCode } : { email, password }),
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

  const handleQuickDemoLogin = async (role: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== 'undefined' && data.user) {
          localStorage.setItem('auth_session', JSON.stringify(data.user));
        }
        navigateToDashboard(role);
      } else {
        setError(data.error || 'Demo login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error');
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
    } catch (err) {
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
    } catch (err) {
      setForgotMessage('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D6] shadow-xl space-y-5">
      {/* Toggle PIN vs Email */}
      <div className="grid grid-cols-2 bg-[#F7F2EA] p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => {
            setIsPinMode(false);
            setError('');
          }}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            !isPinMode
              ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-xs'
              : 'text-[#745E55] hover:text-[#331E17]'
          }`}
        >
          Email &amp; Password
        </button>
        <button
          onClick={() => {
            setIsPinMode(true);
            setError('');
          }}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            isPinMode
              ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-xs'
              : 'text-[#745E55] hover:text-[#331E17]'
          }`}
        >
          Quick Waiter PIN
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 font-bold animate-in zoom-in-95">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        {!isPinMode ? (
          <>
            <div>
              <label className="block font-bold text-[#331E17] mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="owner@aapnokhano.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl text-[#331E17] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-[#331E17]">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-bold text-[#AA1B2A] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl text-[#331E17] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block font-bold text-[#331E17] mb-1">4-Digit POS Staff PIN</label>
            <input
              type="password"
              maxLength={4}
              required
              placeholder="1111"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full px-3.5 py-3 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl text-[#AA1B2A] font-mono text-center text-2xl font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Demo 1-Click Role Accounts */}
      <div className="pt-4 border-t border-[#E8E1D6] space-y-2">
        <p className="text-[10px] font-bold text-[#745E55] uppercase tracking-wider text-center">
          Quick Role Logins (Single-Click Access)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickDemoLogin('SUPER_ADMIN')}
            className="p-2 rounded-xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-left text-xs font-medium cursor-pointer transition-colors border border-[#E8E1D6]"
          >
            <span className="font-bold text-purple-900 block text-[11px]">1. Super Admin</span>
            <span className="text-[9px] text-[#745E55] block truncate">vinod@aapnokhano.com</span>
            <span className="text-[9px] font-mono text-purple-700 font-bold">PIN: 0000</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('OWNER')}
            className="p-2 rounded-xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-left text-xs font-medium cursor-pointer transition-colors border border-[#E8E1D6]"
          >
            <span className="font-bold text-[#AA1B2A] block text-[11px]">2. Restaurant Owner</span>
            <span className="text-[9px] text-[#745E55] block truncate">fatehabad@aapnokhano.com</span>
            <span className="text-[9px] font-mono text-[#AA1B2A] font-bold">PIN: 1111</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('MANAGER')}
            className="p-2 rounded-xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-left text-xs font-medium cursor-pointer transition-colors border border-[#E8E1D6]"
          >
            <span className="font-bold text-amber-800 block text-[11px]">3. Manager</span>
            <span className="text-[9px] text-[#745E55] block truncate">ftd.mngr@aapnokhano.com</span>
            <span className="text-[9px] font-mono text-amber-700 font-bold">PIN: 2222</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('CASHIER')}
            className="p-2 rounded-xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-left text-xs font-medium cursor-pointer transition-colors border border-[#E8E1D6]"
          >
            <span className="font-bold text-emerald-800 block text-[11px]">4. Cashier &amp; POS</span>
            <span className="text-[9px] text-[#745E55] block truncate">ftd.cashier@aapnokhano.com</span>
            <span className="text-[9px] font-mono text-emerald-700 font-bold">PIN: 3333</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('KITCHEN')}
            className="p-2 rounded-xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-left text-xs font-medium cursor-pointer transition-colors border border-[#E8E1D6]"
          >
            <span className="font-bold text-red-700 block text-[11px]">5. Kitchen Chef (KDS)</span>
            <span className="text-[9px] text-[#745E55] block truncate">ftd.kitchen@aapnokhano.com</span>
            <span className="text-[9px] font-mono text-red-600 font-bold">PIN: 4444</span>
          </button>

          <button
            onClick={() => handleQuickDemoLogin('WAITER')}
            className="p-2 rounded-xl bg-[#F7F2EA] hover:bg-[#E8E1D6] text-left text-xs font-medium cursor-pointer transition-colors border border-[#E8E1D6]"
          >
            <span className="font-bold text-blue-800 block text-[11px]">6. Captain / Waiter</span>
            <span className="text-[9px] text-[#745E55] block truncate">ftd.waiter@aapnokhano.com</span>
            <span className="text-[9px] font-mono text-blue-700 font-bold">PIN: 5555</span>
          </button>
        </div>
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
                    className="px-4 py-1.5 bg-[#AA1B2A] text-white rounded-xl font-bold hover:bg-[#8e1421] shadow-xs"
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
                    className="w-full py-2 bg-[#AA1B2A] text-white rounded-xl font-bold hover:bg-[#8e1421] shadow-xs"
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
    <div className="min-h-screen bg-[#FEFBF5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#E09D3D] selection:text-[#AA1B2A]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-18 h-18 rounded-3xl bg-white p-2.5 shadow-xl border-2 border-[#E09D3D] mx-auto flex items-center justify-center overflow-hidden mb-3">
          <img src="/images/aapno-khano-logo.png" alt="Aapno Khaano" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-black text-[#331E17] tracking-tight">आपणो खाणो (Aapno Khaano)</h1>
        <p className="text-xs text-[#745E55] mt-1 font-medium">QSR POS, Kitchen KDS &amp; Multi-Tenant SaaS Platform</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Suspense fallback={<div className="bg-white p-8 rounded-3xl text-center text-xs font-bold text-slate-500 shadow-xl border border-[#E8E1D6]">Loading authentication portal...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
