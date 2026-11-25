'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Car,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  Flame,
  Layers,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Printer,
  QrCode,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  TrendingUp,
  UserCheck,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';

export interface PublicPlan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  maxBranches: number;
  maxTables: number;
  maxOrdersPerMonth: number;
  maxStaffUsers: number;
  hasKds: boolean;
  hasMultiStation: boolean;
  hasInventory: boolean;
  hasCustomBranding: boolean;
  hasAdvancedReports: boolean;
}

export interface PlatformStats {
  restaurants: number;
  orders: number;
  products: number;
  tables: number;
  outlets: {
    name: string;
    qsrNumber: string;
    city: string;
    slug: string;
    logoUrl: string;
  }[];
}

interface LandingPageClientProps {
  plans: PublicPlan[];
  stats: PlatformStats;
}

const HERO_DISHES = [
  {
    id: 'd1',
    name: 'Sweet Corn Chaat',
    category: 'Starters',
    price: 120,
    isVeg: true,
    img: '/images/menu/p-1-sweet-corn-chaat.png',
  },
  {
    id: 'd2',
    name: 'Chana Masala Handi',
    category: 'Main Course',
    price: 219,
    isVeg: true,
    img: '/images/menu/Chana Masala.png',
  },
  {
    id: 'd3',
    name: 'Royal Egg Curry',
    category: 'Specials',
    price: 240,
    isVeg: false,
    img: '/images/menu/Egg Curry.png',
  },
  {
    id: 'd4',
    name: 'Mint Green Chutney',
    category: 'Accompaniments',
    price: 40,
    isVeg: true,
    img: '/images/menu/green-chutney.png',
  },
];

const FEATURES = [
  {
    title: 'Smart POS Billing',
    desc: 'Touch-ready counter terminal with dish tiles, Half/Full portions, flat/% discounts, 50-order hold queue, and 1-tap 80mm & 58mm thermal printing.',
    icon: CreditCard,
    tag: 'Cashier Terminal',
  },
  {
    title: 'QR Code Menu & Car Ordering',
    desc: 'Table & parking-bay QR menus with Veg/Non-Veg filters, live portion pricing, vehicle plate capture, and direct UPI / Razorpay checkout.',
    icon: QrCode,
    tag: 'Contactless QR',
  },
  {
    title: 'Kitchen Display System (KDS)',
    desc: 'Real-time station routing (Handi, Tandoor, Snacks, Beverages), bump timers with delay alerts, and instant 80mm/58mm KOT tickets.',
    icon: ChefHat,
    tag: 'Chef Screen',
  },
  {
    title: 'Order Management',
    desc: '5-column live Kanban board uniting Dine-In, Car Service, Takeaway, and QR orders with audio chime alerts and status tracking.',
    icon: Flame,
    tag: 'Live Kanban',
  },
  {
    title: 'Inventory Management',
    desc: 'Ingredient stock ledger, Recipe BOM auto-deduction per sold dish, supplier purchase orders, and low-stock threshold alerts.',
    icon: Package,
    tag: 'Recipe BOM',
  },
  {
    title: 'Restaurant Analytics',
    desc: 'Daily Z-Reports, GST tax breakdown (CGST/SGST), payment mode splits (UPI/Cash/Card), and outlet-wise revenue insights.',
    icon: BarChart3,
    tag: 'GST & Reports',
  },
  {
    title: 'Staff Management',
    desc: 'Role-based access control for Owner, Manager, Cashier, Chef, and Captain with quick staff PIN login and audit trails.',
    icon: Users,
    tag: 'RBAC & PIN',
  },
  {
    title: 'Customer Management',
    desc: 'Automatic guest CRM capturing phone numbers, vehicle plates, visit frequency, lifetime spend, and 1-click WhatsApp bill sharing.',
    icon: UserCheck,
    tag: 'Guest CRM',
  },
];

