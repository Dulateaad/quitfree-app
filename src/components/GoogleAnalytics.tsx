'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { pageview, isGAEnabled } from '@/lib/analytics';

function GAInner() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isGAEnabled() || !pathname) return;
    pageview(pathname);
  }, [pathname]);

  return null;
}

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <GAInner />
      </Suspense>
    </>
  );
}
