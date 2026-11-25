'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChefHat,
  ChevronDown,
  CreditCard,
  ExternalLink,
  Flame,
  Layers,
  Mail,
  MapPin,
  Menu,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
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

const PORTALS = [
  {
    title: 'Customer QR Menu',
    desc: 'Guests scan a table or parking QR, browse dishes with Veg/Non-Veg filters, and pay via UPI.',
    href: '/r/aapno-khano',
    cta: 'Open QR Menu',
    external: true,
    icon: QrCode,
  },
  {
    title: 'Counter Touch POS',
    desc: 'Fast billing for dine-in, takeaway, and car service with 80mm & 58mm GST thermal printing.',
    href: '/login?redirect=/admin/pos',
    cta: 'Open POS Login',
    external: false,
    icon: CreditCard,
  },
  {
    title: 'Live Orders Board',
    desc: 'Track incoming orders, vehicle numbers, and dual Bill + KOT prints in one view.',
    href: '/login?redirect=/admin/orders',
    cta: 'Open Orders Login',
    external: false,
    icon: Flame,
  },
  {
    title: 'Kitchen Display (KDS)',
    desc: 'Station-wise KOT routing for Tandoor, Handi, Snacks, and Beverages with prep timers.',
    href: '/login?redirect=/kitchen',
    cta: 'Open KDS Login',
    external: false,
    icon: ChefHat,
  },
  {
    title: 'Inventory & Recipes',
    desc: 'Per-outlet raw material stock, suppliers, purchase orders, and recipe BOM deduction.',
    href: '/login?redirect=/admin/inventory',
    cta: 'Open Inventory Login',
    external: false,
    icon: Layers,
  },
  {
    title: 'Super Admin Control',
    desc: 'Multi-outlet management, plan assignments, staff roles, and platform settings.',
    href: '/login?redirect=/superadmin',
    cta: 'Super Admin Login',
    external: false,
    icon: ShieldCheck,
  },
];

const FAQS = [
  {
    q: 'Does it support both 80mm and 2-inch (58mm) thermal printers?',
    a: 'Yes. Each outlet can use 80mm standard printers or 2-inch (58mm) compact printers for both GST bills and kitchen KOTs.',
  },
  {
    q: 'Can each outlet have its own logo, menu, and inventory?',
    a: 'Yes. Every restaurant has its own logo on the POS and bill, separate menu (with or without dish images), and separate raw material inventory.',
  },
  {
    q: 'Are GSTIN and FSSAI numbers printed on customer bills?',
    a: 'Yes. Your GSTIN, FSSAI number, CGST/SGST tax breakdown, invoice number, and footer are printed automatically.',
  },
  {
    q: 'How do I start using Aapno Khano POS for my restaurant?',
    a: 'Click Register Restaurant to submit your outlet details, or fill the callback form below.',
  },
];

