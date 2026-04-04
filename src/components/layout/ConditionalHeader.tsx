'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Скрываем Header на страницах главной, login, lesson, question
  const hideHeader = pathname === '/home' ||
                     pathname === '/login' || 
                     pathname === '/lesson' || 
                     pathname === '/question';

  if (hideHeader) {
    return null;
  }

  return <Header />;
}

