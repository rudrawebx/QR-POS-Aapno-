'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChefHat,
  ChevronDown,
  CreditCard,
  Flame,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Plus,
  Printer,
  QrCode,
  Users,
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

const POS_DISHES = [
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
    category: 'Main Course',
    price: 240,
    isVeg: false,
    img: '/images/menu/Egg Curry.png',
  },
  {
    id: 'd4',
    name: 'Mint Green Chutney',
    category: 'Sides',
    price: 40,
    isVeg: true,
    img: '/images/menu/green-chutney.png',
  },
  {
    id: 'd5',
    name: 'Sprite 500ml',
    category: 'Drinks',
    price: 45,
    isVeg: true,
    img: '/images/menu/Sprite 500 ml.jpg',
  },
  {
    id: 'd6',
    name: 'Bisleri Water 1L',
    category: 'Drinks',
    price: 20,
    isVeg: true,
    img: '/images/menu/Bisleri Water.jpg',
  },
];

const CORE_FEATURES = [
  {
    title: 'Counter POS & GST Billing',
    desc: 'Fast touch billing with cash, UPI, card and split payments. Prints clean 80mm or 2-inch (58mm) GST thermal receipts.',
    icon: CreditCard,
  },
  {
    title: 'QR Table & Car Ordering',
    desc: 'Guests scan a table or parking-bay QR on their phone, pick dishes, and pay via UPI without installing any app.',
    icon: QrCode,
  },
  {
    title: 'Kitchen Display & KOT',
    desc: 'Orders go straight to the kitchen screen and KOT printer, sorted by station (Tandoor, Handi, Snacks, Drinks).',
    icon: ChefHat,
  },
  {
    title: 'Live Order Tracking',
    desc: 'Manage dine-in tables, takeaway parcels, and car service orders in one live board with audio order alerts.',
    icon: Flame,
  },
  {
    title: 'Raw Inventory & Recipes',
    desc: 'Track ingredients, suppliers, and purchase orders. Stock automatically reduces when dishes are billed.',
    icon: Package,
  },
  {
    title: 'Staff PINs & Daily Reports',
    desc: 'Separate logins for Owner, Manager, Cashier, and Chef, plus daily Z-reports and CGST/SGST tax summaries.',
    icon: Users,
  },
];

const FAQS = [
  {
    q: 'Does it work with both 80mm and 2-inch (58mm) thermal printers?',
    a: 'Yes. Each restaurant outlet can choose 80mm standard receipts or 2-inch (58mm) compact receipts for both customer GST bills and kitchen KOTs.',
  },
  {
    q: 'Can each outlet have its own menu, logo, and inventory?',
    a: 'Yes. Every outlet has its own menu (with or without dish photos), its own logo on the POS and bill, separate inventory, and isolated sales reports.',
  },
  {
    q: 'How does QR ordering work for tables and car service?',
    a: 'Place a printed QR standee on each table or parking bay. Guests scan it, browse your menu, enter their table or car number, and pay via UPI or Razorpay.',
  },
  {
    q: 'Are GSTIN and FSSAI numbers printed on the bill?',
    a: 'Yes. Your GSTIN, FSSAI license number, CGST/SGST breakdown, invoice number, and custom footer appear automatically on every receipt.',
  },
  {
    q: 'How do I get started for my restaurant?',
    a: 'Click Get Started to submit your restaurant details, or fill out the callback form below. Once approved, your QSR terminal and owner login are ready immediately.',
  },
];

