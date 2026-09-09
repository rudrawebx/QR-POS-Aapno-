'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import {
  ShieldAlert,
  Store,
  Briefcase,
  CreditCard,
  ChefHat,
  Users,
  Calculator,
  QrCode,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface Props {
  currentRole?: UserRole;
  currentUserName?: string;
  restaurantSlug?: string;
}

export default function DemoRoleSwitcher({ currentRole = 'OWNER', currentUserName, restaurantSlug = 'aapno-khano' }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const roles: Array<{ role: UserRole; label: string; icon: any; color: string; desc: string }> = [
    { role: 'SUPER_ADMIN', label: 'Super Admin (SaaS Platform)', icon: ShieldAlert, color: 'text-purple-700 bg-purple-100', desc: 'Global platform metrics, all tenants & SaaS plans' },
    { role: 'OWNER', label: 'Restaurant Owner', icon: Store, color: 'text-[#AA1B2A] bg-[#FFF0E8]', desc: 'Full access to POS, Menu, Sales, Reports & Settings' },
    { role: 'MANAGER', label: 'Restaurant Manager', icon: Briefcase, color: 'text-[#311410] bg-[#F7F2EA]', desc: 'Manage orders, inventory, floor tables & staff' },
    { role: 'CASHIER', label: 'Billing Cashier', icon: CreditCard, color: 'text-emerald-700 bg-emerald-100', desc: 'Quick POS, bill settlement & payment collection' },
    { role: 'KITCHEN', label: 'Kitchen Chef (KDS)', icon: ChefHat, color: 'text-red-700 bg-red-100', desc: 'Kitchen tickets, station filters & prep timers' },
    { role: 'WAITER', label: 'Captain / Waiter', icon: Users, color: 'text-amber-700 bg-amber-100', desc: 'Table ordering, status check & customer service' },
    { role: 'ACCOUNTANT', label: 'Accountant', icon: Calculator, color: 'text-cyan-700 bg-cyan-100', desc: 'Invoices, GST reports, payments & expenses' },
  ];

  const handleSwitchRole = async (targetRole: UserRole) => {
    setLoadingRole(targetRole);
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        setIsOpen(false);
        if (targetRole === 'SUPER_ADMIN') {
          router.push('/superadmin');
        } else if (targetRole === 'KITCHEN') {
          router.push('/kitchen');
        } else {
          router.push('/admin/orders');
        }
        router.refresh();
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  const currentRoleObj = roles.find((r) => r.role === currentRole) || roles[1];

  return (
    <div className="bg-[#311410] text-[#FEFBF5] text-xs px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between border-b border-[#E09D3D]/30 z-40 relative no-print gap-2">
      {/* Left: Role Indicator & Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-full border border-[#E09D3D]/30">
          <Sparkles className="w-3.5 h-3.5 text-[#E09D3D] animate-pulse" />
          <span className="font-semibold text-[#E8E1D6]">Live Demo RBAC:</span>
          <span className="text-[#E09D3D] font-bold">{currentRoleObj.label}</span>
        </div>

        {/* Switch Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white px-3 py-1 rounded-xl font-bold transition-all shadow-xs cursor-pointer border border-[#E09D3D]/40"
          >
            <span>Switch Role</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#E09D3D]" />
          </button>

          {isOpen && (
            <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-[#E8E1D6] text-[#331E17] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[10px] font-black uppercase text-[#745E55] tracking-wider border-b border-slate-100 mb-1">
                Select RBAC Demo Profile
              </div>
              <div className="space-y-1">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = r.role === currentRole;
                  return (
                    <button
                      key={r.role}
                      onClick={() => handleSwitchRole(r.role)}
                      disabled={loadingRole !== null}
                      className={`w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFF0E8] text-[#AA1B2A] font-bold border border-[#E09D3D]/50'
                          : 'hover:bg-[#F7F2EA] text-[#331E17]'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${r.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{r.label}</span>
                          {isSelected && <span className="text-[10px] text-[#AA1B2A] font-black">Active</span>}
                        </div>
                        <p className="text-[10px] text-[#745E55] line-clamp-1">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Links to Apps */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Link
          href={`/r/${restaurantSlug}/table-04`}
          target="_blank"
          className="flex items-center gap-1 bg-black/40 hover:bg-black/60 text-[#FEFBF5] px-2.5 py-1 rounded-xl border border-[#E09D3D]/30 transition-colors text-[11px] font-bold"
        >
          <QrCode className="w-3.5 h-3.5 text-[#E09D3D]" />
          <span>Table 04 QR Menu</span>
          <ExternalLink className="w-3 h-3 text-[#E8E1D6]/70" />
        </Link>
        <Link
          href="/admin/pos"
          className="flex items-center gap-1 bg-black/40 hover:bg-black/60 text-[#FEFBF5] px-2.5 py-1 rounded-xl border border-[#E09D3D]/30 transition-colors text-[11px] font-bold"
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          <span>Manual POS</span>
        </Link>
        <Link
          href="/kitchen"
          className="flex items-center gap-1 bg-black/40 hover:bg-black/60 text-[#FEFBF5] px-2.5 py-1 rounded-xl border border-[#E09D3D]/30 transition-colors text-[11px] font-bold"
        >
          <ChefHat className="w-3.5 h-3.5 text-rose-400" />
          <span>KDS Panel</span>
        </Link>
        <Link
          href="/superadmin"
          className="flex items-center gap-1 bg-black/40 hover:bg-black/60 text-[#FEFBF5] px-2.5 py-1 rounded-xl border border-[#E09D3D]/30 transition-colors text-[11px] font-bold"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <span>SaaS Super Admin</span>
        </Link>
      </div>
    </div>
  );
}
