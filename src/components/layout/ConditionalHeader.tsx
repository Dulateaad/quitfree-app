'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Скрываем Header на страницах главной, login, lesson, question
  const hideHeader = pathname === '/' ||
                     pathname === '/login' || 
                     pathname === '/lesson' || 
                     pathname === '/question' ||
                     pathname?.startsWith('/waitlist');

  if (hideHeader) {
    return null;
  }

  return <Header />;
}

