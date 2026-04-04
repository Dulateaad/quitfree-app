import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'QuitFree.ai - Бросьте курить навсегда',
  description: 'Приложение для помощи в отказе от курения',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QuitFree',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="bg-black text-white">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