const SHOWCASE_TABS = [
  {
    id: 'pos',
    label: 'Touch POS & Billing',
    title: 'Built for Rush-Hour Counter Speed',
    desc: 'Ring up Dine-In tables, Car Drive-In bays, and Takeaway tickets in seconds. Supports Cash, UPI, Card, Split payments, and instant 80mm or 2-inch (58mm) GST thermal invoices.',
    bullets: [
      'Hold up to 50 active tickets with color-coded priority',
      'Instant GST (5% CGST/SGST) & FSSAI compliant thermal bills',
      '1-click WhatsApp digital bill sharing & last bill reprint',
    ],
    ctaLabel: 'Open POS Login',
    ctaHref: '/login?redirect=/admin/pos',
  },
  {
    id: 'qr',
    label: 'QR & Car Drive-In',
    title: 'Zero-App Mobile Ordering from Any Table or Car',
    desc: 'Guests scan a printed table or parking QR standee, browse your live menu with veg/non-veg filters, enter their table or vehicle number, and pay seamlessly.',
    bullets: [
      'Works on any mobile browser — no app download needed',
      'Live order tracking screen for guests after checkout',
      'Per-outlet custom branding, logo, and theme support',
    ],
    ctaLabel: 'Try Live QR Menu',
    ctaHref: '/r/aapno-khano',
    external: true,
  },
  {
    id: 'kds',
    label: 'Kitchen KDS & KOT',
    title: 'Zero Missed Tickets Between Counter and Kitchen',
    desc: 'Confirmed orders route automatically to kitchen stations with live prep timers, item notes, and dual Bill + KOT printing.',
    bullets: [
      'Station-wise filtering (Tandoor, Handi, Snacks, Drinks)',
      'Visual prep-time warning badges for delayed tickets',
      'Direct bump-to-ready updates synced to counter & guests',
    ],
    ctaLabel: 'Open KDS Login',
    ctaHref: '/login?redirect=/kitchen',
  },
  {
    id: 'multi',
    label: 'Multi-Outlet Control',
    title: 'Scale From One Outlet to a Multi-City Chain',
    desc: 'Isolated tenant architecture keeps every restaurant’s menu, inventory, thermal paper width (80mm or 58mm), staff, and revenue strictly separated.',
    bullets: [
      'Dedicated QSR numbering (QSR01, QSR02, QSR03…) & branches',
      'Centralized Super Admin governance, subscriptions & support tickets',
      'Per-restaurant GSTIN, FSSAI, logo, and UPI configuration',
    ],
    ctaLabel: 'Register Your Outlet',
    ctaHref: '/register',
  },
];

const FAQS = [
  {
    q: 'Does Aapno Khano POS support both 80mm and 2-inch (58mm) thermal printers?',
    a: 'Yes. Each restaurant outlet can configure its thermal receipt width independently — 80mm standard printers (like QSR01) or compact 2-inch 58mm printers (like QSR03) — with automatic CSS print formatting for both GST Bills and KOTs.',
  },
  {
    q: 'How does QR Code & Car Drive-In ordering work?',
    a: 'Every restaurant gets a unique QR menu URL and table/bay QR codes. Customers scan the QR on their phone, select dishes and portions, enter their table or vehicle number, and place orders directly into your POS and Kitchen Display.',
  },
  {
    q: 'Can each outlet have its own menu, logo, and inventory?',
    a: 'Yes. The platform uses strict multi-tenant data isolation. Every restaurant manages its own categories, dishes (with or without product photos), raw material inventory, recipe BOMs, staff logins, and brand logo on bills and POS.',
  },
  {
    q: 'Are GST and FSSAI details included on customer bills?',
    a: 'Yes. Bills automatically include your configured GSTIN, FSSAI license number, CGST/SGST tax breakdown, invoice sequence number, QR/UPI details, and custom receipt footer.',
  },
  {
    q: 'What staff roles and access controls are supported?',
    a: 'You can create role-scoped accounts for Owner, Manager, Cashier, Chef, and Waiter/Captain, with quick Staff PIN login at the terminal and server-side authorization checks.',
  },
  {
    q: 'How do subscription plans and onboarding work?',
    a: 'Click Get Started to submit your restaurant registration. Once verified and approved by our onboarding team, your QSR account, branch, tables, and owner login are activated immediately on your chosen Starter or Professional plan.',
  },
];

