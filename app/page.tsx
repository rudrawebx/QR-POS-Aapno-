'use client';

import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  Flame,
  ChefHat,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Car,
  ShoppingBag,
  Receipt,
  UtensilsCrossed,
  CheckCircle2,
  Lock,
  CreditCard,
  Printer,
  Smartphone,
  Layers,
  Clock,
  Star,
  Award,
  ShieldCheck,
  Building2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

export default function MasterLandingPage() {
  const portalModules = [
    {
      title: 'Customer QR Ordering & Mobile Menu',
      subtitle: '60+ Authentic Rajasthani & North Indian Dishes',
      badge: 'Public • Scan & Pay',
      href: '/r/aapno-khano',
      target: '_blank',
      color: 'from-[#AA1B2A] to-[#DA4339]',
      icon: QrCode,
      desc: 'Public mobile-first QR ordering with 60+ authentic dishes, Half/Full portion selectors, Veg 🟢 / Non-Veg 🔴 filters, and verified PNB UPI checkout.',
      tags: ['🚗 Car Service', '🍽️ Table QR', '🟢 Veg / 🔴 Non-Veg', '⚡ Instant Payment'],
      isPublic: true,
    },
    {
      title: 'QSR Touch POS & Fast Billing Terminal',
      subtitle: 'Cashier Counter & Multi-Payment Settlement',
      badge: 'Protected • Staff Login Required',
      href: '/login?redirect=/admin/pos',
      target: '_self',
      color: 'from-[#AA1B2A] to-[#DA4339]',
      icon: CreditCard,
      desc: 'Fast billing terminal with dish tiles, multi-payment options (UPI, Cash, Card, Split), flat/percentage discounts, order holding, and 1-tap 80mm GST receipt printing.',
      tags: ['Cashier Role', '80mm GST Invoice', 'Split Payment', 'Reprint Last Bill'],
      isPublic: false,
    },
    {
      title: 'Live Orders Kanban & Command Center',
      subtitle: 'Real-time Kitchen Firing & Vehicle Tracking',
      badge: 'Protected • Staff Login Required',
      href: '/login?redirect=/admin/orders',
      target: '_self',
      color: 'from-[#AA1B2A] to-[#DA4339]',
      icon: Flame,
      desc: 'Live 5-column Kanban board with real-time audio chime alerts, automatic inventory BOM deduction, vehicle callouts, and simultaneous dual thermal printing.',
      tags: ['Manager / Owner Role', 'Vehicle Plate Callout', 'Dual Print Bill+KOT', 'Inventory BOM'],
      isPublic: false,
    },
    {
      title: 'Kitchen Display System (KDS & KOT)',
      subtitle: 'Chef Screen & Station-wise Dispatch',
      badge: 'Protected • Kitchen Login Required',
      href: '/login?redirect=/kitchen',
      target: '_self',
      color: 'from-[#311410] to-[#AA1B2A]',
      icon: ChefHat,
      desc: 'Kitchen display screen for Head Chef. Filter by station (Wok & Handi, Tandoor & Grill, Crispy Snacks), live bump timers with warning badges, and 80mm KOT routing.',
      tags: ['Chef Role', 'Handi / Tandoor Routing', 'Prep Warning Badges', '80mm KOT Ticket'],
      isPublic: false,
    },
    {
      title: 'Menu, Stock & Raw Material Inventory',
      subtitle: 'Recipe BOM & Automated Ingredient Ledger',
      badge: 'Protected • Owner / Manager Only',
      href: '/login?redirect=/admin/inventory',
      target: '_self',
      color: 'from-[#311410] to-[#5a2016]',
      icon: Layers,
      desc: 'Complete raw materials ledger (Malai Paneer, Vedic Desi Ghee, Amul Butter, Basmati Rice, Shahi Spices) with recipe BOM auto-deduction and low stock warnings.',
      tags: ['Owner Role', 'Recipe BOM Auto-Deduct', 'Low-Stock Alerts', 'Supplier POs'],
      isPublic: false,
    },
    {
      title: 'Super Admin Multi-Tenant SaaS Platform',
      subtitle: 'Platform Root & Global Restaurant Controls',
      badge: 'Strictly Protected • Super Admin Only',
      href: '/login?redirect=/superadmin',
      target: '_self',
      color: 'from-[#311410] to-[#5a2016]',
      icon: ShieldAlert,
      desc: 'Root platform orchestration. Global GMV analytics, subscription tier engine (Starter, Pro, Enterprise), Master Menu CRUD, and image URL management.',
      tags: ['Super Admin Role', 'Tenant Provisioning', 'Master Dish CRUD', 'Image URL Editing'],
      isPublic: false,
    },
  ];

  const brandHighlights = [
    {
      title: '100% Pure Vedic Desi Ghee',
      desc: 'Authentic royal recipes prepared with pure bilona ghee and freshly roasted whole spices.',
      icon: Sparkles,
    },
    {
      title: 'QSR Car Service Drive-In',
      desc: 'Specialized parking bay delivery with live vehicle registration plate tracker.',
      icon: Car,
    },
    {
      title: 'Verified 1-Tap Gateway Checkout',
      desc: 'Seamless UPI, Cards, NetBanking, and Cash payment options.',
      icon: Smartphone,
    },
    {
      title: 'Strict Role-Based Security (RBAC)',
      desc: 'Separate private logins with PIN & Password for Owner, Manager, Cashier, Kitchen, and Super Admin.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FEFBF5] text-[#331E17] flex flex-col font-sans selection:bg-[#E09D3D] selection:text-[#AA1B2A]">
      {/* Main Luxury Header / Top Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E8E1D6] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E8] p-1 border-2 border-[#E09D3D] shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/images/aapno-khano-logo.png" alt="Aapno Khaano" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-[#331E17] tracking-tight block">
                आपणो खाणो <span className="text-[#AA1B2A] font-bold text-xs sm:text-sm font-serif italic">(Aapno Khaano)</span>
              </span>
              <p className="text-[10px] text-[#745E55] font-bold tracking-wide uppercase">
                Royal Rajasthani QSR &amp; Multi-Tenant SaaS Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/r/aapno-khano"
              target="_blank"
              className="flex items-center gap-1.5 bg-[#FFF0E8] hover:bg-[#ffe5d9] text-[#AA1B2A] px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E09D3D]/50 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-[#AA1B2A]" />
              <span>Customer QR Menu ↗</span>
            </Link>

            <Link
              href="/login"
              className="bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white px-4 py-2 rounded-xl text-xs font-black shadow-md border border-[#E09D3D]/60 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-[#E09D3D]" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Soft Royal Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FFF0E8] rounded-full blur-3xl pointer-events-none opacity-80" />

        {/* Heritage Badge */}
        <div className="inline-flex items-center gap-2 bg-[#FFF0E8] border border-[#E09D3D] px-4 py-1.5 rounded-full text-xs font-black text-[#AA1B2A] mb-5 shadow-xs animate-in zoom-in-95">
          <Sparkles className="w-4 h-4 text-[#E09D3D]" />
          <span>स्वाद राजस्थान का • Authentic Handi, Tandoor &amp; QSR Drive-In</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#331E17] max-w-4xl mx-auto leading-tight">
          Complete Restaurant POS, QR Menu, Kitchen KDS &amp; SaaS Platform
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-xs sm:text-base text-[#745E55] max-w-2xl mx-auto leading-relaxed font-medium">
          Pre-seeded with <b className="text-[#331E17]">आपणो खाणो (Aapno Khaano)</b> authentic 60+ dishes catalog, verified PNB Standee UPI (<code className="bg-[#FFF0E8] text-[#AA1B2A] px-2 py-0.5 rounded-md font-mono text-xs font-bold border border-[#E8E1D6]">9996213962m@pnb</code>), Recipe BOM inventory, and strict private role-based authentication.
        </p>

        {/* Quick Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/r/aapno-khano"
            target="_blank"
            className="bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg border border-[#E09D3D]/50 transition-all active:scale-95 cursor-pointer"
          >
            <Car className="w-4 h-4 text-[#E09D3D]" />
            <span>Open Customer QR Menu (Public)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/login"
            className="bg-white hover:bg-[#F7F2EA] text-[#331E17] font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 border border-[#E8E1D6] shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-[#AA1B2A]" />
            <span>Staff / Admin Login (Private)</span>
          </Link>
        </div>
      </section>

      {/* Brand Highlights Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {brandHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-3xl border border-[#E8E1D6] shadow-xs flex items-start gap-3.5 hover:border-[#E09D3D] transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FFF0E8] text-[#AA1B2A] border border-[#E09D3D]/40 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#331E17]">{item.title}</h4>
                  <p className="text-[11px] text-[#745E55] mt-1 leading-snug">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integrated Platform Applications Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="text-center mb-8">
          <span className="text-[10px] font-black uppercase text-[#AA1B2A] tracking-wider bg-[#FFF0E8] px-3 py-1 rounded-full border border-[#E09D3D]/40">
            Protected Role Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#331E17] mt-2">All Platform Operations</h2>
          <p className="text-xs text-[#745E55] mt-1">
            Strict isolation between Public Customer Menu, Cashier POS, Kitchen KDS, Inventory BOM &amp; Super Admin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portalModules.map((app, idx) => {
            const Icon = app.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-[#E8E1D6] p-6 flex flex-col justify-between space-y-5 hover:border-[#E09D3D] hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${app.color} text-white flex items-center justify-center shadow-md border border-[#E09D3D]/40`}>
                      <Icon className="w-6 h-6 text-[#E09D3D]" />
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                      app.isPublic
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-[#FFF0E8] text-[#AA1B2A] border-[#E09D3D]/40'
                    }`}>
                      {app.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-[#331E17] group-hover:text-[#AA1B2A] transition-colors">
                      {app.title}
                    </h3>
                    <p className="text-[11px] font-bold text-[#E09D3D] mt-0.5">{app.subtitle}</p>
                    <p className="text-xs text-[#745E55] mt-2 leading-relaxed">
                      {app.desc}
                    </p>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {app.tags.map((t, tIdx) => (
                      <span key={tIdx} className="bg-[#F7F2EA] text-[#331E17] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#E8E1D6]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={app.href}
                  target={app.target}
                  className="w-full bg-[#F7F2EA] hover:bg-[#FFF0E8] text-[#331E17] group-hover:text-[#AA1B2A] font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 border border-[#E8E1D6] group-hover:border-[#E09D3D] transition-colors shadow-2xs"
                >
                  <span>{app.isPublic ? 'Open Customer Menu' : 'Login to Access Portal'}</span>
                  <ArrowRight className="w-4 h-4 text-[#AA1B2A] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#311410] text-[#FEFBF5] py-10 border-t-2 border-[#E09D3D]/40 text-center text-xs space-y-3">
        <div className="flex items-center justify-center gap-2 font-black text-sm text-[#E09D3D]">
          <span>आपणो खाणो (Aapno Khaano)</span>
          <span>•</span>
          <span>Royal Rajasthani QSR POS &amp; SaaS</span>
        </div>
        <p className="text-[#E8E1D6]/80 text-xs max-w-md mx-auto">
          Official PNB Standee UPI: <b className="text-white font-mono">9996213962m@pnb</b> • 5% GST Compliant • 80mm Dual Thermal Printing
        </p>
        <p className="text-[10px] text-[#E8E1D6]/50">
          © {new Date().getFullYear()} Aapno Khaano. All Rights Reserved. Reference: www.aapnokhano.com
        </p>
      </footer>
    </div>
  );
}
