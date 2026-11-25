import React from 'react';
import prisma from '@/lib/prisma';
import LandingPageClient, { PublicPlan, PlatformStats } from '@/components/LandingPageClient';

export const revalidate = 60;

const FALLBACK_PLANS: PublicPlan[] = [
  {
    id: 'plan_starter',
    name: 'QSR Starter Plan',
    slug: 'starter',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    currency: 'INR',
    maxBranches: 1,
    maxTables: 20,
    maxOrdersPerMonth: 1000,
    maxStaffUsers: 5,
    hasKds: true,
    hasMultiStation: false,
    hasInventory: false,
    hasCustomBranding: true,
    hasAdvancedReports: false,
  },
  {
    id: 'plan_pro',
    name: 'QSR Professional Plan',
    slug: 'professional',
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    currency: 'INR',
    maxBranches: 3,
    maxTables: 50,
    maxOrdersPerMonth: 5000,
    maxStaffUsers: 15,
    hasKds: true,
    hasMultiStation: true,
    hasInventory: true,
    hasCustomBranding: true,
    hasAdvancedReports: true,
  },
  {
    id: 'cmwknjqzb0008u9hod19bpae5',
    name: 'QSR Professional Pro',
    slug: 'qsr-professional-pro-mwknjqz8',
    monthlyPrice: 5499,
    yearlyPrice: 24990,
    currency: 'INR',
    maxBranches: 2,
    maxTables: 50,
    maxOrdersPerMonth: 2000,
    maxStaffUsers: 10,
    hasKds: true,
    hasMultiStation: true,
    hasInventory: true,
    hasCustomBranding: true,
    hasAdvancedReports: true,
  },
];

const FALLBACK_STATS: PlatformStats = {
  restaurants: 3,
  orders: 3089,
  products: 197,
  tables: 57,
  outlets: [
    {
      name: 'आपणो खाणो (Aapno Khaano)',
      qsrNumber: 'QSR01',
      city: 'Fatehabad',
      slug: 'aapno-khano',
      logoUrl: '/images/aapno-khano-logo.png',
    },
    {
      name: 'Mr. Bagri',
      qsrNumber: 'QSR02',
      city: 'Panchkula',
      slug: 'mr-bagri',
      logoUrl: '/images/mr-bagri-logo.jpg',
    },
    {
      name: 'Love Greens & Health Cafe',
      qsrNumber: 'QSR03',
      city: 'Hisar',
      slug: 'love-greens',
      logoUrl: '/images/love-greens-logo.jpg',
    },
  ],
};

export default async function HomePage() {
  let plans = FALLBACK_PLANS;
  let stats = FALLBACK_STATS;

  try {
    const [dbPlans, restaurantCount, orderCount, productCount, tableCount, activeOutlets] =
      await Promise.all([
        prisma.subscriptionPlan.findMany({
          where: { isActive: true },
          orderBy: { monthlyPrice: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            monthlyPrice: true,
            yearlyPrice: true,
            currency: true,
            maxBranches: true,
            maxTables: true,
            maxOrdersPerMonth: true,
            maxStaffUsers: true,
            hasKds: true,
            hasMultiStation: true,
            hasInventory: true,
            hasCustomBranding: true,
            hasAdvancedReports: true,
          },
        }),
        prisma.restaurant.count({ where: { isActive: true } }),
        prisma.order.count(),
        prisma.product.count({ where: { isAvailable: true } }),
        prisma.table.count(),
        prisma.restaurant.findMany({
          where: { isActive: true },
          orderBy: { qsrNumber: 'asc' },
          select: {
            name: true,
            qsrNumber: true,
            city: true,
            slug: true,
            logoUrl: true,
          },
        }),
      ]);

    if (dbPlans.length > 0) {
      plans = dbPlans;
    }

    stats = {
      restaurants: restaurantCount || FALLBACK_STATS.restaurants,
      orders: orderCount || FALLBACK_STATS.orders,
      products: productCount || FALLBACK_STATS.products,
      tables: tableCount || FALLBACK_STATS.tables,
      outlets:
        activeOutlets.length > 0
          ? activeOutlets.map((o) => ({
              name: o.name,
              qsrNumber: o.qsrNumber || 'QSR',
              city: o.city || 'India',
              slug: o.slug,
              logoUrl: o.logoUrl || '/images/aapno-khano-logo.png',
            }))
          : FALLBACK_STATS.outlets,
    };
  } catch {
    // Safe fallback to verified baseline
  }

  return <LandingPageClient plans={plans} stats={stats} />;
}
