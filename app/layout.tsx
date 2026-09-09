import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aapno Khano | International QR Restaurant POS, KOT, Billing & SaaS Platform',
  description:
    'Complete production-ready multi-tenant restaurant QR ordering, POS terminal, Kitchen Display System (KDS), thermal KOT printing, Razorpay payments, and Super Admin SaaS platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
