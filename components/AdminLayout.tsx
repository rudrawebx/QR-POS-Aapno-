'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import {
  Flame,
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  Receipt,
  UtensilsCrossed,
  Package,
  Users,
  Settings,
  ShieldAlert,
  Menu,
  X,
  Store,
  DollarSign,
  TrendingUp,
  CreditCard,
  QrCode,
  Calendar,
  Sparkles,
  Car,
  Printer,
  ChevronRight,
  Bell,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function playChimeSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Chime Tone 1 (High bell)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Chime Tone 2 (Mid bell)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5
    gain2.gain.setValueAtTime(0.35, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);

    // Chime Tone 3 (Peak Royal bell)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(1046.50, now + 0.3); // C6
    gain3.gain.setValueAtTime(0.4, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.3);
    osc3.stop(now + 0.9);
  } catch (e) {
    console.warn("Chime playback error:", e);
  }
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<any | null>(null);
  const seenOrderIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialLoadRef = React.useRef(true);

  // Helper to ensure chime/popup ONLY triggers on Customer QR orders, NOT POS cashier punches
  const isQrCustomerOrder = (ord: any, sourceHint?: string) => {
    if (!ord) return false;
    const src = ord.source || sourceHint || '';
    if (src === 'POS_TERMINAL' || src === 'POS' || ord.isStaffCashConfirmed || ord.takenByStaffId) {
      return false;
    }
    if (src === 'QR_MENU' || src === 'QR_DIRECT' || src === 'QR_TABLE') {
      return true;
    }
    return Boolean(ord.orderType === 'QR_TABLE' || (!ord.takenByStaffId && !ord.isStaffCashConfirmed));
  };

  // Real-time Live QR Order Listener (Sound chime & popup ONLY for Customer QR Menu orders)
  useEffect(() => {
    async function checkLatestOrders() {
      try {
        const res = await fetch('/api/orders?range=TODAY');
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          if (isInitialLoadRef.current) {
            data.orders.forEach((o: any) => {
              if (o.id) seenOrderIdsRef.current.add(o.id);
              if (o.humanOrderId) seenOrderIdsRef.current.add(o.humanOrderId);
            });
            isInitialLoadRef.current = false;
          } else {
            for (const ord of data.orders) {
              const ordKey = ord.id || ord.humanOrderId;
              if (ordKey && !seenOrderIdsRef.current.has(ordKey)) {
                seenOrderIdsRef.current.add(ordKey);
                // Trigger notification sound and banner ONLY if order is from QR
                if (isQrCustomerOrder(ord)) {
                  playChimeSound();
                  setNewOrderAlert(ord);
                  break;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Live order check error:", err);
      }
    }

    checkLatestOrders();
    const interval = setInterval(checkLatestOrders, 3000);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events?channel=pos_rest_aapno_khano');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'NEW_ORDER' || parsed.type === 'NEW_CONFIRMED_ORDER') {
            const ord = parsed.order;
            const ordKey = ord?.id || ord?.humanOrderId;
            if (ordKey && !seenOrderIdsRef.current.has(ordKey)) {
              seenOrderIdsRef.current.add(ordKey);
              // Trigger notification ONLY for QR customer orders
              if (isQrCustomerOrder(ord, parsed.source)) {
                playChimeSound();
                setNewOrderAlert(ord);
              }
            }
          }
        } catch (e) {
          // ignore keepalive parse error
        }
      };
    } catch (e) {
      console.warn("SSE init error:", e);
    }

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.user) {
          setSessionUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_session', JSON.stringify(data.user));
          }
        } else {
          const localSess = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;
          if (localSess) {
            setSessionUser(JSON.parse(localSess));
          } else {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (err) {
        console.error('Session load error:', err);
        const localSess = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;
        if (localSess) {
          setSessionUser(JSON.parse(localSess));
        } else {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    }
    loadSession();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  const userRole = sessionUser?.role || 'OWNER';

  // Role-filtered navigation links
  const allNavItems = [
    { label: 'Live Orders Kanban', href: '/admin/orders', icon: Flame, badge: 'Live', roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER'] },
    { label: 'QSR Touch POS', href: '/admin/pos', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'WAITER'] },
    { label: 'Kitchen KDS Screen', href: '/kitchen', icon: ChefHat, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'KITCHEN'] },
    { label: 'Menu & Stock Catalog', href: '/admin/menu', icon: UtensilsCrossed, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER'] },
    { label: 'Billing & Tax Invoices', href: '/admin/invoices', icon: Receipt, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'ACCOUNTANT'] },
    { label: 'Raw Inventory & BOM', href: '/admin/inventory', icon: Package, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER'] },
    { label: 'CRM & Car Customers', href: '/admin/customers', icon: Users, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'CASHIER'] },
    { label: 'Daily Expense Ledger', href: '/admin/expenses', icon: DollarSign, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { label: 'Sales & GST Reports', href: '/admin/reports', icon: TrendingUp, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { label: 'Staff & Roles', href: '/admin/staff', icon: Users, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER'] },
    { label: 'Store & Payment Settings', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'CASHIER'] },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#FEFBF5] font-sans selection:bg-[#E09D3D] selection:text-[#AA1B2A]">
      {/* Sidebar for Desktop - Sticky & Fixed */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-gradient-to-b from-[#AA1B2A] to-[#80101C] text-[#FEFBF5] border-r border-[#E09D3D]/30 shadow-2xl flex-shrink-0 z-30 select-none">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E09D3D]/20 flex items-center gap-3 flex-shrink-0">
          <Link href="/admin" className="flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 shadow-md border-2 border-[#E09D3D] flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/images/aapno-khano-logo.png"
                alt="Aapno Khaano"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <div className="min-w-0">
            <h2 className="font-black text-sm text-white tracking-wide truncate">
              {sessionUser?.restaurantName || 'आपणो खाणो'}
            </h2>
            <p className="text-[10px] text-[#E09D3D] font-bold flex items-center gap-1">
              <span>QSR &amp; Car Service Platform</span>
            </p>
          </div>
        </div>

        {/* Navigation Links (Scrolls internally if items overflow) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                  isActive
                    ? 'bg-[#E09D3D] text-[#331E17] shadow-lg scale-[1.02]'
                    : 'text-amber-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-[#AA1B2A] text-white' : 'bg-red-600 text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Super Admin Switcher Footer (ONLY RENDERED FOR SUPER_ADMIN) */}
        {userRole === 'SUPER_ADMIN' && (
          <div className="p-3 border-t border-[#E09D3D]/20 bg-black/20 flex-shrink-0">
            <Link
              href="/superadmin"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-[#E09D3D] hover:bg-black/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Super Admin SaaS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* User Status Bar */}
        <div className="p-3 border-t border-[#E09D3D]/20 bg-black/30 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E09D3D] text-[#331E17] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-inner">
              {sessionUser?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{sessionUser?.name || 'Admin'}</p>
              <p className="text-[9px] text-[#E09D3D] font-bold uppercase">{userRole}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Right Content Area - Header fixed at top, <main> scrolls */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-[#E8E1D6] px-4 flex items-center justify-between shadow-2xs flex-shrink-0 z-20 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#F7F2EA] text-[#331E17] hover:bg-[#E8E1D6]"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-xs sm:text-sm font-black text-[#331E17] truncate">
                {sessionUser?.restaurantName || 'Aapno Khaano'} • Live Terminal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/r/aapno-khano"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-[#FEFBF5] text-xs font-black px-3.5 py-1.5 rounded-xl border border-[#E09D3D] shadow-xs"
            >
              <Car className="w-3.5 h-3.5 text-[#E09D3D]" />
              <span>Customer Menu ↗</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F7F2EA] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-[#FEFBF5] font-black text-xs flex items-center justify-center border border-[#E09D3D]">
                  {sessionUser?.name?.[0] || 'U'}
                </div>
                <span className="hidden md:block text-xs font-black text-[#331E17] text-left">
                  {sessionUser?.name || 'Admin'}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-[#E8E1D6] p-2.5 z-50 animate-in zoom-in-95">
                  <div className="p-2.5 border-b border-slate-100">
                    <p className="font-black text-xs text-[#331E17] truncate">{sessionUser?.name}</p>
                    <p className="text-[10px] text-[#745E55] truncate font-mono">{sessionUser?.email}</p>
                    <span className="inline-block mt-1 bg-amber-100 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      {userRole}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 bg-gradient-to-b from-[#AA1B2A] to-[#80101C] text-white flex flex-col shadow-2xl z-50">
              <div className="p-4 border-b border-[#E09D3D]/30 flex items-center justify-between">
                <span className="font-black text-sm text-white">{sessionUser?.restaurantName || 'आपणो खाणो'}</span>
                <button onClick={() => setSidebarOpen(false)} className="text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-3 space-y-1 overflow-y-auto flex-1">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                      pathname === item.href ? 'bg-[#E09D3D] text-[#331E17]' : 'text-amber-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-3 border-t border-[#E09D3D]/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-black/40 rounded-xl hover:bg-black/60"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content - Independent Scroll Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#FEFBF5]">
          {children}
        </main>
      </div>

      {/* Real-Time Incoming QR Order Floating Banner */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-gradient-to-r from-[#AA1B2A] to-[#80101C] text-white p-4 rounded-3xl border-2 border-[#E09D3D] shadow-2xl animate-bounce">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🔔</span>
              <div>
                <p className="font-black text-xs text-amber-300 uppercase tracking-wider">New Incoming QR Order!</p>
                <p className="font-black text-sm">{newOrderAlert.humanOrderId} • ₹{newOrderAlert.grandTotal?.toFixed(2)}</p>
              </div>
            </div>
            <button onClick={() => setNewOrderAlert(null)} className="text-white/80 hover:text-white p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-amber-100 flex items-center justify-between">
            <span>{newOrderAlert.carNumber ? `🚗 Car: ${newOrderAlert.carNumber}` : newOrderAlert.customerName || 'QR Guest'}</span>
            <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">{newOrderAlert.orderType?.replace('_', ' ')}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              href="/admin/orders"
              onClick={() => setNewOrderAlert(null)}
              className="flex-1 py-2 bg-[#E09D3D] hover:bg-[#c88b34] text-[#331E17] font-black rounded-xl text-center text-xs shadow-md"
            >
              View Live Orders ➔
            </Link>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="px-3 py-2 bg-black/30 hover:bg-black/50 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
