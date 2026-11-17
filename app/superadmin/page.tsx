'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SuperAdminSecondaryModules from '@/components/superadmin/SuperAdminSecondaryModules';
import {
  LayoutDashboard,
  Building2,
  Store,
  Users,
  Monitor,
  Receipt,
  UtensilsCrossed,
  Package,
  CreditCard,
  Headphones,
  ClipboardList,
  BookOpen,
  BarChart3,
  Megaphone,
  Bell,
  ShieldCheck,
  Activity,
  Settings,
  Search,
  Plus,
  ExternalLink,
  X,
  LogOut,
  Menu,
  Zap,
  Crown,
  KeyRound,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type SectionId =
  | 'DASHBOARD'
  | 'RESTAURANTS'
  | 'OUTLETS'
  | 'USERS'
  | 'TERMINALS'
  | 'ORDERS'
  | 'MENU'
  | 'INVENTORY'
  | 'PLANS'
  | 'PAYMENTS'
  | 'TICKETS'
  | 'APPLICATIONS'
  | 'HELP'
  | 'REPORTS'
  | 'ANNOUNCEMENTS'
  | 'NOTIFICATIONS'
  | 'AUDIT_LOGS'
  | 'MONITORING'
  | 'SETTINGS';

export default function SuperAdminPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<'TODAY' | 'YESTERDAY' | '7D' | '30D' | 'MONTH' | 'CUSTOM'>('7D');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAssignPlanModalOpen, setIsAssignPlanModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  // New Restaurant Onboarding state
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('Panchkula');
  const [newAddress, setNewAddress] = useState('Main Commercial Market');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // New User state
  const [userRestaurantId, setUserRestaurantId] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('MANAGER');
  const [userPassword, setUserPassword] = useState('Staff@123');

  // New Plan & Assign Plan state
  const [planForm, setPlanForm] = useState({ name: '', monthlyPrice: '2499', yearlyPrice: '24990', maxBranches: '2', maxTables: '25' });
  const [assignForm, setAssignForm] = useState({ restaurantId: '', planId: '', status: 'ACTIVE', days: '30' });

  const fetchSuperadminData = async (rangeOverride?: string) => {
    try {
      setLoading(true);
      const r = rangeOverride || dateRange;
      const params = new URLSearchParams({ range: r });
      if (r === 'CUSTOM' && customFrom) params.set('from', customFrom);
      if (r === 'CUSTOM' && customTo) params.set('to', customTo);

      const res = await fetch(`/api/superadmin?${params.toString()}`);
      if (res.ok) {
        const sData = await res.json();
        if (!sData.error) {
          setData(sData);
          if (sData.plans?.length > 0 && !selectedPlanId) {
            setSelectedPlanId(sData.plans[0].id);
            setAssignForm((p) => ({ ...p, planId: sData.plans[0].id }));
          }
          if (sData.restaurants?.length > 0 && !userRestaurantId) {
            setUserRestaurantId(sData.restaurants[0].id);
            setAssignForm((p) => ({ ...p, restaurantId: sData.restaurants[0].id }));
          }
          return;
        }
      }
      window.location.href = '/login?redirect=/superadmin';
    } catch (err) {
      console.error('Error fetching superadmin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperadminData();
  }, [dateRange]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    if (typeof window !== 'undefined') localStorage.removeItem('auth_session');
    window.location.href = '/login';
  };

  const handleSwitchRestaurant = async (restaurantId: string) => {
    const res = await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SWITCH_RESTAURANT', restaurantId }),
    });
    if (res.ok) {
      window.location.href = '/admin/orders';
    }
  };

  const handleToggleStatus = async (restaurantId: string, currentStatus: boolean) => {
    await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_RESTAURANT_STATUS',
        restaurantId,
        status: currentStatus ? 'SUSPENDED' : 'ACTIVE',
      }),
    });
    fetchSuperadminData();
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TOGGLE_USER_STATUS', userId, isActive: !currentStatus }),
    });
    fetchSuperadminData();
  };

  const handleResetUserPassword = async (userId: string, email: string) => {
    const newPassword = prompt(`Enter new temporary password for ${email}:`, 'Reset@123');
    if (!newPassword) return;
    const res = await fetch('/api/superadmin/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET_USER_PASSWORD', userId, newPassword }),
    });
    if (res.ok) alert(`Password updated for ${email}. Existing sessions revoked.`);
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/superadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_RESTAURANT',
        name: newName,
        uniqueUsername: newSlug || newName,
        phone: newPhone,
        email: newEmail,
        city: newCity,
        address: newAddress,
        ownerName: `${newName} Owner`,
        ownerPassword: 'Owner@123',
      }),
    });
    const out = await res.json();
    if (res.ok && out.success) {
      alert(`Restaurant Created! Assigned QSR Number: ${out.restaurant?.qsrNumber}`);
      setIsAddModalOpen(false);
      setNewName('');
      setNewSlug('');
      setNewPhone('');
      setNewEmail('');
      fetchSuperadminData();
    } else {
      alert(out.error || 'Failed to create restaurant');
    }
  };

  const handleCreateTenantUser = async (e: React.FormEvent) => {
    e.preventDefault();
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
    const out = await res.json();
    if (res.ok && out.success) {
      setIsAddUserModalOpen(false);
      setUserName('');
      setUserEmail('');
      setUserPhone('');
      fetchSuperadminData();
    } else {
      alert(out.error || 'Failed to create user');
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    if (!confirm('Approve this restaurant application and allocate a permanent QSR Number?')) return;
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
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    setActionLoading(true);
    try {
      await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT_APPLICATION', applicationId, reason }),
      });
      setSelectedApplication(null);
      fetchSuperadminData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfoApplication = async (applicationId: string) => {
    const notes = prompt('Enter requested info / review notes:');
    if (notes === null) return;
    setActionLoading(true);
    try {
      await fetch('/api/superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REQUEST_INFO_APPLICATION', applicationId, notes }),
      });
      setSelectedApplication(null);
      fetchSuperadminData();
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
      r.city.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
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

  // Navigation Items (All 19 sections)
  const navItems: Array<{ id: SectionId; label: string; icon: any; badge?: number }> = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'RESTAURANTS', label: 'Restaurants', icon: Building2 },
    { id: 'OUTLETS', label: 'Outlets', icon: Store },
    { id: 'USERS', label: 'Users & Roles', icon: Users },
    { id: 'TERMINALS', label: 'POS Terminals', icon: Monitor },
    { id: 'ORDERS', label: 'Orders & Billing', icon: Receipt },
    { id: 'MENU', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'INVENTORY', label: 'Inventory', icon: Package },
    { id: 'PLANS', label: 'Subscriptions', icon: CreditCard },
    { id: 'PAYMENTS', label: 'Payments', icon: CreditCard },
    { id: 'TICKETS', label: 'Support & Tickets', icon: Headphones, badge: data?.summary?.openTicketsCount || 0 },
    { id: 'APPLICATIONS', label: 'Onboarding & Requests', icon: ClipboardList, badge: data?.summary?.newRequests || 0 },
    { id: 'HELP', label: 'Help & Training', icon: BookOpen },
    { id: 'REPORTS', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'ANNOUNCEMENTS', label: 'Announcements', icon: Megaphone },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
    { id: 'AUDIT_LOGS', label: 'Security & Audit Logs', icon: ShieldCheck },
    { id: 'MONITORING', label: 'System Monitoring', icon: Activity },
    { id: 'SETTINGS', label: 'System Settings', icon: Settings },
  ];

  const statusChartData = [
    { name: 'Active', value: data?.summary?.activeRestaurants || 0, color: '#16A34A' },
    { name: 'Trial', value: data?.summary?.trialTenants || 0, color: '#E09D3D' },
    { name: 'Suspended / Inactive', value: data?.summary?.suspendedRestaurants || 0, color: '#94A3B8' },
  ].filter((d) => d.value > 0);

  const isSecondarySection = [
    'OUTLETS',
    'TERMINALS',
    'ORDERS',
    'MENU',
    'INVENTORY',
    'PAYMENTS',
    'TICKETS',
    'HELP',
    'ANNOUNCEMENTS',
    'NOTIFICATIONS',
    'REPORTS',
    'MONITORING',
    'SETTINGS',
  ].includes(activeSection);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#FAF5ED] text-[#331E17] flex font-sans">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      {/* LEFT SIDEBAR NAVIGATION (Matching Enterprise Mockup) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E8DFD3] flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Maroon Brand Header - Logo Only */}
        <div className="bg-gradient-to-br from-[#7A101B] to-[#981826] p-4 flex items-center justify-center relative flex-shrink-0">
          <div className="bg-white/95 rounded-2xl px-3 py-1.5 shadow-md">
            <img src="/images/aapno-khano-login-logo.png" alt="Aapno Khaano" className="h-12 w-auto object-contain" />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white absolute right-3 top-3">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#8E1521] to-[#AE1D2B] text-white shadow-sm'
                    : 'text-[#5C463E] hover:bg-[#FAF5ED] hover:text-[#8E1521]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#F5D28C]' : 'text-[#8E7368]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${active ? 'bg-white text-[#8E1521]' : 'bg-[#8E1521] text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sign Out & Copyright */}
        <div className="p-3 border-t border-[#E8DFD3] space-y-2 flex-shrink-0 bg-[#FCF9F4]">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-red-50 text-[#8E1521] border border-[#E8DFD3] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <p className="text-[10px] text-center text-[#745E55]">
            © 2026 <a href="https://rudrawebx.com/" target="_blank" rel="noreferrer" className="font-bold text-[#8E1521] hover:underline">Rudra Web X</a>
          </p>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-[#E8DFD3] px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-[#FAF5ED] text-[#331E17]">
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-[#2B1810] truncate">
                {navItems.find((n) => n.id === activeSection)?.label || 'Super Admin Dashboard'}
              </h1>
              <p className="text-[11px] text-[#745E55] hidden sm:block truncate">
                Manage restaurants, POS, orders, support, and platform settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64">
              <Search className="w-3.5 h-3.5 text-[#8E7368] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search QSR, restaurant, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-2 bg-[#FAF5ED] border border-[#E3D8C8] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#8E1521]"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8E7368] bg-white px-1.5 py-0.5 rounded border border-[#E3D8C8]">⌘K</span>
            </div>

            <button
              onClick={() => setActiveSection('APPLICATIONS')}
              className="relative p-2 rounded-xl bg-[#FAF5ED] border border-[#E3D8C8] text-[#331E17] cursor-pointer"
              title="Registration Requests"
            >
              <Bell className="w-4 h-4" />
              {(data?.summary?.newRequests || 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8E1521] text-white text-[9px] font-black flex items-center justify-center">
                  {data.summary.newRequests}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-[#E8DFD3]">
              <div className="w-8 h-8 rounded-full bg-[#8E1521] text-white font-black text-xs flex items-center justify-center">SA</div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-[#2B1810] leading-none">Vinod (Super Admin)</p>
                <p className="text-[10px] text-[#745E55]">vinod@aapnokhano.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {loading && !data ? (
            <div className="bg-white rounded-3xl p-10 text-center text-xs font-bold text-[#745E55] border border-[#E8DFD3]">
              Loading live Super Admin Control Center...
            </div>
          ) : (
            <>
              {/* 1. DASHBOARD OVERVIEW (Matching Mockup Layout + Real DB Data) */}
              {activeSection === 'DASHBOARD' && (
                <div className="space-y-5">
                  {/* Date Range Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#E8DFD3] text-[11px] font-bold">
                      {(['TODAY', 'YESTERDAY', '7D', '30D', 'MONTH', 'CUSTOM'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setDateRange(r)}
                          className={`px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${
                            dateRange === r ? 'bg-[#8E1521] text-white' : 'text-[#5C463E] hover:bg-[#FAF5ED]'
                          }`}
                        >
                          {r === '7D' ? 'Last 7 Days' : r === '30D' ? 'Last 30 Days' : r === 'MONTH' ? 'This Month' : r}
                        </button>
                      ))}
                    </div>

                    {dateRange === 'CUSTOM' && (
                      <div className="flex items-center gap-2 text-xs">
                        <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="px-2.5 py-1.5 bg-white border border-[#E3D8C8] rounded-xl" />
                        <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="px-2.5 py-1.5 bg-white border border-[#E3D8C8] rounded-xl" />
                        <button onClick={() => fetchSuperadminData('CUSTOM')} className="px-3 py-1.5 bg-[#8E1521] text-white font-bold rounded-xl cursor-pointer">Apply</button>
                      </div>
                    )}
                  </div>

                  {/* Top 4 Pastel-Tinted KPI Cards (Matching Mockup) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-[#FFF5F5] to-[#FFE8E8] border border-[#F3D2D2] p-5 rounded-3xl flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-[#745E55] flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#8E1521]" /> Total Restaurants
                        </p>
                        <h3 className="text-3xl font-black text-[#2B1810] mt-1.5">{data?.summary?.totalRestaurants ?? 0}</h3>
                        <p className="text-[11px] font-bold text-emerald-700 mt-1">{data?.summary?.activeRestaurants ?? 0} Active • {data?.summary?.suspendedRestaurants ?? 0} Suspended</p>
                      </div>
                      <Building2 className="w-12 h-12 text-[#8E1521]/15" />
                    </div>

                    <div className="bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border border-[#F5E0A3] p-5 rounded-3xl flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-[#745E55] flex items-center gap-1.5">
                          <Monitor className="w-4 h-4 text-amber-700" /> Active Terminals
                        </p>
                        <h3 className="text-3xl font-black text-[#2B1810] mt-1.5">{data?.summary?.activeTerminals ?? 0}</h3>
                        <p className="text-[11px] font-bold text-amber-800 mt-1">{data?.summary?.totalOutlets ?? 0} Total Outlets</p>
                      </div>
                      <Monitor className="w-12 h-12 text-amber-700/15" />
                    </div>

                    <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0] p-5 rounded-3xl flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-[#745E55] flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 text-emerald-700" /> Total Orders
                        </p>
                        <h3 className="text-3xl font-black text-[#2B1810] mt-1.5">{data?.summary?.totalOrders?.toLocaleString() ?? 0}</h3>
                        <p className="text-[11px] font-bold text-emerald-700 mt-1">{data?.summary?.todayOrdersCount ?? 0} Orders Today</p>
                      </div>
                      <Receipt className="w-12 h-12 text-emerald-700/15" />
                    </div>

                    <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-[#DDD6FE] p-5 rounded-3xl flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-[#745E55]">Today&apos;s Sales (All POS)</p>
                        <h3 className="text-3xl font-black text-[#2B1810] mt-1.5">₹{(data?.summary?.todaySales ?? 0).toLocaleString()}</h3>
                        <p className="text-[11px] font-bold text-indigo-700 mt-1">Range GMV: ₹{(data?.summary?.totalGmv ?? 0).toLocaleString()}</p>
                      </div>
                      <BarChart3 className="w-12 h-12 text-indigo-700/15" />
                    </div>
                  </div>

                  {/* Secondary Real-Time KPI Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                    <div className="bg-white p-3 rounded-2xl border border-[#E8DFD3]">
                      <p className="text-[10px] font-black uppercase text-[#745E55]">Pending Approvals</p>
                      <p className="text-lg font-black text-amber-700">{data?.summary?.pendingApprovals ?? 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-[#E8DFD3]">
                      <p className="text-[10px] font-black uppercase text-[#745E55]">Active Subs</p>
                      <p className="text-lg font-black text-emerald-700">{data?.summary?.activeSubscriptions ?? 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-[#E8DFD3]">
                      <p className="text-[10px] font-black uppercase text-[#745E55]">Expiring Subs</p>
                      <p className="text-lg font-black text-red-700">{data?.summary?.expiringSubscriptions ?? 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-[#E8DFD3]">
                      <p className="text-[10px] font-black uppercase text-[#745E55]">Platform MRR</p>
                      <p className="text-lg font-black text-[#8E1521]">₹{(data?.summary?.monthlyPlatformRevenue ?? 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-[#E8DFD3]">
                      <p className="text-[10px] font-black uppercase text-[#745E55]">Open Tickets</p>
                      <p className="text-lg font-black text-[#8E1521]">{data?.summary?.openTicketsCount ?? 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-[#E8DFD3]">
                      <p className="text-[10px] font-black uppercase text-[#745E55]">Pending Payments</p>
                      <p className="text-lg font-black text-amber-700">{data?.summary?.pendingPayments ?? 0}</p>
                    </div>
                  </div>

                  {/* Middle Row: Sales Overview Chart + Donut Status + Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Sales Overview AreaChart */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-[#2B1810]">Sales Overview</h3>
                        <span className="text-[11px] font-bold text-[#8E1521] bg-[#FFF0E8] px-2.5 py-1 rounded-lg">{dateRange}</span>
                      </div>
                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data?.salesSeries || []}>
                            <defs>
                              <linearGradient id="salesMaroon" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8E1521" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#8E1521" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DC" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#745E55' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#745E55' }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="sales" stroke="#8E1521" strokeWidth={2.5} fill="url(#salesMaroon)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Restaurants by Status Donut Chart */}
                    <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3">
                      <h3 className="text-sm font-black text-[#2B1810]">Restaurants by Status</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-40 h-44 flex-shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={statusChartData.length ? statusChartData : [{ name: 'Active', value: 1, color: '#16A34A' }]} dataKey="value" innerRadius={42} outerRadius={64} paddingAngle={3}>
                                {(statusChartData.length ? statusChartData : [{ color: '#16A34A' }]).map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 text-xs flex-1">
                          <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />Active</span><b>{data?.summary?.activeRestaurants ?? 0}</b></div>
                          <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E09D3D]" />Trial</span><b>{data?.summary?.trialTenants ?? 0}</b></div>
                          <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" />Suspended</span><b>{data?.summary?.suspendedRestaurants ?? 0}</b></div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="lg:col-span-3 bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-2.5">
                      <h3 className="text-sm font-black text-[#2B1810] flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#E09D3D]" /> Quick Actions</h3>
                      <button onClick={() => setIsAddModalOpen(true)} className="w-full py-2.5 px-3 bg-gradient-to-r from-[#8E1521] to-[#AE1D2B] text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer">
                        <Plus className="w-4 h-4" /> Add New Restaurant
                      </button>
                      <button onClick={() => setIsAddUserModalOpen(true)} className="w-full py-2 px-3 bg-[#FAF5ED] hover:bg-[#F0E6D6] text-[#331E17] rounded-xl text-xs font-bold flex items-center gap-2 border border-[#E8DFD3] cursor-pointer">
                        <Users className="w-4 h-4 text-[#8E1521]" /> Create User / Staff
                      </button>
                      <button onClick={() => setActiveSection('ANNOUNCEMENTS')} className="w-full py-2 px-3 bg-[#FAF5ED] hover:bg-[#F0E6D6] text-[#331E17] rounded-xl text-xs font-bold flex items-center gap-2 border border-[#E8DFD3] cursor-pointer">
                        <Megaphone className="w-4 h-4 text-[#8E1521]" /> Raise Announcement
                      </button>
                      <button onClick={() => setActiveSection('TICKETS')} className="w-full py-2 px-3 bg-[#FAF5ED] hover:bg-[#F0E6D6] text-[#331E17] rounded-xl text-xs font-bold flex items-center gap-2 border border-[#E8DFD3] cursor-pointer">
                        <Headphones className="w-4 h-4 text-[#8E1521]" /> View Support Tickets
                      </button>
                      <button onClick={() => setActiveSection('PLANS')} className="w-full py-2 px-3 bg-[#FAF5ED] hover:bg-[#F0E6D6] text-[#331E17] rounded-xl text-xs font-bold flex items-center gap-2 border border-[#E8DFD3] cursor-pointer">
                        <CreditCard className="w-4 h-4 text-[#8E1521]" /> Manage Subscription
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Recent Restaurants + Recent Support Tickets */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
                      <div className="p-4 border-b border-[#F0E8DC] flex items-center justify-between">
                        <h3 className="text-sm font-black text-[#2B1810]">Recent Restaurants</h3>
                        <button onClick={() => setActiveSection('RESTAURANTS')} className="text-xs font-black text-[#8E1521] hover:underline cursor-pointer">View All →</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                            <tr>
                              <th className="py-2.5 px-4">Restaurant</th>
                              <th className="py-2.5 px-4">City</th>
                              <th className="py-2.5 px-4">Plan</th>
                              <th className="py-2.5 px-4">Status</th>
                              <th className="py-2.5 px-4">Joined On</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0E8DC]">
                            {(data?.restaurants || []).slice(0, 5).map((r: any) => (
                              <tr key={r.id} className="hover:bg-[#FCF9F4]">
                                <td className="py-2.5 px-4 font-black flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-[#E09D3D] text-[#331E17] font-mono text-[10px]">{r.qsrNumber}</span>
                                  <span>{r.name}</span>
                                </td>
                                <td className="py-2.5 px-4 text-[#745E55]">{r.city}</td>
                                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-[#FFF0E8] text-[#8E1521] font-bold text-[10px]">{r.currentPlan}</span></td>
                                <td className="py-2.5 px-4"><span className={`font-bold ${r.isActive ? 'text-emerald-700' : 'text-red-600'}`}>● {r.isActive ? 'Active' : 'Suspended'}</span></td>
                                <td className="py-2.5 px-4 text-[#745E55]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
                      <div className="p-4 border-b border-[#F0E8DC] flex items-center justify-between">
                        <h3 className="text-sm font-black text-[#2B1810]">Recent Support Tickets</h3>
                        <button onClick={() => setActiveSection('TICKETS')} className="text-xs font-black text-[#8E1521] hover:underline cursor-pointer">View All →</button>
                      </div>
                      <div className="divide-y divide-[#F0E8DC] text-xs">
                        {(!data?.recentTickets || data.recentTickets.length === 0) ? (
                          <div className="p-8 text-center text-[#745E55]">No open support tickets. Platform running smoothly!</div>
                        ) : (
                          data.recentTickets.map((t: any) => (
                            <div key={t.id} className="p-3.5 flex items-center justify-between gap-2">
                              <div>
                                <p className="font-black text-[#2B1810]">#{t.ticketNumber} {t.subject}</p>
                                <p className="text-[11px] text-[#745E55]">{t.category} • {new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px]">{t.status}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. RESTAURANTS TAB */}
              {activeSection === 'RESTAURANTS' && (
                <div className="bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
                  <div className="p-4 border-b border-[#F0E8DC] flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-[#2B1810]">All Registered Restaurants ({filteredRestaurants.length})</h3>
                    <button onClick={() => setIsAddModalOpen(true)} className="px-3.5 py-2 bg-[#8E1521] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add Restaurant
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                        <tr>
                          <th className="py-3 px-4">QSR / Restaurant</th>
                          <th className="py-3 px-4">City</th>
                          <th className="py-3 px-4">Tables / Outlets</th>
                          <th className="py-3 px-4">Plan</th>
                          <th className="py-3 px-4">Revenue</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0E8DC]">
                        {filteredRestaurants.map((rest: any) => (
                          <tr key={rest.id} className="hover:bg-[#FCF9F4]">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-[#E09D3D] text-[#331E17] font-mono font-black text-[10px]">{rest.qsrNumber}</span>
                                <div>
                                  <p className="font-black">{rest.name}</p>
                                  <p className="text-[11px] text-[#8E1521]">/{rest.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#745E55]">{rest.city}</td>
                            <td className="py-3 px-4"><b>{rest.tablesCount}</b> Tables • {rest.branchesCount} Outlet</td>
                            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#FFF0E8] text-[#8E1521] font-black text-[10px]">{rest.currentPlan}</span></td>
                            <td className="py-3 px-4 font-black text-emerald-800">₹{rest.revenue?.toLocaleString() || 0}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleStatus(rest.id, rest.isActive)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer ${rest.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                              >
                                {rest.isActive ? 'Active' : 'Suspended'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button onClick={() => setSelectedRestaurant(rest)} className="px-2.5 py-1 bg-[#FAF5ED] rounded-lg font-bold border border-[#E8DFD3] cursor-pointer">Profile</button>
                              <Link href={`/r/${rest.slug}`} target="_blank" className="px-2.5 py-1 bg-white rounded-lg font-bold border border-[#E8DFD3] inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />Menu</Link>
                              <button onClick={() => handleSwitchRestaurant(rest.id)} className="px-2.5 py-1 bg-[#8E1521] text-white rounded-lg font-black cursor-pointer">Manage POS →</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. REGISTRATION APPLICATIONS */}
              {activeSection === 'APPLICATIONS' && (
                <div className="bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
                  <div className="p-4 border-b border-[#F0E8DC]">
                    <h3 className="text-sm font-black text-[#2B1810]">Restaurant Registration Requests ({data?.applications?.length || 0})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                        <tr>
                          <th className="py-3 px-4">Application ID</th>
                          <th className="py-3 px-4">Restaurant</th>
                          <th className="py-3 px-4">Owner</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">City</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">QSR No.</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0E8DC]">
                        {(!data?.applications || data.applications.length === 0) ? (
                          <tr><td colSpan={8} className="py-8 text-center text-[#745E55]">No registration requests yet.</td></tr>
                        ) : (
                          data.applications.map((app: any) => (
                            <tr key={app.id}>
                              <td className="py-3 px-4 font-mono font-black text-[#8E1521]">{app.applicationRef}</td>
                              <td className="py-3 px-4 font-black">{app.restaurantName}</td>
                              <td className="py-3 px-4">{app.ownerName}</td>
                              <td className="py-3 px-4 font-mono text-[11px]">{app.email} • {app.mobile}</td>
                              <td className="py-3 px-4">{app.city}</td>
                              <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px]">{app.status}</span></td>
                              <td className="py-3 px-4 font-mono font-black">{app.assignedQsrNumber || '—'}</td>
                              <td className="py-3 px-4 text-right space-x-1.5">
                                <button onClick={() => setSelectedApplication(app)} className="px-2.5 py-1 bg-[#FAF5ED] rounded-lg font-bold cursor-pointer">View</button>
                                {(app.status === 'PENDING_APPROVAL' || app.status === 'UNDER_REVIEW') && (
                                  <button onClick={() => handleApproveApplication(app.id)} disabled={actionLoading} className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-black cursor-pointer">Approve</button>
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

              {/* 4. USERS & ROLES */}
              {activeSection === 'USERS' && (
                <div className="bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
                  <div className="p-4 border-b border-[#F0E8DC] flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#2B1810]">Users &amp; Role Access ({filteredUsers.length})</h3>
                    <button onClick={() => setIsAddUserModalOpen(true)} className="px-3.5 py-2 bg-[#8E1521] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Create User
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                        <tr>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Restaurant</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Last Login</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Security</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0E8DC]">
                        {filteredUsers.map((u: any) => {
                          const isRoot = u.role === 'SUPER_ADMIN';
                          return (
                            <tr key={u.id}>
                              <td className="py-3 px-4 font-black">{u.name}</td>
                              <td className="py-3 px-4 font-mono">{u.email}</td>
                              <td className="py-3 px-4">{u.restaurant?.qsrNumber || 'ROOT'} • {u.restaurant?.name || 'Platform'}</td>
                              <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#FFF0E8] text-[#8E1521] font-black text-[10px]">{u.role}</span></td>
                              <td className="py-3 px-4 text-[11px] text-[#745E55]">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : '—'}</td>
                              <td className="py-3 px-4">
                                {isRoot ? (
                                  <span className="text-[10px] font-black text-[#8E1521]">Protected</span>
                                ) : (
                                  <button onClick={() => handleToggleUserStatus(u.id, u.isActive)} className={`px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    {u.isActive ? 'Active' : 'Disabled'}
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {!isRoot && (
                                  <button onClick={() => handleResetUserPassword(u.id, u.email)} className="px-2.5 py-1 bg-[#FAF5ED] border border-[#E8DFD3] rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer">
                                    <KeyRound className="w-3 h-3" /> Reset Pwd
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. SUBSCRIPTIONS & PLANS */}
              {activeSection === 'PLANS' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-[#2B1810]">Subscription Plans &amp; Tenant Assignments</h3>
                    <div className="flex gap-2">
                      <button onClick={() => setIsAssignPlanModalOpen(true)} className="px-3.5 py-2 bg-[#FAF5ED] border border-[#E8DFD3] text-[#331E17] rounded-xl text-xs font-black cursor-pointer">Assign Plan to Restaurant</button>
                      <button onClick={() => setIsPlanModalOpen(true)} className="px-3.5 py-2 bg-[#8E1521] text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Create Plan</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(data?.plans || []).map((plan: any) => (
                      <div key={plan.id} className="bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3">
                        <h4 className="font-black text-base">{plan.name}</h4>
                        <p className="text-2xl font-black text-[#8E1521]">₹{plan.monthlyPrice}<span className="text-xs text-[#745E55] font-normal">/mo</span></p>
                        <div className="text-xs space-y-1 border-t border-[#F0E8DC] pt-3">
                          <p>Max Tables: <b>{plan.maxTables}</b></p>
                          <p>Max Branches: <b>{plan.maxBranches}</b></p>
                          <p>KDS &amp; Inventory: <b className="text-emerald-700">Included</b></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. SECURITY & AUDIT LOGS */}
              {activeSection === 'AUDIT_LOGS' && (
                <div className="bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
                  <div className="p-4 border-b border-[#F0E8DC]">
                    <h3 className="text-sm font-black text-[#2B1810]">Immutable Platform Security &amp; Audit Trail</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                        <tr>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Actor</th>
                          <th className="py-3 px-4">Target</th>
                          <th className="py-3 px-4">IP Address</th>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0E8DC]">
                        {(data?.auditLogs || []).map((log: any) => (
                          <tr key={log.id}>
                            <td className="py-2.5 px-4 font-mono font-black text-[#8E1521]">{log.action}</td>
                            <td className="py-2.5 px-4 font-bold">{log.userName || 'System'}</td>
                            <td className="py-2.5 px-4">{log.entityId || log.entity}</td>
                            <td className="py-2.5 px-4 font-mono text-[11px]">{log.ipAddress || 'Internal'}</td>
                            <td className="py-2.5 px-4 text-[11px] text-[#745E55]">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                            <td className="py-2.5 px-4 text-[#745E55]">{log.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7. ALL SECONDARY ENTERPRISE MODULES */}
              {isSecondarySection && (
                <SuperAdminSecondaryModules
                  activeSection={activeSection}
                  restaurants={data?.restaurants || []}
                  summary={data?.summary || {}}
                  plans={data?.plans || []}
                  onRefreshParent={() => fetchSuperadminData()}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#E09D3D] font-mono font-black text-xs">{selectedRestaurant.qsrNumber}</span>
                <h3 className="font-black text-base">{selectedRestaurant.name}</h3>
              </div>
              <button onClick={() => setSelectedRestaurant(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FCF9F4] p-4 rounded-2xl border border-[#E8DFD3]">
              <div><p className="text-[10px] text-[#745E55]">Owner</p><b>{selectedRestaurant.ownerName}</b></div>
              <div><p className="text-[10px] text-[#745E55]">Status</p><b>{selectedRestaurant.status}</b></div>
              <div><p className="text-[10px] text-[#745E55]">Email</p><b className="font-mono">{selectedRestaurant.email}</b></div>
              <div><p className="text-[10px] text-[#745E55]">Phone</p><b className="font-mono">{selectedRestaurant.phone}</b></div>
              <div className="col-span-2"><p className="text-[10px] text-[#745E55]">Address</p><b>{selectedRestaurant.address}, {selectedRestaurant.city}, {selectedRestaurant.state} {selectedRestaurant.postalCode}</b></div>
              <div><p className="text-[10px] text-[#745E55]">GSTIN</p><b className="font-mono">{selectedRestaurant.gstin || 'Not Provided'}</b></div>
              <div><p className="text-[10px] text-[#745E55]">FSSAI</p><b className="font-mono">{selectedRestaurant.fssaiNumber || 'Not Provided'}</b></div>
              <div><p className="text-[10px] text-[#745E55]">UPI ID</p><b className="font-mono">{selectedRestaurant.upiId || 'Not Configured'}</b></div>
              <div><p className="text-[10px] text-[#745E55]">POS Activity</p><b>{selectedRestaurant.ordersCount} Orders • ₹{selectedRestaurant.revenue}</b></div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { handleToggleStatus(selectedRestaurant.id, selectedRestaurant.isActive); setSelectedRestaurant(null); }} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black cursor-pointer">
                {selectedRestaurant.isActive ? 'Suspend' : 'Activate'}
              </button>
              <button onClick={() => handleSwitchRestaurant(selectedRestaurant.id)} className="px-4 py-2 bg-[#8E1521] text-white rounded-xl text-xs font-black cursor-pointer">Open POS →</button>
            </div>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-mono font-black text-[#8E1521]">{selectedApplication.applicationRef}</span>
                <h3 className="font-black text-base">{selectedApplication.restaurantName}</h3>
              </div>
              <button onClick={() => setSelectedApplication(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FCF9F4] p-4 rounded-2xl border border-[#E8DFD3]">
              <div><p className="text-[10px] text-[#745E55]">Owner</p><b>{selectedApplication.ownerName}</b></div>
              <div><p className="text-[10px] text-[#745E55]">Status</p><b>{selectedApplication.status}</b></div>
              <div><p className="text-[10px] text-[#745E55]">Email</p><b className="font-mono">{selectedApplication.email}</b></div>
              <div><p className="text-[10px] text-[#745E55]">Mobile</p><b className="font-mono">{selectedApplication.mobile}</b></div>
              <div className="col-span-2"><p className="text-[10px] text-[#745E55]">Address</p><b>{selectedApplication.address}, {selectedApplication.city}, {selectedApplication.state} - {selectedApplication.pincode}</b></div>
            </div>
            {(selectedApplication.status === 'PENDING_APPROVAL' || selectedApplication.status === 'UNDER_REVIEW') && (
              <div className="flex justify-end gap-2">
                <button onClick={() => handleRequestInfoApplication(selectedApplication.id)} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer">Request Info</button>
                <button onClick={() => handleRejectApplication(selectedApplication.id)} className="px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-black cursor-pointer">Reject</button>
                <button onClick={() => handleApproveApplication(selectedApplication.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black cursor-pointer">Approve &amp; Assign QSR</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base">Add New Restaurant</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateRestaurant} className="space-y-3 text-xs">
              <input required placeholder="Restaurant Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold" />
              <input required type="email" placeholder="Owner Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
              <input required placeholder="Mobile Number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="City" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
                <input required placeholder="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#8E1521] text-white rounded-xl font-black cursor-pointer">Create &amp; Assign QSR Number</button>
            </form>
          </div>
        </div>
      )}

      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base">Create User / Staff</h3>
              <button onClick={() => setIsAddUserModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateTenantUser} className="space-y-3 text-xs">
              <select value={userRestaurantId} onChange={(e) => setUserRestaurantId(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold">
                {(data?.restaurants || []).map((r: any) => (<option key={r.id} value={r.id}>{r.qsrNumber} — {r.name}</option>))}
              </select>
              <input required placeholder="Full Name" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
              <input required type="email" placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
              <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold">
                <option value="OWNER">Restaurant Owner</option>
                <option value="MANAGER">Restaurant Manager</option>
                <option value="CASHIER">Cashier</option>
                <option value="KITCHEN">Chef / Kitchen</option>
                <option value="WAITER">Waiter / Captain</option>
                <option value="ACCOUNTANT">Accountant</option>
              </select>
              <input required type="password" placeholder="Password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
              <button type="submit" className="w-full py-2.5 bg-[#8E1521] text-white rounded-xl font-black cursor-pointer">Create User</button>
            </form>
          </div>
        </div>
      )}

      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base">Create Subscription Plan</h3>
              <button onClick={() => setIsPlanModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch('/api/superadmin/modules', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'CREATE_PLAN', ...planForm }),
                });
                if (res.ok) { setIsPlanModalOpen(false); fetchSuperadminData(); }
              }}
              className="space-y-3 text-xs"
            >
              <input required placeholder="Plan Name (e.g. Enterprise Pro)" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold" />
              <div className="grid grid-cols-2 gap-2">
                <input required type="number" placeholder="Monthly Price (₹)" value={planForm.monthlyPrice} onChange={(e) => setPlanForm({ ...planForm, monthlyPrice: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
                <input required type="number" placeholder="Max Tables" value={planForm.maxTables} onChange={(e) => setPlanForm({ ...planForm, maxTables: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#8E1521] text-white rounded-xl font-black cursor-pointer">Save Plan</button>
            </form>
          </div>
        </div>
      )}

      {isAssignPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-2 border-[#E09D3D] rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base">Assign Subscription to Restaurant</h3>
              <button onClick={() => setIsAssignPlanModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch('/api/superadmin/modules', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'ASSIGN_SUBSCRIPTION', ...assignForm }),
                });
                if (res.ok) { setIsAssignPlanModalOpen(false); fetchSuperadminData(); }
              }}
              className="space-y-3 text-xs"
            >
              <select value={assignForm.restaurantId} onChange={(e) => setAssignForm({ ...assignForm, restaurantId: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold">
                {(data?.restaurants || []).map((r: any) => (<option key={r.id} value={r.id}>{r.qsrNumber} — {r.name}</option>))}
              </select>
              <select value={assignForm.planId} onChange={(e) => setAssignForm({ ...assignForm, planId: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold">
                {(data?.plans || []).map((p: any) => (<option key={p.id} value={p.id}>{p.name} (₹{p.monthlyPrice}/mo)</option>))}
              </select>
              <select value={assignForm.status} onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl">
                <option value="ACTIVE">ACTIVE</option>
                <option value="TRIAL">TRIAL</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
              <button type="submit" className="w-full py-2.5 bg-[#8E1521] text-white rounded-xl font-black cursor-pointer">Assign Subscription</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
