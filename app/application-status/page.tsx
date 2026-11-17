'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

function StatusTracker() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [query, setQuery] = useState(initialRef);
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resubmitMsg, setResubmitMsg] = useState('');

  // Editable fields for rejected resubmission
  const [editAddress, setEditAddress] = useState('');
  const [editGstin, setEditGstin] = useState('');
  const [editFssai, setEditFssai] = useState('');

  const lookupStatus = async (qStr: string) => {
    if (!qStr.trim()) return;
    setLoading(true);
    setError('');
    setResubmitMsg('');
    try {
      const isEmail = qStr.includes('@');
      const url = isEmail
        ? `/api/auth/application-status?email=${encodeURIComponent(qStr.trim())}`
        : `/api/auth/application-status?ref=${encodeURIComponent(qStr.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.application) {
        setApp(data.application);
        setEditAddress(data.application.address || '');
        setEditGstin(data.application.gstin || '');
        setEditFssai(data.application.fssaiNumber || '');
      } else {
        setApp(null);
        setError(data.error || 'Application not found');
      }
    } catch {
      setError('Failed to look up application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      lookupStatus(initialRef);
    }
  }, [initialRef]);

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/application-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationRef: app.applicationRef,
          address: editAddress,
          gstin: editGstin,
          fssaiNumber: editFssai,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResubmitMsg(data.message);
        lookupStatus(app.applicationRef);
      } else {
        setError(data.error || 'Resubmission failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-black text-[#AA1B2A] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
        <Link href="/register" className="text-xs font-bold text-[#745E55] hover:text-[#AA1B2A] hover:underline">
          New Registration →
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xl p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-black text-[#331E17]">Application Status Tracker</h1>
          <p className="text-xs text-[#745E55] mt-1">Enter your Application Reference Number (e.g. APP-2026-0101) or Email</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="APP-2026-XXXX or owner@restaurant.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl text-xs font-bold"
          />
          <button
            onClick={() => lookupStatus(query)}
            disabled={loading}
            className="px-4 py-2.5 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Check</span>
          </button>
        </div>

        {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>}
        {resubmitMsg && <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">{resubmitMsg}</p>}

        {app && (
          <div className="border-t border-[#E8E1D6] pt-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#745E55] uppercase">Application ID</p>
                <p className="font-mono font-black text-sm text-[#331E17]">{app.applicationRef}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-black text-[11px] flex items-center gap-1 ${
                  app.status === 'APPROVED' || app.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : app.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {app.status === 'APPROVED' || app.status === 'ACTIVE' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : app.status === 'REJECTED' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {app.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#FEFBF5] p-3.5 rounded-2xl border border-[#E8E1D6]">
              <div>
                <p className="text-[10px] text-[#745E55]">Restaurant Name</p>
                <p className="font-black text-[#331E17]">{app.restaurantName}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#745E55]">Owner Name</p>
                <p className="font-bold text-[#331E17]">{app.ownerName}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#745E55]">City</p>
                <p className="font-bold text-[#331E17]">{app.city}, {app.state}</p>
              </div>
              {app.assignedQsrNumber && (
                <div>
                  <p className="text-[10px] text-[#745E55]">Assigned QSR Number</p>
                  <p className="font-mono font-black text-[#AA1B2A]">{app.assignedQsrNumber}</p>
                </div>
              )}
            </div>

            {app.status === 'APPROVED' && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
                <p className="font-black text-emerald-900">Your restaurant account is approved &amp; active!</p>
                <p className="text-emerald-800">Assigned QSR Number: <b>{app.assignedQsrNumber}</b>. You can now sign in to your POS dashboard.</p>
                <Link href="/login" className="inline-block mt-1 px-4 py-2 bg-emerald-600 text-white font-black rounded-xl">
                  Sign In Now →
                </Link>
              </div>
            )}

            {app.status === 'REJECTED' && (
              <form onSubmit={handleResubmit} className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-start gap-2 text-red-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black">Rejection Reason:</p>
                    <p>{app.rejectionReason || 'Please correct your business details and resubmit.'}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-red-200">
                  <p className="font-black text-[#331E17]">Correct Details &amp; Resubmit:</p>
                  <input
                    type="text"
                    placeholder="Updated Address"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="GSTIN (Optional)"
                      value={editGstin}
                      onChange={(e) => setEditGstin(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl font-mono"
                    />
                    <input
                      type="text"
                      placeholder="FSSAI (Optional)"
                      value={editFssai}
                      onChange={(e) => setEditFssai(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#AA1B2A] text-white font-black rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resubmit Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationStatusPage() {
  return (
    <div className="min-h-screen bg-[#FEFBF5] py-10 px-4 font-sans">
      <Suspense fallback={<div className="text-center text-xs font-bold text-[#745E55]">Loading tracker...</div>}>
        <StatusTracker />
      </Suspense>
    </div>
  );
}