export default function LandingPageClient({ plans, stats }: LandingPageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const [form, setForm] = useState({
    name: '',
    restaurantName: '',
    phone: '',
    city: '',
    message: '',
  });
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [formMsg, setFormMsg] = useState('');

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormState('error');
        setFormMsg(data.error || 'Could not send request.');
        return;
      }
      setFormState('sent');
      setFormMsg(data.message || 'Thank you! We will call you back shortly.');
      setForm({ name: '', restaurantName: '', phone: '', city: '', message: '' });
    } catch {
      setFormState('error');
      setFormMsg('Network error. Please call +91 70820 40809.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#FEFBF5] text-[#331E17]"
      style={{ fontFamily: 'var(--font-manrope), -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* Top Brand Header */}
      <header className="sticky top-0 z-50 bg-[#FEFBF5]/95 backdrop-blur-md border-b border-[#E8E1D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/images/aapno-khano-logo.png"
              alt="Aapno Khano POS"
              className="h-11 w-auto object-contain"
            />
            <div>
              <div className="font-black text-base text-[#331E17] leading-tight">
                आपणो खाणो <span className="text-[#AA1B2A]">POS</span>
              </div>
              <div className="text-[11px] font-bold text-[#745E55]">
                Restaurant &amp; QSR Management
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-[#745E55]">
            <a href="#modules" className="hover:text-[#AA1B2A] transition-colors">
              Portals
            </a>
            <a href="#pricing" className="hover:text-[#AA1B2A] transition-colors">
              Pricing
            </a>
            <a href="#outlets" className="hover:text-[#AA1B2A] transition-colors">
              Live Outlets
            </a>
            <a href="#faq" className="hover:text-[#AA1B2A] transition-colors">
              FAQs
            </a>
            <a href="#contact" className="hover:text-[#AA1B2A] transition-colors">
              Contact
            </a>
          </nav>

          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-extrabold text-[#331E17] hover:bg-[#F7F2EA] border border-[#E8E1D6] transition-colors"
            >
              Staff Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-xl text-sm font-extrabold bg-gradient-to-r from-[#AA1B2A] to-[#80101C] text-[#FEFBF5] border border-[#E09D3D]/60 shadow-sm hover:opacity-95 transition-opacity"
            >
              Register Restaurant
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="lg:hidden p-2 rounded-xl border border-[#E8E1D6] bg-white text-[#331E17]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E8E1D6] px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-bold text-[#331E17]">
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-[#FEFBF5]">
                Portals
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-[#FEFBF5]">
                Pricing
              </a>
              <a href="#outlets" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-[#FEFBF5]">
                Live Outlets
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-[#FEFBF5]">
                Contact
              </a>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#E8E1D6]">
              <Link href="/login" className="flex-1 py-2.5 rounded-xl border border-[#E8E1D6] text-center text-sm font-extrabold">
                Staff Login
              </Link>
              <Link href="/register" className="flex-1 py-2.5 rounded-xl bg-[#AA1B2A] text-white text-center text-sm font-extrabold">
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 lg:py-20 bg-gradient-to-b from-[#FEFBF5] to-[#F7F2EA] border-b border-[#E8E1D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-[#FFF0E8] border border-[#E09D3D]/50 text-xs font-extrabold text-[#AA1B2A]">
                QSR POS • QR Ordering • Kitchen KDS • GST Billing
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-[#331E17] leading-[1.1]">
                Run Your Restaurant.{' '}
                <span className="text-[#AA1B2A]">Not Your Paperwork.</span>
              </h1>

              <p className="text-base text-[#745E55] leading-relaxed">
                Complete counter billing, table &amp; car QR ordering, kitchen KOT display, recipe
                inventory, and 80mm or 2-inch (58mm) GST thermal printing — built for real daily
                restaurant operations.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#AA1B2A] to-[#80101C] text-[#FEFBF5] font-extrabold text-sm border border-[#E09D3D]/60 shadow-md flex items-center gap-2 hover:opacity-95 transition-opacity"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 text-[#E09D3D]" />
                </Link>
                <Link
                  href="/r/aapno-khano"
                  target="_blank"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFF0E8] text-[#331E17] font-extrabold text-sm border border-[#E8E1D6] flex items-center gap-2 transition-colors"
                >
                  <span>View Live QR Menu</span>
                  <ExternalLink className="w-4 h-4 text-[#AA1B2A]" />
                </Link>
              </div>

              {/* Verified Live Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="bg-white rounded-2xl p-3.5 border border-[#E8E1D6]">
                  <div className="text-xl font-black text-[#AA1B2A]">{stats.restaurants}</div>
                  <div className="text-[11px] font-bold text-[#745E55]">Live Outlets</div>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E8E1D6]">
                  <div className="text-xl font-black text-[#331E17]">
                    {stats.orders.toLocaleString('en-IN')}+
                  </div>
                  <div className="text-[11px] font-bold text-[#745E55]">Orders Billed</div>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E8E1D6]">
                  <div className="text-xl font-black text-[#AA1B2A]">{stats.products}</div>
                  <div className="text-[11px] font-bold text-[#745E55]">Menu Items</div>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E8E1D6]">
                  <div className="text-xl font-black text-[#331E17]">{stats.tables}</div>
                  <div className="text-[11px] font-bold text-[#745E55]">Tables &amp; QR</div>
                </div>
              </div>
            </div>

            {/* Real POS Hardware & Terminal Showcase */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-4 border-2 border-[#E09D3D]/40 shadow-xl">
                <img
                  src="/images/pos-hardware-showcase.png"
                  alt="Aapno Khano POS Terminal, Thermal Printer and QR Standee"
                  className="w-full h-auto rounded-2xl object-contain"
                />
                <div className="mt-3 pt-3 border-t border-[#E8E1D6] flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-[#745E55]">
                  <span className="flex items-center gap-1.5 text-[#331E17]">
                    <Printer className="w-4 h-4 text-[#AA1B2A]" />
                    80mm &amp; 58mm Thermal Bill + KOT
                  </span>
                  <Link href="/login?redirect=/admin/pos" className="text-[#AA1B2A] hover:underline">
                    Open POS Terminal →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Portals Grid */}
        <section id="modules" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-[#AA1B2A]">
              Platform Portals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#331E17] mt-1">
              Everything Connected in One System
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PORTALS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-3xl border border-[#E8E1D6] hover:border-[#E09D3D] p-6 flex flex-col justify-between space-y-5 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#AA1B2A] to-[#80101C] text-[#E09D3D] flex items-center justify-center border border-[#E09D3D]/40">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-[#331E17]">{item.title}</h3>
                    <p className="text-sm text-[#745E55] leading-relaxed">{item.desc}</p>
                  </div>

                  <Link
                    href={item.href}
                    target={item.external ? '_blank' : '_self'}
                    className="w-full py-3 px-4 rounded-2xl bg-[#F7F2EA] hover:bg-[#FFF0E8] text-[#331E17] hover:text-[#AA1B2A] font-extrabold text-xs flex items-center justify-center gap-2 border border-[#E8E1D6] transition-colors"
                  >
                    <span>{item.cta}</span>
                    <ArrowRight className="w-4 h-4 text-[#AA1B2A]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Outlets Running on Aapno Khano */}
        <section id="outlets" className="py-14 bg-[#F7F2EA] border-y border-[#E8E1D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-xs font-black uppercase tracking-wider text-[#AA1B2A]">
                Live Deployments
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#331E17] mt-1">
                Active Restaurants Using This Platform
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {stats.outlets.map((o) => (
                <div
                  key={o.qsrNumber}
                  className="bg-white rounded-3xl border border-[#E8E1D6] p-5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={o.logoUrl}
                      alt={o.name}
                      className="w-12 h-12 rounded-2xl object-contain bg-[#FEFBF5] border border-[#E8E1D6] p-1 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono font-black text-[#AA1B2A]">
                        {o.qsrNumber} • {o.city}
                      </div>
                      <div className="text-sm font-black text-[#331E17] truncate">{o.name}</div>
                    </div>
                  </div>
                  <Link
                    href={`/r/${o.slug}`}
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl bg-[#F7F2EA] hover:bg-[#FFF0E8] border border-[#E8E1D6] text-xs font-extrabold text-[#331E17] flex-shrink-0"
                  >
                    QR Menu
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Plans from Database */}
        <section id="pricing" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-[#AA1B2A]">
              Subscription Plans
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#331E17] mt-1">
              Transparent Monthly &amp; Yearly Plans
            </h2>

            <div className="inline-flex items-center p-1 rounded-2xl bg-white border border-[#E8E1D6] mt-5">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-[#AA1B2A] text-white'
                    : 'text-[#745E55] hover:text-[#331E17]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-[#AA1B2A] text-white'
                    : 'text-[#745E55] hover:text-[#331E17]'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => {
              const featured = plan.slug === 'professional' || idx === 1;
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-7 flex flex-col justify-between border ${
                    featured
                      ? 'bg-gradient-to-b from-[#311410] to-[#4A1C15] text-[#FEFBF5] border-[#E09D3D] shadow-xl'
                      : 'bg-white text-[#331E17] border-[#E8E1D6]'
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-black">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-black">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs ${featured ? 'text-[#E8E1D6]' : 'text-[#745E55]'}`}>
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-xs font-bold">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#E09D3D]" />
                        <span>Up to {plan.maxBranches} Branch(es)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#E09D3D]" />
                        <span>Up to {plan.maxTables} Tables / QR Points</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#E09D3D]" />
                        <span>{plan.maxOrdersPerMonth.toLocaleString('en-IN')} Orders / Month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#E09D3D]" />
                        <span>Up to {plan.maxStaffUsers} Staff Logins</span>
                      </li>
                      {plan.hasKds && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#E09D3D]" />
                          <span>Kitchen Display System (KDS)</span>
                        </li>
                      )}
                      {plan.hasInventory && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#E09D3D]" />
                          <span>Inventory &amp; Recipe BOM</span>
                        </li>
                      )}
                      {plan.hasAdvancedReports && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#E09D3D]" />
                          <span>GST &amp; Sales Reports</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <Link
                    href={`/register?plan=${encodeURIComponent(plan.slug)}`}
                    className={`mt-8 w-full py-3 rounded-2xl text-sm font-extrabold text-center transition-colors ${
                      featured
                        ? 'bg-[#E09D3D] hover:bg-[#d18f30] text-[#331E17]'
                        : 'bg-[#AA1B2A] hover:bg-[#80101C] text-white'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="py-14 bg-[#F7F2EA] border-t border-[#E8E1D6]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-black text-center text-[#331E17] mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const open = openFaq === idx;
                return (
                  <div key={faq.q} className="rounded-2xl border border-[#E8E1D6] bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-extrabold text-[#331E17]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#AA1B2A] flex-shrink-0 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open && (
                      <div className="px-5 pb-4 text-sm text-[#745E55] leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact & Callback Section */}
        <section id="contact" className="py-16 bg-[#311410] text-[#FEFBF5] border-t-2 border-[#E09D3D]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                Your Restaurant Deserves Smarter Management.
              </h2>
              <p className="text-[#E8E1D6] text-sm sm:text-base leading-relaxed">
                Register your outlet online or leave your phone number and we will set up your menu,
                QR standees, and 80mm / 58mm thermal printing.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-2xl bg-[#E09D3D] hover:bg-[#d18f30] text-[#331E17] font-black text-sm"
                >
                  Register Restaurant
                </Link>
                <Link
                  href="/application-status"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15"
                >
                  Check Application Status
                </Link>
              </div>

              <div className="pt-4 space-y-2 text-sm text-[#E8E1D6]">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#E09D3D]" />
                  <span>+91 70820 40809 / +91 70820 40892</span>
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

            <div className="lg:col-span-6">
              <form
                onSubmit={handleContact}
                className="bg-[#FEFBF5] text-[#331E17] rounded-3xl p-6 sm:p-8 shadow-xl space-y-3.5 border border-[#E09D3D]/40"
              >
                <h3 className="text-lg font-black">Request a Callback</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E1D6] text-sm focus:outline-none focus:border-[#AA1B2A]"
                  />
                  <input
                    type="text"
                    placeholder="Restaurant / Café Name"
                    value={form.restaurantName}
                    onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E1D6] text-sm focus:outline-none focus:border-[#AA1B2A]"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E1D6] text-sm focus:outline-none focus:border-[#AA1B2A]"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E1D6] text-sm focus:outline-none focus:border-[#AA1B2A]"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Tell us about your outlet (80mm / 58mm printer, QR menu, tables)..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E1D6] text-sm focus:outline-none focus:border-[#AA1B2A]"
                />

                {formState === 'sent' && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    {formMsg}
                  </div>
                )}
                {formState === 'error' && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    {formMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formState === 'sending'}
                  className="w-full py-3 rounded-xl bg-[#AA1B2A] hover:bg-[#80101C] text-white font-extrabold text-sm transition-colors disabled:opacity-60"
                >
                  {formState === 'sending' ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#230E0B] text-[#E8E1D6] py-8 border-t border-[#E09D3D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/aapno-khano-logo.png"
              alt="Aapno Khano POS"
              className="h-8 w-auto bg-white rounded-lg p-0.5"
            />
            <span>
              © 2026 आपणो खाणो (Aapno Khaano) POS • Built by{' '}
              <a
                href="https://rudrawebx.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E09D3D] font-extrabold hover:underline"
              >
                Rudra Web X
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-bold">
            <Link href="/login" className="hover:text-[#E09D3D]">
              Login
            </Link>
            <Link href="/register" className="hover:text-[#E09D3D]">
              Register
            </Link>
            <button type="button" onClick={() => setLegalModal('privacy')} className="hover:text-[#E09D3D]">
              Privacy
            </button>
            <button type="button" onClick={() => setLegalModal('terms')} className="hover:text-[#E09D3D]">
              Terms
            </button>
          </div>
        </div>
      </footer>

      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FEFBF5] text-[#331E17] rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E09D3D]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black">
                {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button type="button" onClick={() => setLegalModal(null)} className="p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#745E55] leading-relaxed">
              {legalModal === 'privacy'
                ? 'Each restaurant account keeps its orders, menus, staff logins, and inventory strictly isolated. Callback requests are used solely for onboarding support.'
                : 'Aapno Khano POS provides cloud billing, QR ordering, KDS, and inventory tools for registered outlets. Each restaurant manages its own GSTIN, FSSAI, and tax rates.'}
            </p>
            <button
              type="button"
              onClick={() => setLegalModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#AA1B2A] text-white text-xs font-extrabold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