export default function LandingPageClient({ plans, stats }: LandingPageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  // Interactive Hero POS Preview state
  const [activeCat, setActiveCat] = useState('All');
  const [ticket, setTicket] = useState<{ id: string; name: string; price: number; qty: number }[]>([
    { id: 'd2', name: 'Chana Masala Handi', price: 219, qty: 1 },
  ]);

  // Contact form state
  const [form, setForm] = useState({
    name: '',
    restaurantName: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [formMsg, setFormMsg] = useState('');

  const addDish = (dish: (typeof POS_DISHES)[number]) => {
    setTicket((prev) => {
      const found = prev.find((i) => i.id === dish.id);
      if (found) {
        return prev.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: dish.id, name: dish.name, price: dish.price, qty: 1 }];
    });
  };

  const ticketCount = ticket.reduce((s, i) => s + i.qty, 0);
  const ticketTotal = ticket.reduce((s, i) => s + i.price * i.qty, 0);

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
        setFormMsg(data.error || 'Could not send message.');
        return;
      }
      setFormState('sent');
      setFormMsg(data.message || 'Thank you! We will call you back shortly.');
      setForm({ name: '', restaurantName: '', phone: '', email: '', city: '', message: '' });
    } catch {
      setFormState('error');
      setFormMsg('Network error. Please call +91 70820 40809.');
    }
  };

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Aapno Khano POS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS, Windows',
    url: 'https://pos.aapnokhano.com',
    offers: plans.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: p.monthlyPrice,
      priceCurrency: 'INR',
    })),
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#FBF8F3] text-[#141E30]"
      style={{ fontFamily: 'var(--font-manrope), -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      {/* Floating Clean Header */}
      <header className="sticky top-0 z-50 pt-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md border border-[#E8E0D0] rounded-2xl shadow-sm px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="/images/aapno-khano-logo.png"
              alt="Aapno Khano POS"
              className="h-9 w-auto object-contain"
            />
            <span className="font-extrabold text-base tracking-tight text-[#141E30]">
              Aapno Khano <span className="text-[#C88A2E]">POS</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#141E30] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#141E30] transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-[#141E30] transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#141E30] transition-colors">
              FAQs
            </a>
            <a href="#contact" className="hover:text-[#141E30] transition-colors">
              Contact
            </a>
          </nav>

          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#141E30] hover:bg-[#F5EFE4] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#141E30] hover:bg-[#1E2C45] text-[#FBF8F3] transition-colors"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="lg:hidden p-2 rounded-xl border border-[#E8E0D0] text-[#141E30]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden max-w-7xl mx-auto mt-2 bg-white border border-[#E8E0D0] rounded-2xl p-4 shadow-lg space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-slate-700">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FBF8F3]">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FBF8F3]">
                How it works
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FBF8F3]">
                Pricing
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FBF8F3]">
                FAQs
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FBF8F3]">
                Contact
              </a>
              <Link href="/r/aapno-khano" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#FBF8F3] text-[#C88A2E]">
                Live QR Menu
              </Link>
            </div>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link href="/login" className="flex-1 py-2.5 rounded-xl border border-[#E8E0D0] text-center text-sm font-bold">
                Login
              </Link>
              <Link href="/register" className="flex-1 py-2.5 rounded-xl bg-[#141E30] text-center text-sm font-bold text-white">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section (Inspired by clean Bayaro layout) */}
        <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-block px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E0D0] text-xs font-bold text-slate-600 shadow-2xs">
                  Built for QSRs, Cafés &amp; Drive-In Restaurants
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-[#141E30] leading-[1.08]">
                  Run Your Restaurant.{' '}
                  <span className="text-[#C88A2E]">Not Your Paperwork.</span>
                </h1>

                <p className="text-base text-slate-600 leading-relaxed">
                  Fast counter billing, table &amp; car QR ordering, kitchen KOT display, and GST
                  thermal printing — designed for busy cashiers, chefs, and restaurant owners.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/register"
                    className="px-6 py-3.5 rounded-2xl bg-[#141E30] hover:bg-[#1E2C45] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#141E30]/15 transition-all"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 text-[#E09D3D]" />
                  </Link>
                  <a
                    href="#features"
                    className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#F5EFE4] text-[#141E30] font-bold text-sm border border-[#E8E0D0] flex items-center gap-2 transition-colors"
                  >
                    <span>Explore Features</span>
                  </a>
                </div>

                {/* Live Outlets Using Platform */}
                <div className="pt-6 border-t border-[#E8E0D0]">
                  <p className="text-xs font-semibold text-slate-500 mb-3">
                    Currently running live at:
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {stats.outlets.map((o) => (
                      <Link
                        key={o.qsrNumber}
                        href={`/r/${o.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E8E0D0] hover:border-[#C88A2E] transition-colors"
                      >
                        <img
                          src={o.logoUrl}
                          alt={o.name}
                          className="w-5 h-5 rounded object-contain"
                        />
                        <span className="text-xs font-bold text-[#141E30]">{o.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Crisp Light POS Product Mockup */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl bg-white border border-[#E5DDD0] shadow-2xl shadow-[#141E30]/10 overflow-hidden lg:transform lg:rotate-[-0.8deg] hover:rotate-0 transition-transform duration-500">
                  <div className="grid grid-cols-12">
                    {/* Sidebar */}
                    <div className="hidden sm:flex sm:col-span-3 bg-[#FCFBF9] border-r border-[#EFE9DD] p-4 flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <img
                            src="/images/aapno-khano-logo.png"
                            alt="Logo"
                            className="w-7 h-7 rounded-lg object-contain"
                          />
                          <span className="text-xs font-extrabold text-[#141E30]">Aapno Khano</span>
                        </div>
                        <div className="space-y-1 text-[11px] font-semibold text-slate-600">
                          <div className="px-2.5 py-2 rounded-xl bg-[#141E30] text-white font-bold">
                            Point of Sale
                          </div>
                          <div className="px-2.5 py-1.5 rounded-xl">Live Orders</div>
                          <div className="px-2.5 py-1.5 rounded-xl">Kitchen KDS</div>
                          <div className="px-2.5 py-1.5 rounded-xl">Menu &amp; Prices</div>
                          <div className="px-2.5 py-1.5 rounded-xl">Tables &amp; QR</div>
                          <div className="px-2.5 py-1.5 rounded-xl">Inventory</div>
                          <div className="px-2.5 py-1.5 rounded-xl">GST Reports</div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#EFE9DD] text-[10px] text-slate-500">
                        <div className="font-bold text-[#141E30]">Counter Terminal</div>
                        <div>80mm &amp; 58mm Ready</div>
                      </div>
                    </div>

                    {/* Menu Grid */}
                    <div className="col-span-12 sm:col-span-9 p-4 sm:p-5 bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1ECE2]">
                        <div className="flex items-center gap-1.5">
                          {['All', 'Starters', 'Main Course', 'Drinks'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setActiveCat(c)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                activeCat === c
                                  ? 'bg-[#141E30] text-white'
                                  : 'bg-[#FBF8F3] text-slate-600 hover:bg-[#F2ECE0]'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Click any dish to test ticket
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {POS_DISHES.filter((d) => activeCat === 'All' || d.category === activeCat).map(
                          (dish) => (
                            <button
                              key={dish.id}
                              type="button"
                              onClick={() => addDish(dish)}
                              className="rounded-2xl border border-[#ECE5D8] hover:border-[#C88A2E] bg-[#FCFBF9] p-2.5 text-left transition-all group"
                            >
                              <div className="h-20 rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                                <img
                                  src={dish.img}
                                  alt={dish.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="text-[10px] font-semibold text-slate-400">
                                {dish.category}
                              </div>
                              <div className="text-xs font-extrabold text-[#141E30] truncate">
                                {dish.name}
                              </div>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs font-extrabold text-[#C88A2E]">
                                  ₹{dish.price}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-[#141E30] text-white text-[10px] font-bold flex items-center gap-0.5">
                                  <Plus className="w-3 h-3" /> Add
                                </span>
                              </div>
                            </button>
                          )
                        )}
                      </div>

                      {/* Bottom Ticket Summary Bar */}
                      <div className="mt-4 pt-3 border-t border-[#F1ECE2] flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-slate-600">
                          <span className="font-extrabold text-[#141E30]">{ticketCount} items</span>{' '}
                          on ticket • Subtotal{' '}
                          <span className="font-extrabold text-[#141E30]">₹{ticketTotal}</span> + 5%
                          GST
                        </div>
                        <Link
                          href="/login?redirect=/admin/pos"
                          className="px-4 py-2 rounded-xl bg-[#C88A2E] hover:bg-[#B47A22] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Open Real POS</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verified Stats Bar */}
        <section className="border-y border-[#E8E0D0] bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#141E30]">
                {stats.restaurants}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Active Outlets</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#C88A2E]">
                {stats.orders.toLocaleString('en-IN')}+
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Orders Processed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#141E30]">
                {stats.products}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Active Menu Items</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#141E30]">
                {stats.tables}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Tables &amp; QR Points</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#C88A2E]">
              Core Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141E30] mt-2">
              Built around how a real restaurant actually works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-3xl p-6 border border-[#E8E0D0] hover:border-[#C88A2E] transition-colors space-y-3"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#FBF8F3] border border-[#E8E0D0] text-[#141E30] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#C88A2E]" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#141E30]">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works + Hardware Showcase */}
        <section id="how-it-works" className="py-20 bg-white border-y border-[#E8E0D0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#C88A2E]">
                How It Works
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141E30]">
                From Table or Counter to Kitchen in Seconds
              </h2>

              <div className="space-y-4 pt-2">
                {[
                  {
                    n: '1',
                    title: 'Take Order on POS or QR Menu',
                    desc: 'Cashier punches an order on touch POS, or guest scans a table/car QR and pays via UPI.',
                  },
                  {
                    n: '2',
                    title: 'Kitchen Gets Instant KOT & KDS Ticket',
                    desc: 'Dishes route to the right kitchen station with prep timers and special cooking notes.',
                  },
                  {
                    n: '3',
                    title: 'Print GST Bill & Update Stock',
                    desc: '80mm or 58mm thermal bill prints with GSTIN & FSSAI while raw ingredients auto-deduct.',
                  },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-[#141E30] text-[#E09D3D] font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                      {step.n}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#141E30]">{step.title}</h3>
                      <p className="text-sm text-slate-600 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/r/aapno-khano"
                  target="_blank"
                  className="px-5 py-3 rounded-xl bg-[#141E30] text-white text-sm font-bold hover:bg-[#1E2C45] transition-colors"
                >
                  Try Live QR Menu
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-3 rounded-xl bg-[#FBF8F3] border border-[#E8E0D0] text-[#141E30] text-sm font-bold hover:bg-[#F2ECE0] transition-colors"
                >
                  Staff Portal Login
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-[#FBF8F3] border border-[#E8E0D0] p-4 shadow-sm">
                <img
                  src="/images/pos-hardware-showcase.png"
                  alt="Aapno Khano POS Terminal, Thermal Printer and QR Standee"
                  className="w-full h-auto rounded-2xl object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section (Real DB Plans) */}
        <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#C88A2E]">
              Simple Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141E30] mt-2">
              Plans for Single QSRs &amp; Multi-Outlet Brands
            </h2>

            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-[#E8E0D0] mt-6">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                  billingCycle === 'monthly' ? 'bg-[#141E30] text-white' : 'text-slate-600'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                  billingCycle === 'yearly' ? 'bg-[#141E30] text-white' : 'text-slate-600'
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
                      ? 'bg-[#141E30] text-white border-[#C88A2E] shadow-xl'
                      : 'bg-white text-[#141E30] border-[#E8E0D0]'
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-extrabold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs ${featured ? 'text-slate-300' : 'text-slate-500'}`}>
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-xs font-semibold">
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
                    className={`mt-8 w-full py-3 rounded-2xl text-sm font-bold text-center transition-colors ${
                      featured
                        ? 'bg-[#C88A2E] hover:bg-[#D4A037] text-white'
                        : 'bg-[#141E30] hover:bg-[#1E2C45] text-white'
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
        <section id="faq" className="py-16 bg-white border-t border-[#E8E0D0]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-[#141E30] mb-8">
              Common Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const open = openFaq === idx;
                return (
                  <div key={faq.q} className="rounded-2xl border border-[#E8E0D0] bg-[#FBF8F3]">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-bold text-[#141E30]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#C88A2E] flex-shrink-0 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open && (
                      <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact & Final CTA */}
        <section id="contact" className="py-20 bg-[#141E30] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Your Restaurant Deserves Smarter Management.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Register your restaurant online or leave your number and our team will help you set
                up your menu, QR standees, and thermal printer.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-2xl bg-[#C88A2E] hover:bg-[#D4A037] text-white font-bold text-sm"
                >
                  Get Started
                </Link>
                <Link
                  href="/application-status"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15"
                >
                  Check Application Status
                </Link>
              </div>

              <div className="pt-4 space-y-2 text-sm text-slate-300">
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
                className="bg-white text-[#141E30] rounded-3xl p-6 sm:p-8 shadow-xl space-y-3.5"
              >
                <h3 className="text-lg font-extrabold">Request a Callback</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#141E30]"
                  />
                  <input
                    type="text"
                    placeholder="Restaurant / Café Name"
                    value={form.restaurantName}
                    onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#141E30]"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#141E30]"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#141E30]"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="What printer size or setup do you need? (80mm / 58mm, QR menu, etc.)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#141E30]"
                />

                {formState === 'sent' && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    {formMsg}
                  </div>
                )}
                {formState === 'error' && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {formMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formState === 'sending'}
                  className="w-full py-3 rounded-xl bg-[#141E30] hover:bg-[#1E2C45] text-white font-bold text-sm transition-colors disabled:opacity-60"
                >
                  {formState === 'sending' ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="bg-[#0D1420] text-slate-300 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/aapno-khano-logo.png"
              alt="Aapno Khano POS"
              className="h-8 w-auto bg-white rounded-lg p-0.5"
            />
            <span>
              © 2026 Aapno Khano POS • Built by{' '}
              <a
                href="https://rudrawebx.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E09D3D] font-bold hover:underline"
              >
                Rudra Web X
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
            <Link href="/register" className="hover:text-white">
              Register
            </Link>
            <button type="button" onClick={() => setLegalModal('privacy')} className="hover:text-white">
              Privacy
            </button>
            <button type="button" onClick={() => setLegalModal('terms')} className="hover:text-white">
              Terms
            </button>
          </div>
        </div>
      </footer>

      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-[#141E30] rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold">
                {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button type="button" onClick={() => setLegalModal(null)} className="p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {legalModal === 'privacy'
                ? 'Each restaurant account keeps its orders, menus, staff logins, and inventory strictly isolated. Callback inquiries are used only to contact you about onboarding.'
                : 'Aapno Khano POS provides cloud billing, QR ordering, KDS, and inventory tools for registered restaurants. Each outlet manages its own GSTIN, FSSAI, and tax rates.'}
            </p>
            <button
              type="button"
              onClick={() => setLegalModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#141E30] text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
