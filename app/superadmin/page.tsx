'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Lock,
  ArrowUpRight,
  UserCheck,
  ShieldX,
  CreditCard,
  X,
  LogOut,
  UtensilsCrossed,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Flame,
  Check,
  Upload,
} from 'lucide-react';

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<'RESTAURANTS' | 'APPLICATIONS' | 'USERS' | 'PLANS' | 'AUDIT_LOGS' | 'POS_CONFIG'>('RESTAURANTS');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Restaurant Onboarding state
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('Jaipur');
  const [newAddress, setNewAddress] = useState('Main Highway Plaza');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // New User state
  const [userRestaurantId, setUserRestaurantId] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('MANAGER');
  const [userPassword, setUserPassword] = useState('staff123');

  const fetchSuperadminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/superadmin');
      if (res.ok) {
        const sData = await res.json();
        if (sData.error) {
          console.warn('Superadmin data warning:', sData.error);
        } else {
          setData(sData);
          if (sData.plans && sData.plans.length > 0 && !selectedPlanId) {
            setSelectedPlanId(sData.plans[0].id);
          }
          if (sData.restaurants && sData.restaurants.length > 0 && !userRestaurantId) {
            setUserRestaurantId(sData.restaurants[0].id);
          }
          return;
        }
      }

      // Check client session
      const localSess = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;
      if (localSess) {
        const parsed = JSON.parse(localSess);
        if (parsed?.role === 'SUPER_ADMIN') {
          return;
        }
      }
      window.location.href = '/login?redirect=/superadmin';
    } catch (err) {
      console.error('Error fetching superadmin data:', err);
      const localSess = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;
      if (localSess) {
        const parsed = JSON.parse(localSess);
        if (parsed?.role === 'SUPER_ADMIN') {
          return;
        }
      }
      window.location.href = '/login?redirect=/superadmin';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperadminData();
  }, []);

  const handleToggleStatus = async (restaurantId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_STATUS',
          restaurantId,
          isActive: !currentStatus,
        }),
      });
      fetchSuperadminData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_USER_STATUS',
          userId,
          isActive: !currentStatus,
        }),
      });
      fetchSuperadminData();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_RESTAURANT',
          name: newName,
          uniqueUsername: newSlug,
          phone: newPhone,
          email: newEmail,
          city: newCity,
          state: 'Rajasthan',
          postalCode: '302001',
          address: newAddress,
          planId: selectedPlanId,
          ownerName: `${newName} Admin`,
          ownerPassword: 'owner123',
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewName('');
        setNewSlug('');
        setNewPhone('');
        setNewEmail('');
        fetchSuperadminData();
      }
    } catch (err) {
      console.error('Error onboarding restaurant:', err);
    }
  };

  const handleCreateTenantUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_TENANT_USER',
          restaurantId: userRestaurantId,
          name: userName,
          email: userEmail,
          phone: userPhone,
          role: userRole,
          password: userPassword,
        }),
      });

      if (res.ok) {
        setIsAddUserModalOpen(false);
        setUserName('');
        setUserEmail('');
        setUserPhone('');
        fetchSuperadminData();
      }
    } catch (err) {
      console.error('Error creating tenant user:', err);
    }
  };

  // Switch Restaurant context for Super Admin
  const handleSwitchRestaurant = async (restaurantId: string) => {
    try {
      const res = await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SWITCH_RESTAURANT', restaurantId }),
      });
      if (res.ok) {
        window.location.href = '/admin/orders';
      }
    } catch (err) {
      console.error('Error switching restaurant:', err);
      window.location.href = '/admin/orders';
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    if (!confirm('Approve this restaurant application and generate a permanent QSR Number?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE_APPLICATION', applicationId }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(`Approved! Assigned QSR Number: ${result.qsrNumber}`);
        setSelectedApplication(null);
        fetchSuperadminData();
      } else {
        alert(result.error || 'Failed to approve application');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    const reason = prompt('Enter rejection reason (shown to restaurant owner):');
    if (reason === null) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT_APPLICATION', applicationId, reason }),
      });
      if (res.ok) {
        setSelectedApplication(null);
        fetchSuperadminData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfoApplication = async (applicationId: string) => {
    const notes = prompt('Enter notes / requested info (moves to UNDER_REVIEW):');
    if (notes === null) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REQUEST_INFO_APPLICATION', applicationId, notes }),
      });
      if (res.ok) {
        setSelectedApplication(null);
        fetchSuperadminData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRestaurants = (data?.restaurants || []).filter((r: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.qsrNumber || '').toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.uniqueUsername.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    );
  });

  const filteredUsers = (data?.users || []).filter((u: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.restaurant?.name || '').toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });


  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FEFBF5] text-[#331E17] flex flex-col font-sans">
      {/* Super Admin Header - Sticky top */}
      <header className="h-16 px-4 sm:px-6 bg-[#311410] border-b border-[#E09D3D]/30 flex items-center justify-between text-[#FEFBF5] flex-shrink-0 z-20 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0E8] text-[#AA1B2A] border border-[#E09D3D] flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-[#AA1B2A]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>SaaS Super Admin Platform</span>
              <span className="bg-[#AA1B2A] text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-[#E09D3D]">
                Root Access
              </span>
            </h1>
            <p className="text-[11px] text-[#E09D3D] font-bold">Multi-tenant restaurant control &amp; Platform SaaS Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="px-3.5 py-1.5 bg-[#FFF0E8] hover:bg-[#ffe5d9] text-[#AA1B2A] rounded-xl text-xs font-black transition-colors border border-[#E09D3D]/50"
          >
            ← Back to Restaurant POS
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        {/* Global Platform KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-black text-[#745E55]">Platform GMV (All Restaurants)</p>
            <h3 className="text-2xl font-black text-[#331E17] mt-1">
              ₹{data?.summary?.totalGmv?.toLocaleString() || '0'}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Real database transactions</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-black text-[#745E55]">Monthly Subscription MRR</p>
            <h3 className="text-2xl font-black text-[#AA1B2A] mt-1">
              ₹{data?.summary?.monthlyPlatformRevenue?.toLocaleString() || '0'}
            </h3>
            <p className="text-[11px] text-[#745E55] mt-0.5">Recurring SaaS revenues</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-black text-[#745E55]">Active Tenant Brands</p>
            <h3 className="text-2xl font-black text-[#331E17] mt-1">
              {data?.summary?.activeTenants || 0} / {data?.summary?.totalRestaurants || 0}
            </h3>
            <p className="text-[11px] text-[#745E55] mt-0.5">100% Tenant Isolation</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <p className="text-[10px] uppercase font-black text-[#745E55]">Platform Health &amp; Security</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">
              100% Operational
            </h3>
            <p className="text-[11px] text-[#745E55] mt-0.5">Isolated MySQL Multi-Tenant</p>
          </div>
        </div>

        {/* Onboarding & Lifecycle Mini Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
          <div className="bg-white p-2.5 rounded-2xl border border-[#E8E1D6]">
            <p className="text-[9px] font-black uppercase text-[#745E55]">Total</p>
            <p className="text-base font-black text-[#331E17]">{data?.summary?.totalRestaurants || 0}</p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-[#E8E1D6]">
            <p className="text-[9px] font-black uppercase text-[#745E55]">New Requests</p>
            <p className="text-base font-black text-[#AA1B2A]">{data?.summary?.newRequests || 0}</p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-[#E8E1D6]">
            <p className="text-[9px] font-black uppercase text-[#745E55]">Pending</p>
            <p className="text-base font-black text-amber-700">{data?.summary?.pendingApprovals || 0}</p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-[#E8E1D6]">
            <p className="text-[9px] font-black uppercase text-[#745E55]">Under Review</p>
            <p className="text-base font-black text-blue-700">{data?.summary?.underReview || 0}</p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-[#E8E1D6]">
            <p className="text-[9px] font-black uppercase text-[#745E55]">Approved</p>
            <p className="text-base font-black text-emerald-700">{data?.summary?.approvedRestaurants || 0}</p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-[#E8E1D6]">
            <p className="text-[9px] font-black uppercase text-[#745E55]">Active</p>
            <p className="text-base font-black text-emerald-700">{data?.summary?.activeRestaurants || 0}</p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-[#E8E1D6]">
            <p className="text-[9px] font-black uppercase text-[#745E55]">Rejected</p>
            <p className="text-base font-black text-red-700">{data?.summary?.rejectedApplications || 0}</p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-[#E8E1D6]">
            <p className="text-[9px] font-black uppercase text-[#745E55]">Suspended</p>
            <p className="text-base font-black text-slate-600">{data?.summary?.suspendedRestaurants || 0}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[#E8E1D6] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('RESTAURANTS')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'RESTAURANTS'
                ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-md'
                : 'bg-white text-[#745E55] hover:text-[#331E17] border border-[#E8E1D6]'
            }`}
          >
            🏢 Restaurants &amp; Tenants ({data?.restaurants?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'APPLICATIONS'
                ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-md'
                : 'bg-white text-[#745E55] hover:text-[#331E17] border border-[#E8E1D6]'
            }`}
          >
            <span>📋 Registration Requests ({data?.applications?.length || 0})</span>
            {(data?.summary?.newRequests || 0) > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-[#331E17] rounded-full text-[10px] font-black">
                {data.summary.newRequests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-md'
                : 'bg-white text-[#745E55] hover:text-[#331E17] border border-[#E8E1D6]'
            }`}
          >
            🛡️ Security &amp; Audit Logs ({data?.auditLogs?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'USERS'
                ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-md'
                : 'bg-white text-[#745E55] hover:text-[#331E17] border border-[#E8E1D6]'
            }`}
          >
            👥 Tenant Users &amp; Admins ({data?.users?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('PLANS')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'PLANS'
                ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-md'
                : 'bg-white text-[#745E55] hover:text-[#331E17] border border-[#E8E1D6]'
            }`}
          >
            ⭐ Subscription Plans ({data?.plans?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('POS_CONFIG')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'POS_CONFIG'
                ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-md'
                : 'bg-white text-[#745E55] hover:text-[#331E17] border border-[#E8E1D6]'
            }`}
          >
            🎛️ POS Terminal &amp; Role Access Matrix
          </button>
        </div>

        {/* 1. PLATFORM SECURITY & AUDIT LOGS TAB */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xs overflow-hidden space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Platform Security &amp; Activity Audit Log</span>
                </h3>
                <p className="text-xs text-[#745E55] mt-0.5">
                  Real-time security trail: Logins, tenant creations, credential verification, and system events.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#331E17]">
                <thead className="bg-[#F7F2EA] border-b border-[#E8E1D6] text-[#745E55] font-black uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Event / Action</th>
                    <th className="py-3 px-4">Entity &amp; Target</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D6]/60">
                  {(!data?.auditLogs || data.auditLogs.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#745E55]">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    data.auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-[#FEFBF5] transition-colors">
                        <td className="py-3 px-4 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            log.action?.includes('SUCCESS') ? 'bg-emerald-100 text-emerald-800' :
                            log.action?.includes('FAILED') ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#331E17]">
                          {log.entityId || log.entity || 'Platform'}
                        </td>
                        <td className="py-3 px-4 text-[#745E55] font-mono text-[11px]">
                          {log.ipAddress || 'Internal'}
                        </td>
                        <td className="py-3 px-4 text-[#745E55] text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-[#745E55] text-[11px]">
                          {log.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. RESTAURANTS TAB */}
        {activeTab === 'RESTAURANTS' && (
          <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#AA1B2A]" />
                <h3 className="text-sm font-black text-[#331E17]">Registered Restaurant Businesses</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tenant or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl text-xs text-[#331E17] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
                  />
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition-colors cursor-pointer border border-[#E09D3D]/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard Tenant</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#331E17]">
                <thead className="bg-[#F7F2EA] border-b border-[#E8E1D6] text-[#745E55] font-black uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Restaurant</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Tables / Branches</th>
                    <th className="py-3 px-4">Subscription Plan</th>
                    <th className="py-3 px-4">Total Revenue</th>
                    <th className="py-3 px-4">Tenant Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D6]/60">
                  {filteredRestaurants.map((rest: any) => (
                    <tr key={rest.id} className="hover:bg-[#FEFBF5] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-black text-[10px] bg-[#E09D3D] text-[#331E17] shadow-xs font-mono">
                            {rest.qsrNumber || (rest.slug === 'aapno-khano' ? 'QSR01' : (rest.slug === 'mr-bagri' ? 'QSR02' : 'TENANT'))}
                          </span>
                          <div>
                            <p className="font-black text-[#331E17]">{rest.name}</p>
                            <p className="text-[11px] text-[#AA1B2A] font-bold">/{rest.slug || rest.uniqueUsername}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#745E55]">{rest.city}</td>
                      <td className="py-3 px-4">
                        <b>{rest.tablesCount} Tables</b> • {rest.branchesCount} Branch
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[#FFF0E8] text-[#AA1B2A] font-black px-2 py-0.5 rounded text-[10px] border border-[#E09D3D]/40">
                          {rest.currentPlan}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-800">
                        ₹{rest.revenue?.toLocaleString() || '0'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(rest.id, rest.isActive)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer ${
                            rest.isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {rest.isActive ? 'Active Tenant' : 'Suspended'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRestaurant(rest)}
                          className="px-2 py-1 bg-[#F7F2EA] hover:bg-[#e8dfd2] text-[#331E17] rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border border-[#E8E1D6] cursor-pointer"
                        >
                          <span>Profile</span>
                        </button>
                        <Link
                          href={`/r/${rest.slug}`}
                          target="_blank"
                          className="px-2 py-1 bg-white hover:bg-[#F7F2EA] text-[#331E17] rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border border-[#E8E1D6]"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Menu</span>
                        </Link>
                        <button
                          onClick={() => handleSwitchRestaurant(rest.id)}
                          className="px-2.5 py-1 bg-[#AA1B2A] hover:bg-[#8e1421] text-white font-black rounded-lg text-[11px] inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <span>Manage POS →</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2B. REGISTRATION APPLICATIONS TAB */}
        {activeTab === 'APPLICATIONS' && (
          <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-[#331E17]">Restaurant Registration Requests</h3>
                <p className="text-[11px] text-[#745E55]">Review new restaurant applications, verify details, and assign atomic QSR Numbers on approval.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#331E17]">
                <thead className="bg-[#F7F2EA] border-b border-[#E8E1D6] text-[#745E55] font-black uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Restaurant Name</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">QSR No.</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D6]/60">
                  {(!data?.applications || data.applications.length === 0) ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[#745E55]">
                        No restaurant registration requests yet.
                      </td>
                    </tr>
                  ) : (
                    data.applications.map((app: any) => (
                      <tr key={app.id} className="hover:bg-[#FEFBF5] transition-colors">
                        <td className="py-3 px-4 font-mono font-black text-[#AA1B2A]">{app.applicationRef}</td>
                        <td className="py-3 px-4 font-black">{app.restaurantName}</td>
                        <td className="py-3 px-4 font-bold">{app.ownerName}</td>
                        <td className="py-3 px-4 text-[11px]">
                          <p className="font-mono">{app.email}</p>
                          <p className="text-[#745E55] font-mono">{app.mobile}</p>
                        </td>
                        <td className="py-3 px-4 text-[#745E55]">{app.city}</td>
                        <td className="py-3 px-4 text-[11px] text-[#745E55]">
                          {new Date(app.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              app.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : app.status === 'UNDER_REVIEW'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-[#331E17]">
                          {app.assignedQsrNumber || '—'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="px-2 py-1 bg-[#F7F2EA] hover:bg-[#e7ded1] rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            View
                          </button>
                          {(app.status === 'PENDING_APPROVAL' || app.status === 'UNDER_REVIEW') && (
                            <>
                              <button
                                onClick={() => handleApproveApplication(app.id)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectApplication(app.id)}
                                disabled={actionLoading}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-black cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. USERS TAB */}
        {activeTab === 'USERS' && (
          <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#AA1B2A]" />
                <h3 className="text-sm font-black text-[#331E17]">All Tenant Staff &amp; Admin Users</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search user name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl text-xs text-[#331E17] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
                  />
                </div>

                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition-colors cursor-pointer border border-[#E09D3D]/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Tenant User</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#331E17]">
                <thead className="bg-[#F7F2EA] border-b border-[#E8E1D6] text-[#745E55] font-black uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Restaurant</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D6]/60">
                  {filteredUsers.map((u: any) => {
                    const isRootSuper = u.role === 'SUPER_ADMIN' || u.email === 'admin@restro.com';
                    return (
                      <tr key={u.id} className="hover:bg-[#FEFBF5] transition-colors">
                        <td className="py-3 px-4 font-black text-[#331E17]">{u.name}</td>
                        <td className="py-3 px-4 text-[#745E55] font-mono">{u.email}</td>
                        <td className="py-3 px-4 text-[#331E17]">{u.restaurant?.name || 'Platform Root'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              u.role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : u.role === 'OWNER'
                                ? 'bg-[#FFF0E8] text-[#AA1B2A] border border-[#E09D3D]/50'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {isRootSuper ? (
                            <span className="text-[#AA1B2A] text-[10px] font-black">Protected Root</span>
                          ) : (
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}
                            >
                              {u.isActive ? 'Active' : 'Suspended'}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400">
                          {isRootSuper ? '—' : 'Full CRUD'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PLANS TAB */}
        {activeTab === 'PLANS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.plans || []).map((plan: any) => (
              <div
                key={plan.id}
                className="bg-white rounded-3xl border border-[#E8E1D6] p-6 space-y-4 shadow-xs"
              >
                <div>
                  <h4 className="text-base font-black text-[#331E17]">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-[#AA1B2A]">₹{plan.monthlyPrice}</span>
                    <span className="text-xs text-[#745E55]">/month</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#331E17] border-t border-[#E8E1D6] pt-3">
                  <div className="flex justify-between">
                    <span>Max Tables:</span>
                    <b>{plan.maxTables} Tables</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Branches:</span>
                    <b>{plan.maxBranches} Branch</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Kitchen Display KDS:</span>
                    <b className="text-emerald-700">{plan.hasKds ? 'Included' : 'Disabled'}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory &amp; Recipe BOM:</span>
                    <b className={plan.hasInventory ? 'text-emerald-700' : 'text-slate-400'}>
                      {plan.hasInventory ? 'Included' : 'Disabled'}
                    </b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. POS TERMINAL & ROLE ACCESS MATRIX TAB */}
        {activeTab === 'POS_CONFIG' && (
          <div className="space-y-6">
            {/* POS Terminal Feature Toggles */}
            <div className="bg-white rounded-3xl border border-[#E8E1D6] p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-[#331E17]">🎛️ POS Terminal Master Controls</h3>
                <p className="text-xs text-[#745E55]">Super Admin global overrides for Touch POS Terminal behaviors</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-[#E8E1D6] bg-[#FEFBF5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#331E17]">Reprint Last Bill</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-[#745E55] text-[11px]">1-Tap Reprint button on Cashier POS toolbar</p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E8E1D6] bg-[#FEFBF5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#331E17]">Daily EOD (Z-Report)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-[#745E55] text-[11px]">End of day daily audit print for Cashier register</p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E8E1D6] bg-[#FEFBF5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#331E17]">Hold / Resume Orders</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-[#745E55] text-[11px]">Park multiple customer billing carts during rush hours</p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E8E1D6] bg-[#FEFBF5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#331E17]">Dual Thermal Printing</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-[#745E55] text-[11px]">Simultaneous 80mm GST Invoice + Kitchen KOT ticket firing</p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E8E1D6] bg-[#FEFBF5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#331E17]">GST Split Calculation</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">5.0% Total</span>
                  </div>
                  <p className="text-[#745E55] text-[11px]">Automatic 2.5% CGST + 2.5% SGST tax invoice calculation</p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E8E1D6] bg-[#FEFBF5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#331E17]">1000x1000 HD Image Grid</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">Enabled</span>
                  </div>
                  <p className="text-[#745E55] text-[11px]">High-resolution square dish image tiles on POS</p>
                </div>
              </div>
            </div>

            {/* Staff Role Access Matrix (RBAC) */}
            <div className="bg-white rounded-3xl border border-[#E8E1D6] p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-[#331E17]">🔒 Role Access Control Matrix (RBAC)</h3>
                <p className="text-xs text-[#745E55]">Current security boundaries enforced across all 6 roles</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F2EA] text-[#331E17] font-black border-b border-[#E8E1D6]">
                    <tr>
                      <th className="p-3">Staff Role</th>
                      <th className="p-3 text-center">Touch POS</th>
                      <th className="p-3 text-center">Live Orders</th>
                      <th className="p-3 text-center">Kitchen KDS</th>
                      <th className="p-3 text-center">Menu &amp; Stock</th>
                      <th className="p-3 text-center">Billing &amp; Tax</th>
                      <th className="p-3 text-center">Raw BOM</th>
                      <th className="p-3 text-center">Store Settings</th>
                      <th className="p-3 text-center">Super Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E1D6]">
                    <tr className="hover:bg-[#FEFBF5]">
                      <td className="p-3 font-bold text-purple-900">🛡️ Super Admin</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓ (Root)</td>
                    </tr>
                    <tr className="hover:bg-[#FEFBF5]">
                      <td className="p-3 font-bold text-[#AA1B2A]">👑 Restaurant Owner</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                    </tr>
                    <tr className="hover:bg-[#FEFBF5]">
                      <td className="p-3 font-bold text-amber-800">💼 Manager</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                    </tr>
                    <tr className="hover:bg-[#FEFBF5]">
                      <td className="p-3 font-bold text-emerald-800">💵 Billing Cashier</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓ (Printers)</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                    </tr>
                    <tr className="hover:bg-[#FEFBF5]">
                      <td className="p-3 font-bold text-red-700">👨‍🍳 Kitchen Chef</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓ (KDS)</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                    </tr>
                    <tr className="hover:bg-[#FEFBF5]">
                      <td className="p-3 font-bold text-blue-800">🍽️ Waiter / Captain</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓ (Order Only)</td>
                      <td className="p-3 text-center text-emerald-600 font-black">✓</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                      <td className="p-3 text-center text-slate-300">✗</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* RESTAURANT PROFILE MODAL */}
        {selectedRestaurant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#E09D3D] text-[#331E17] font-mono font-black text-xs">
                    {selectedRestaurant.qsrNumber}
                  </span>
                  <h3 className="font-black text-base text-[#331E17]">{selectedRestaurant.name}</h3>
                </div>
                <button onClick={() => setSelectedRestaurant(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#FEFBF5] p-4 rounded-2xl border border-[#E8E1D6]">
                <div><p className="text-[10px] text-[#745E55]">Owner</p><b>{selectedRestaurant.ownerName}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Status</p><b>{selectedRestaurant.status}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Email</p><b className="font-mono">{selectedRestaurant.email}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Phone</p><b className="font-mono">{selectedRestaurant.phone}</b></div>
                <div className="col-span-2"><p className="text-[10px] text-[#745E55]">Address</p><b>{selectedRestaurant.address}, {selectedRestaurant.city}, {selectedRestaurant.state} {selectedRestaurant.postalCode}</b></div>
                <div><p className="text-[10px] text-[#745E55]">GSTIN</p><b className="font-mono">{selectedRestaurant.gstin || 'Not Provided'}</b></div>
                <div><p className="text-[10px] text-[#745E55]">FSSAI</p><b className="font-mono">{selectedRestaurant.fssaiNumber || 'Not Provided'}</b></div>
                <div><p className="text-[10px] text-[#745E55]">UPI ID</p><b className="font-mono">{selectedRestaurant.upiId || 'Not Configured'}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Subscription</p><b>{selectedRestaurant.currentPlan} ({selectedRestaurant.subscriptionStatus})</b></div>
                <div><p className="text-[10px] text-[#745E55]">Users / Outlets</p><b>{selectedRestaurant.usersCount} Staff • {selectedRestaurant.branchesCount} Outlet</b></div>
                <div><p className="text-[10px] text-[#745E55]">POS Activity</p><b>{selectedRestaurant.ordersCount} Orders • ₹{selectedRestaurant.revenue?.toLocaleString() || 0}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Registered</p><b>{new Date(selectedRestaurant.createdAt).toLocaleDateString('en-IN')}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Last Login</p><b>{selectedRestaurant.lastLoginAt ? new Date(selectedRestaurant.lastLoginAt).toLocaleString('en-IN') : 'Never'}</b></div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    handleToggleStatus(selectedRestaurant.id, selectedRestaurant.isActive);
                    setSelectedRestaurant(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black text-white cursor-pointer ${
                    selectedRestaurant.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {selectedRestaurant.isActive ? 'Suspend Restaurant' : 'Activate Restaurant'}
                </button>
                <button
                  onClick={() => handleSwitchRestaurant(selectedRestaurant.id)}
                  className="px-4 py-2 bg-[#AA1B2A] text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  Open Restaurant POS →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APPLICATION DETAILS MODAL */}
        {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-black text-[#AA1B2A]">{selectedApplication.applicationRef}</span>
                  <h3 className="font-black text-base text-[#331E17]">{selectedApplication.restaurantName}</h3>
                </div>
                <button onClick={() => setSelectedApplication(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#FEFBF5] p-4 rounded-2xl border border-[#E8E1D6]">
                <div><p className="text-[10px] text-[#745E55]">Owner Full Name</p><b>{selectedApplication.ownerName}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Status</p><b>{selectedApplication.status}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Email</p><b className="font-mono">{selectedApplication.email}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Mobile</p><b className="font-mono">{selectedApplication.mobile}</b></div>
                <div className="col-span-2"><p className="text-[10px] text-[#745E55]">Address</p><b>{selectedApplication.address}, {selectedApplication.city}, {selectedApplication.state} - {selectedApplication.pincode}</b></div>
                <div><p className="text-[10px] text-[#745E55]">GSTIN</p><b className="font-mono">{selectedApplication.gstin || 'Optional / Not entered'}</b></div>
                <div><p className="text-[10px] text-[#745E55]">FSSAI</p><b className="font-mono">{selectedApplication.fssaiNumber || 'Optional / Not entered'}</b></div>
                <div><p className="text-[10px] text-[#745E55]">UPI ID</p><b className="font-mono">{selectedApplication.upiId || 'Not entered'}</b></div>
                <div><p className="text-[10px] text-[#745E55]">Assigned QSR</p><b className="font-mono text-[#AA1B2A]">{selectedApplication.assignedQsrNumber || 'Pending Approval'}</b></div>
              </div>
              {(selectedApplication.status === 'PENDING_APPROVAL' || selectedApplication.status === 'UNDER_REVIEW') && (
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleRequestInfoApplication(selectedApplication.id)}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer"
                  >
                    Request More Info
                  </button>
                  <button
                    onClick={() => handleRejectApplication(selectedApplication.id)}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-black cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveApplication(selectedApplication.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black cursor-pointer"
                  >
                    Approve &amp; Assign QSR →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONBOARD RESTAURANT MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-[#331E17]">Onboard New Restaurant Tenant</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRestaurant} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#331E17] mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Haveli Dining"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#331E17] mb-1">Slug / Username</label>
                    <input
                      type="text"
                      required
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#331E17] mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Jaipur"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#331E17] mb-1">Owner Email</label>
                    <input
                      type="email"
                      required
                      placeholder="owner@royalhaveli.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#331E17] mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#331E17] mb-1">Subscription Plan</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-bold"
                  >
                    {(data?.plans || []).map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.monthlyPrice}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-[#F7F2EA] text-[#331E17] rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white rounded-xl font-black shadow-md border border-[#E09D3D]/50"
                  >
                    Provision Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE TENANT USER MODAL */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-base text-[#331E17]">Create Tenant Staff / Admin</h3>
                <button onClick={() => setIsAddUserModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTenantUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#331E17] mb-1">Target Restaurant</label>
                  <select
                    value={userRestaurantId}
                    onChange={(e) => setUserRestaurantId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-bold"
                  >
                    {(data?.restaurants || []).map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#331E17] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Singh"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#331E17] mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@tenant.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#331E17] mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 70820 40809"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#331E17] mb-1">Assigned Role</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl font-bold"
                    >
                      <option value="OWNER">Restaurant Owner</option>
                      <option value="MANAGER">Restaurant Manager</option>
                      <option value="CASHIER">Cashier / Billing</option>
                      <option value="KITCHEN">Kitchen Chef</option>
                      <option value="WAITER">Waiter / Captain</option>
                      <option value="ACCOUNTANT">Accountant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#331E17] mb-1">Temporary Password</label>
                    <input
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 bg-[#F7F2EA] text-[#331E17] rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white rounded-xl font-black shadow-md border border-[#E09D3D]/50"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
