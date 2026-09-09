import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'आपणो खाणो (Aapno Khaano) | Restaurant POS, QR & Drive-In SaaS',
  description:
    'Complete production-ready multi-tenant restaurant QR ordering, POS terminal, Kitchen Display System (KDS), 80mm thermal KOT printing, Razorpay/UPI payments, and Super Admin SaaS platform.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'आपणो खाणो (Aapno Khaano) | Royal Rajasthani POS & QR Ordering',
    description: 'Cloud POS, 80mm Thermal KOT, Live Kitchen Display & Direct UPI Payments',
    images: ['/images/aapno-khano-logo.png'],
  },
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