export default function LandingPageClient({ plans, stats }: LandingPageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState('pos');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  // Interactive Hero POS Mockup state
  const [heroCategory, setHeroCategory] = useState('All');
  const [heroCart, setHeroCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([
    { id: 'd2', name: 'Chana Masala Handi', price: 219, qty: 1 },
  ]);

  // Contact / Demo form state
  const [contactForm, setContactForm] = useState({
    name: '',
    restaurantName: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });
  const [contactStatus, setContactStatus] = useState<{
    type: 'idle' | 'submitting' | 'success' | 'error';
    text?: string;
  }>({ type: 'idle' });

  const addHeroItem = (dish: (typeof HERO_DISHES)[number]) => {
    setHeroCart((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: dish.id, name: dish.name, price: dish.price, qty: 1 }];
    });
  };

  const heroSubtotal = heroCart.reduce((s, i) => s + i.price * i.qty, 0);
  const heroGst = Math.round(heroSubtotal * 0.05);
  const heroTotal = heroSubtotal + heroGst;

  const currentShowcase = SHOWCASE_TABS.find((t) => t.id === activeTab) || SHOWCASE_TABS[0];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus({ type: 'submitting' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setContactStatus({ type: 'error', text: data.error || 'Could not submit inquiry.' });
        return;
      }
      setContactStatus({
        type: 'success',
        text: data.message || 'Thank you! Our team will contact you shortly.',
      });
      setContactForm({ name: '', restaurantName: '', phone: '', email: '', city: '', message: '' });
    } catch {
      setContactStatus({
        type: 'error',
        text: 'Network error. Please call +91 70820 40809 directly.',
      });
    }
  };

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Aapno Khano POS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS, Windows',
    url: 'https://pos.aapnokhano.com',
    description:
      'Multi-restaurant SaaS POS, QR Code Menu Ordering, Kitchen Display System (KDS), 80mm & 58mm Thermal GST Billing, and Inventory Management.',
    offers: plans.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: p.monthlyPrice,
      priceCurrency: 'INR',
    })),
    publisher: {
      '@type': 'Organization',
      name: 'Aapno Khano POS • Rudra Web X',
      telephone: '+91-70820-40809',
      email: 'contact@aapnokhano.com',
    },
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#0F172A] selection:bg-[#D4A037]/30 selection:text-[#0F172A]"
      style={{ fontFamily: 'var(--font-manrope), -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      {/* 1. Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-[#FAF6EE]/90 backdrop-blur-xl border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <img
              src="/images/aapno-khano-logo.png"
              alt="Aapno Khano POS"
              className="h-11 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <div className="text-base font-extrabold tracking-tight text-[#0F172A] leading-none">
                Aapno Khano <span className="text-[#B8821E]">POS</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Restaurant Operating System
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <a href="#features" className="hover:text-[#0F172A] transition-colors">
              Features
            </a>
            <a href="#solutions" className="hover:text-[#0F172A] transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="hover:text-[#0F172A] transition-colors">
              Pricing
            </a>
            <a href="#about" className="hover:text-[#0F172A] transition-colors">
              About Us
            </a>
            <a href="#contact" className="hover:text-[#0F172A] transition-colors">
              Contact
            </a>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#0F172A] hover:bg-[#EFE8D8] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#0F172A] hover:bg-[#1E293B] text-[#FAF6EE] shadow-lg shadow-[#0F172A]/15 flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-[#E09D3D]" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="lg:hidden p-2.5 rounded-xl border border-[#E5DEC9] bg-white text-[#0F172A]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E5DEC9] px-4 py-5 space-y-3 shadow-xl">
            <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-slate-700">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#FAF6EE]"
              >
                Features
              </a>
              <a
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#FAF6EE]"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#FAF6EE]"
              >
                Pricing
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#FAF6EE]"
              >
                About Us
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#FAF6EE]"
              >
                Contact
              </a>
              <Link
                href="/r/aapno-khano"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#FAF6EE] text-[#8B1A2B]"
              >
                Live QR Menu
              </Link>
            </div>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link
                href="/login"
                className="flex-1 py-3 rounded-xl border border-[#0F172A]/20 text-center text-sm font-bold text-[#0F172A]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex-1 py-3 rounded-xl bg-[#0F172A] text-center text-sm font-bold text-[#FAF6EE]"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-[#D4A037]/12 blur-3xl" />
            <div className="absolute top-1/2 -left-32 w-[420px] h-[420px] rounded-full bg-[#0F172A]/6 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-6 space-y-7">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5DEC9] shadow-xs text-xs font-bold text-[#0F172A]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Built for QSRs, Cafés, Drive-Ins &amp; Multi-Outlet Chains</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#0F172A] leading-[1.08]">
                  Run Your Restaurant.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B8821E] via-[#D4A037] to-[#8B1A2B]">
                    Not Your Paperwork.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Unify Touch POS billing, QR Code &amp; Car Drive-In ordering, Kitchen Display
                  System (KDS), 80mm &amp; 58mm GST thermal printing, and Recipe BOM inventory in
                  one fast cloud platform.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <Link
                    href="/register"
                    className="px-7 py-4 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-[#FAF6EE] font-bold text-sm sm:text-base shadow-xl shadow-[#0F172A]/20 flex items-center gap-2.5 transition-all hover:-translate-y-0.5"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 text-[#E09D3D]" />
                  </Link>
                  <a
                    href="#features"
                    className="px-7 py-4 rounded-2xl bg-white hover:bg-[#F3ECE0] text-[#0F172A] font-bold text-sm sm:text-base border border-[#E5DEC9] shadow-sm flex items-center gap-2 transition-all"
                  >
                    <span>Explore Features</span>
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    5% GST &amp; FSSAI Thermal Bills
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    80mm &amp; 2-Inch (58mm) Ready
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Multi-Tenant Role Isolation
                  </span>
                </div>
              </div>

              {/* Right Interactive POS Dashboard Mockup */}
              <div className="lg:col-span-6">
                <div className="relative mx-auto max-w-2xl">
                  <div className="rounded-3xl bg-white border border-[#E5DEC9] shadow-2xl shadow-[#0F172A]/12 overflow-hidden transition-transform duration-500 hover:scale-[1.01]">
                    {/* Browser / App Top Bar */}
                    <div className="bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="ml-2 text-[11px] font-semibold text-slate-300">
                          Aapno Khano Touch POS • Interactive Preview
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4A037]/20 text-[#E09D3D] border border-[#D4A037]/30">
                        LIVE TERMINAL UI
                      </span>
                    </div>

                    {/* Mockup Body */}
                    <div className="grid grid-cols-12 bg-[#FAF6EE]/60">
                      {/* Mini Sidebar */}
                      <div className="hidden sm:flex sm:col-span-3 bg-[#0F172A] text-slate-300 p-3 flex-col justify-between border-r border-slate-800">
                        <div className="space-y-1.5 text-[11px] font-semibold">
                          <div className="px-2.5 py-2 rounded-lg bg-[#D4A037] text-[#0F172A] font-extrabold">
                            Touch POS
                          </div>
                          <div className="px-2.5 py-1.5 rounded-lg hover:bg-white/5">Live Orders</div>
                          <div className="px-2.5 py-1.5 rounded-lg hover:bg-white/5">Kitchen KDS</div>
                          <div className="px-2.5 py-1.5 rounded-lg hover:bg-white/5">Inventory BOM</div>
                          <div className="px-2.5 py-1.5 rounded-lg hover:bg-white/5">GST Reports</div>
                        </div>
                        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400">
                          <div className="font-bold text-white">QSR01 • Fatehabad</div>
                          <div>Cashier Terminal</div>
                        </div>
                      </div>

                      {/* Menu Tiles */}
                      <div className="col-span-12 sm:col-span-5 p-3.5 space-y-3">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {['All', 'Starters', 'Main Course'].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setHeroCategory(cat)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                                heroCategory === cat
                                  ? 'bg-[#0F172A] text-white'
                                  : 'bg-white text-slate-600 border border-[#E5DEC9]'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          {HERO_DISHES.filter(
                            (d) => heroCategory === 'All' || d.category === heroCategory
                          ).map((dish) => (
                            <button
                              key={dish.id}
                              type="button"
                              onClick={() => addHeroItem(dish)}
                              className="bg-white rounded-xl p-2 border border-[#E5DEC9] hover:border-[#D4A037] text-left transition-all shadow-2xs group"
                            >
                              <div className="h-16 rounded-lg overflow-hidden bg-slate-100 mb-1.5 relative">
                                <img
                                  src={dish.img}
                                  alt={dish.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span
                                  className={`absolute top-1 left-1 w-2.5 h-2.5 rounded-xs border bg-white flex items-center justify-center ${
                                    dish.isVeg ? 'border-emerald-600' : 'border-red-600'
                                  }`}
                                >
                                  <span
                                    className={`w-1 h-1 rounded-full ${
                                      dish.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                                    }`}
                                  />
                                </span>
                              </div>
                              <div className="text-[11px] font-bold text-[#0F172A] truncate">
                                {dish.name}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[11px] font-extrabold text-[#B8821E]">
                                  ₹{dish.price}
                                </span>
                                <span className="w-5 h-5 rounded-md bg-[#0F172A] text-white flex items-center justify-center">
                                  <Plus className="w-3 h-3" />
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live Ticket Panel */}
                      <div className="col-span-12 sm:col-span-4 bg-white border-t sm:border-t-0 sm:border-l border-[#E5DEC9] p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-[11px] font-extrabold text-[#0F172A]">
                              LIVE TICKET
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Table 04
                            </span>
                          </div>
                          <div className="py-2.5 space-y-2 max-h-40 overflow-y-auto">
                            {heroCart.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-[11px]"
                              >
                                <span className="font-semibold text-slate-700 truncate pr-2">
                                  {item.qty}× {item.name}
                                </span>
                                <span className="font-bold text-[#0F172A]">
                                  ₹{item.price * item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-dashed border-slate-200 space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>GST (5%)</span>
                            <span>₹{heroGst}</span>
                          </div>
                          <div className="flex justify-between text-xs font-extrabold text-[#0F172A]">
                            <span>Grand Total</span>
                            <span>₹{heroTotal}</span>
                          </div>
                          <Link
                            href="/login?redirect=/admin/pos"
                            className="mt-1.5 w-full py-2 rounded-xl bg-[#0F172A] text-[#FAF6EE] text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#1E293B] transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#E09D3D]" />
                            <span>Settle &amp; Print Bill</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Trust & Verified Statistics Section */}
        <section className="bg-[#0F172A] text-white py-12 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-3xl font-extrabold text-[#E09D3D]">
                  {stats.restaurants}
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  Active Live QSR Outlets
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-3xl font-extrabold text-white">
                  {stats.orders.toLocaleString('en-IN')}+
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  Verified Orders Processed
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-3xl font-extrabold text-[#E09D3D]">
                  {stats.products}+
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  Live Digital Menu Items
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-3xl font-extrabold text-white">{stats.tables}</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  Active Tables &amp; QR Endpoints
                </div>
              </div>
            </div>

            {stats.outlets.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Production Outlets Running on Platform:
                </span>
                <div className="flex flex-wrap items-center gap-4">
                  {stats.outlets.map((o) => (
                    <Link
                      key={o.qsrNumber}
                      href={`/r/${o.slug}`}
                      target="_blank"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      <img
                        src={o.logoUrl}
                        alt={o.name}
                        className="w-6 h-6 rounded-md object-contain bg-white p-0.5"
                      />
                      <span className="text-xs font-bold text-white">{o.name}</span>
                      <span className="text-[10px] font-mono text-[#E09D3D]">{o.qsrNumber}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. Features Overview */}
        <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#B8821E]">
              Complete Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2">
              Everything Your Restaurant Needs Under One Roof
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3">
              Every module works together in real time — from guest QR scan to cashier billing,
              kitchen preparation, and inventory deduction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white rounded-3xl p-6 border border-[#E5DEC9] hover:border-[#D4A037] hover:shadow-xl hover:shadow-[#0F172A]/5 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#0F172A] text-[#E09D3D] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#0F172A] border border-[#E5DEC9]">
                        {feat.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#0F172A]">{feat.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Product Showcase */}
        <section id="solutions" className="py-20 bg-white border-y border-[#E5DEC9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#B8821E]">
                  Product Showcase
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2">
                  Designed for Speed, Built for Reliability
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {SHOWCASE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#0F172A] text-[#FAF6EE] shadow-md'
                        : 'bg-[#FAF6EE] text-slate-700 border border-[#E5DEC9] hover:border-[#D4A037]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#FAF6EE] rounded-3xl p-6 sm:p-10 border border-[#E5DEC9]">
              <div className="lg:col-span-6 space-y-5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                  {currentShowcase.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {currentShowcase.desc}
                </p>
                <ul className="space-y-3">
                  {currentShowcase.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm font-semibold text-[#0F172A]">
                      <CheckCircle2 className="w-5 h-5 text-[#B8821E] flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Link
                    href={currentShowcase.ctaHref}
                    target={currentShowcase.external ? '_blank' : '_self'}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-[#FAF6EE] font-bold text-sm shadow-lg transition-all"
                  >
                    <span>{currentShowcase.ctaLabel}</span>
                    {currentShowcase.external ? (
                      <ExternalLink className="w-4 h-4 text-[#E09D3D]" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#E09D3D]" />
                    )}
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden bg-white border border-[#E5DEC9] shadow-xl p-3">
                  <img
                    src="/images/pos-hardware-showcase.png"
                    alt="Aapno Khano POS Terminal, Thermal Printer and QR Standee"
                    className="w-full h-auto rounded-xl object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. QR Ordering Showcase */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="mx-auto max-w-[300px] rounded-[36px] bg-[#0F172A] p-3 shadow-2xl border-4 border-slate-800">
                <div className="bg-[#FAF6EE] rounded-[26px] overflow-hidden">
                  <div className="bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/aapno-khano-logo.png"
                        alt="Logo"
                        className="w-7 h-7 rounded-lg bg-white object-contain p-0.5"
                      />
                      <div>
                        <div className="text-xs font-extrabold">QR Table &amp; Car Menu</div>
                        <div className="text-[10px] text-[#E09D3D]">Scan • Order • Pay</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      OPEN
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2.5">
                    <div className="bg-white rounded-xl p-2.5 border border-[#E5DEC9] flex items-center gap-3">
                      <img
                        src="/images/menu/p-1-sweet-corn-chaat.png"
                        alt="Sweet Corn Chaat"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-extrabold text-[#0F172A] truncate">
                          Sweet Corn Chaat
                        </div>
                        <div className="text-[10px] text-slate-500">Fresh &amp; Crispy</div>
                        <div className="text-xs font-extrabold text-[#B8821E] mt-0.5">₹120</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-2.5 border border-[#E5DEC9] flex items-center gap-3">
                      <img
                        src="/images/menu/Chana Masala.png"
                        alt="Chana Masala"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-extrabold text-[#0F172A] truncate">
                          Chana Masala Handi
                        </div>
                        <div className="text-[10px] text-slate-500">Half / Full Portion</div>
                        <div className="text-xs font-extrabold text-[#B8821E] mt-0.5">₹219</div>
                      </div>
                    </div>
                    <Link
                      href="/r/aapno-khano"
                      target="_blank"
                      className="w-full py-2.5 rounded-xl bg-[#0F172A] text-[#FAF6EE] text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#E09D3D]" />
                      <span>Open Live QR Menu</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#B8821E]">
                QR &amp; Car Service Ordering
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A]">
                Turn Every Table &amp; Parking Bay Into a Self-Ordering Counter
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Reduce waiter bottlenecks during peak hours. Guests browse rich menus, select
                Half/Full portions, add cooking instructions, and pay via UPI or Razorpay — with
                orders firing straight to your kitchen.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E5DEC9]">
                  <QrCode className="w-6 h-6 text-[#B8821E] mb-2" />
                  <div className="text-sm font-extrabold text-[#0F172A]">1. Scan Standee</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Table-bound or parking-bay QR loads menu in under a second.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E5DEC9]">
                  <UtensilsCrossed className="w-6 h-6 text-[#B8821E] mb-2" />
                  <div className="text-sm font-extrabold text-[#0F172A]">2. Customize Order</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Veg/Non-Veg filters, portion sizes, and vehicle plate entry.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E5DEC9]">
                  <Car className="w-6 h-6 text-[#B8821E] mb-2" />
                  <div className="text-sm font-extrabold text-[#0F172A]">3. Pay &amp; Track</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Direct UPI/Razorpay settlement &amp; live kitchen prep status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Kitchen Management Showcase */}
        <section className="py-20 bg-[#0F172A] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E09D3D]">
                Kitchen Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
                From Billing Counter to Kitchen Prep in Milliseconds
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-3">
                Keep front-of-house cashiers and back-of-house chefs perfectly synchronized.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                {
                  step: '01',
                  title: 'Order Placed',
                  desc: 'Created via Cashier POS or Customer QR Menu with table/car tag.',
                  icon: ShoppingBag,
                },
                {
                  step: '02',
                  title: 'Auto Station KOT',
                  desc: 'Dishes route to Handi, Tandoor, Snacks, or Drink stations & 80mm/58mm KOT.',
                  icon: Printer,
                },
                {
                  step: '03',
                  title: 'Chef KDS Timer',
                  desc: 'Chefs track live prep duration with warning badges and special notes.',
                  icon: Clock,
                },
                {
                  step: '04',
                  title: 'Ready & Served',
                  desc: '1-tap completion notifies counter, updates Kanban, and deducts Recipe BOM.',
                  icon: CheckCircle2,
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.step}
                    className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-3 hover:border-[#E09D3D]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-extrabold text-[#E09D3D]">
                        STEP {s.step}
                      </span>
                      <Icon className="w-5 h-5 text-[#E09D3D]" />
                    </div>
                    <h3 className="text-lg font-extrabold">{s.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. Business Analytics Section (Clearly Labelled Illustrative Preview) */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#B8821E]">
                Business Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A]">
                Clear Visibility Into Every Rupee, Tax &amp; Ingredient
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Track daily sales, UPI vs Cash collections, 5% GST tax summaries, top-selling
                dishes, and outlet performance with CSV exports and Z-Report printing.
              </p>
              <div className="space-y-3 pt-1">
                {[
                  'Daily Z-Report & Day-Session cash reconciliation',
                  'CGST / SGST invoice register with reprint & WhatsApp share',
                  'Expense ledger & net operating margin visibility',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4 text-[#B8821E] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-[#0F172A] text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-white/10">
                  <div>
                    <div className="text-sm font-extrabold">Revenue &amp; Payment Analytics</div>
                    <div className="text-[11px] text-slate-400">
                      Illustrative Dashboard Preview • Live data loads inside your portal
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#D4A037]/20 text-[#E09D3D] border border-[#D4A037]/30">
                    Illustrative Mockup
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 my-5">
                  <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-semibold">Payment Split</div>
                    <div className="text-sm font-extrabold text-[#E09D3D] mt-1">UPI • Cash • Card</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-semibold">GST Compliance</div>
                    <div className="text-sm font-extrabold text-white mt-1">CGST + SGST</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-semibold">Audit Ready</div>
                    <div className="text-sm font-extrabold text-emerald-400 mt-1">CSV &amp; Z-Report</div>
                  </div>
                </div>

                {/* Clean Bar Chart Illustration */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="text-[11px] font-bold text-slate-300 mb-3">
                    7-Day Order Volume Trend (Sample Layout)
                  </div>
                  <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
                    {[42, 58, 50, 74, 68, 92, 85].map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#B8821E] to-[#E09D3D]"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[9px] text-slate-400 font-mono">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Why Choose Aapno Khano */}
        <section id="about" className="py-20 bg-white border-y border-[#E5DEC9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#B8821E]">
                Why Choose Aapno Khano
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2">
                Engineered for Real Indian Hospitality Workflows
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Both 80mm & 58mm Thermal Support',
                  desc: 'Run standard 80mm counter printers or compact 2-inch 58mm printers per outlet with crisp logos, GSTIN, and FSSAI details.',
                  icon: Printer,
                },
                {
                  title: 'Strict Tenant & Role Isolation',
                  desc: 'Every restaurant’s orders, menus, inventory, and staff remain isolated with server-side RBAC and encrypted sessions.',
                  icon: ShieldCheck,
                },
                {
                  title: 'Built for QSR, Dine-In & Car Service',
                  desc: 'Dedicated workflows for table service, takeaway, and parking-bay car delivery with vehicle number callouts.',
                  icon: Car,
                },
              ].map((w) => {
                const Icon = w.icon;
                return (
                  <div
                    key={w.title}
                    className="rounded-3xl bg-[#FAF6EE] p-7 border border-[#E5DEC9] space-y-3"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#0F172A] text-[#E09D3D] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0F172A]">{w.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{w.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 10. Pricing Section (Exact Verified DB Plans) */}
        <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#B8821E]">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2">
              Plans That Scale With Your Outlets
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Verified subscription tiers with clear branch, table, order, and staff allowances.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-white border border-[#E5DEC9] mt-6 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#0F172A] text-[#FAF6EE]'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-[#0F172A] text-[#FAF6EE]'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => {
              const isFeatured = plan.slug === 'professional' || idx === 1;
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-7 flex flex-col justify-between border transition-all ${
                    isFeatured
                      ? 'bg-[#0F172A] text-white border-[#D4A037] shadow-2xl shadow-[#0F172A]/20'
                      : 'bg-white text-[#0F172A] border-[#E5DEC9] shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold">{plan.name}</h3>
                      {isFeatured && (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#D4A037] text-[#0F172A]">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          isFeatured ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        / {billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>

                    <ul className="mt-6 space-y-3 text-xs font-semibold">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#E09D3D] flex-shrink-0" />
                        <span>Up to {plan.maxBranches} Branch(es)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#E09D3D] flex-shrink-0" />
                        <span>Up to {plan.maxTables} Tables / QR Endpoints</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#E09D3D] flex-shrink-0" />
                        <span>{plan.maxOrdersPerMonth.toLocaleString('en-IN')} Orders / Month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#E09D3D] flex-shrink-0" />
                        <span>Up to {plan.maxStaffUsers} Staff Accounts</span>
                      </li>
                      {plan.hasKds && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#E09D3D] flex-shrink-0" />
                          <span>Kitchen Display System (KDS)</span>
                        </li>
                      )}
                      {plan.hasMultiStation && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#E09D3D] flex-shrink-0" />
                          <span>Multi-Station KOT Routing</span>
                        </li>
                      )}
                      {plan.hasInventory && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#E09D3D] flex-shrink-0" />
                          <span>Inventory &amp; Recipe BOM</span>
                        </li>
                      )}
                      {plan.hasAdvancedReports && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#E09D3D] flex-shrink-0" />
                          <span>Advanced GST &amp; Sales Reports</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <Link
                    href={`/register?plan=${encodeURIComponent(plan.slug)}`}
                    className={`mt-8 w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      isFeatured
                        ? 'bg-[#D4A037] hover:bg-[#E09D3D] text-[#0F172A]'
                        : 'bg-[#0F172A] hover:bg-[#1E293B] text-[#FAF6EE]'
                    }`}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* 11. Verified Live Deployments (No Fake Reviews) */}
        <section className="py-16 bg-white border-y border-[#E5DEC9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#B8821E]">
                Verified Live Outlets
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2">
                Running Live Across Haryana QSRs &amp; Cafés
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.outlets.map((outlet) => (
                <div
                  key={outlet.qsrNumber}
                  className="rounded-3xl bg-[#FAF6EE] border border-[#E5DEC9] p-6 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={outlet.logoUrl}
                      alt={outlet.name}
                      className="w-12 h-12 rounded-2xl bg-white object-contain p-1 border border-[#E5DEC9] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-[#B8821E]">
                        {outlet.qsrNumber} • {outlet.city}
                      </div>
                      <h3 className="text-sm font-extrabold text-[#0F172A] truncate">
                        {outlet.name}
                      </h3>
                    </div>
                  </div>
                  <Link
                    href={`/r/${outlet.slug}`}
                    target="_blank"
                    className="px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] hover:border-[#D4A037] text-xs font-bold text-[#0F172A] flex-shrink-0"
                  >
                    Menu
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. FAQ Section */}
        <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#B8821E]">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] mt-2">
              Answers for Restaurant Owners &amp; Operators
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0F172A]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#B8821E] flex-shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 13. Final CTA + Contact & Demo Request Form */}
        <section id="contact" className="py-20 bg-[#0F172A] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#E09D3D]">
                  Start Today
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight">
                  Your Restaurant Deserves Smarter Management.
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                  Register your outlet online in minutes, or request a guided walkthrough from our
                  onboarding specialists.
                </p>
                <div className="flex flex-wrap gap-3.5 pt-2">
                  <Link
                    href="/register"
                    className="px-7 py-4 rounded-2xl bg-[#D4A037] hover:bg-[#E09D3D] text-[#0F172A] font-extrabold text-sm flex items-center gap-2 transition-all"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/application-status"
                    className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 transition-all"
                  >
                    Check Application Status
                  </Link>
                </div>

                <div className="pt-4 space-y-2.5 text-sm text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#E09D3D]" />
                    <span>+91 70820 40809 • +91 70820 40892</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#E09D3D]" />
                    <span>contact@aapnokhano.com</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#E09D3D]" />
                    <span>Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053</span>
                  </div>
                </div>
              </div>

              {/* Working Contact / Demo Form */}
              <div className="lg:col-span-6">
                <form
                  onSubmit={handleContactSubmit}
                  className="bg-white text-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
                >
                  <div>
                    <h3 className="text-xl font-extrabold">Request a Demo or Callback</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Tell us about your restaurant or café and our team will reach out.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name *"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF6EE] border border-[#E5DEC9] text-sm focus:outline-none focus:border-[#0F172A]"
                    />
                    <input
                      type="text"
                      placeholder="Restaurant / Café Name"
                      value={contactForm.restaurantName}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, restaurantName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF6EE] border border-[#E5DEC9] text-sm focus:outline-none focus:border-[#0F172A]"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Number *"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF6EE] border border-[#E5DEC9] text-sm focus:outline-none focus:border-[#0F172A]"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF6EE] border border-[#E5DEC9] text-sm focus:outline-none focus:border-[#0F172A]"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="City (e.g. Hisar, Fatehabad, Panchkula)"
                    value={contactForm.city}
                    onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6EE] border border-[#E5DEC9] text-sm focus:outline-none focus:border-[#0F172A]"
                  />

                  <textarea
                    rows={3}
                    placeholder="Tell us what you need (POS, QR Menu, 58mm/80mm printer, multi-outlet)..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6EE] border border-[#E5DEC9] text-sm focus:outline-none focus:border-[#0F172A]"
                  />

                  {contactStatus.type === 'success' && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      {contactStatus.text}
                    </div>
                  )}
                  {contactStatus.type === 'error' && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                      {contactStatus.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={contactStatus.type === 'submitting'}
                    className="w-full py-3.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-[#FAF6EE] font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    <MessageSquare className="w-4 h-4 text-[#E09D3D]" />
                    <span>
                      {contactStatus.type === 'submitting' ? 'Submitting...' : 'Request Demo'}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 14. Premium Footer */}
      <footer className="bg-[#080E1B] text-slate-300 border-t border-slate-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/aapno-khano-logo.png"
                  alt="Aapno Khano POS"
                  className="h-10 w-auto bg-white rounded-xl p-1"
                />
                <div>
                  <div className="text-sm font-extrabold text-white">Aapno Khano POS</div>
                  <div className="text-[11px] text-[#E09D3D]">Restaurant SaaS Platform</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete cloud POS, QR ordering, Kitchen Display System (KDS), and GST billing for
                QSRs, cafés, and multi-outlet hospitality brands.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
                Product
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#features" className="hover:text-[#E09D3D] transition-colors">
                    Features Overview
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-[#E09D3D] transition-colors">
                    Solutions &amp; Hardware
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[#E09D3D] transition-colors">
                    Subscription Pricing
                  </a>
                </li>
                <li>
                  <Link href="/r/aapno-khano" target="_blank" className="hover:text-[#E09D3D]">
                    Live QR Menu Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
                Platform Portals
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/login" className="hover:text-[#E09D3D] transition-colors">
                    Staff &amp; Owner Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-[#E09D3D] transition-colors">
                    Register Restaurant
                  </Link>
                </li>
                <li>
                  <Link href="/application-status" className="hover:text-[#E09D3D] transition-colors">
                    Application Status
                  </Link>
                </li>
                <li>
                  <Link href="/login?redirect=/superadmin" className="hover:text-[#E09D3D]">
                    Super Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
                Contact &amp; Social
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>+91 70820 40809 / +91 70820 40892</li>
                <li>contact@aapnokhano.com</li>
                <li>HUDA Sector 3, Fatehabad, Haryana</li>
                <li className="pt-1 flex items-center gap-3">
                  <a
                    href="https://www.instagram.com/aapnokhano"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-[#E09D3D]"
                  >
                    Instagram
                  </a>
                  <span>•</span>
                  <a
                    href="https://www.facebook.com/aapnokhano"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-[#E09D3D]"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © 2026 Aapno Khano POS • Built by{' '}
              <a
                href="https://rudrawebx.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E09D3D] font-bold hover:underline"
              >
                Rudra Web X
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Info Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-[#0F172A] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">
                {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {legalModal === 'privacy'
                ? 'Aapno Khano POS isolates restaurant tenant records, guest orders, and staff credentials using encrypted sessions and role-based access control. Contact inquiries are used solely for onboarding and support.'
                : 'Aapno Khano POS provides cloud billing, QR menu ordering, Kitchen Display System (KDS), and inventory management under active restaurant subscriptions. Each outlet is responsible for verifying its GSTIN, FSSAI, and tax configurations.'}
            </p>
            <button
              type="button"
              onClick={() => setLegalModal(null)}
              className="w-full py-3 rounded-xl bg-[#0F172A] text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
