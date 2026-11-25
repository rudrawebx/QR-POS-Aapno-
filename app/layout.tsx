import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pos.aapnokhano.com'),
  title: 'Aapno Khano POS | Run Your Restaurant. Not Your Paperwork.',
  description:
    'Complete multi-outlet restaurant management SaaS: Touch POS Billing, QR Code Menu & Car Drive-In Ordering, Kitchen Display System (KDS), 80mm & 58mm Thermal KOT, Recipe BOM Inventory, and Real-Time GST Analytics.',
  keywords: [
    'Restaurant POS India',
    'QSR POS Software',
    'QR Code Menu Ordering',
    'Kitchen Display System KDS',
    'Thermal GST Billing Software',
    'Aapno Khano POS',
  ],
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
    <html lang="en" className={`h-full scroll-smooth ${manrope.variable}`}>
      <body className="min-h-full flex flex-col antialiased bg-[#FAF6EE] text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}
