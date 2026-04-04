import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { WaitlistAuthProvider } from '@/context/waitlist-auth';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'QuitFree.ai — Quit smoking at your own pace',
  description: 'A gentle digital program to help you get ready to quit smoking',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
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
        <WaitlistAuthProvider>
          {children}
        </WaitlistAuthProvider>
      </body>
    </html>
  );
}
