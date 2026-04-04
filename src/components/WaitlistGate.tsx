'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWaitlistAuth } from '@/context/waitlist-auth';

const PUBLIC_PATHS = ['/login'];

export function WaitlistGate({ children }: { children: React.ReactNode }) {
  const { isAuthed, isLoading } = useWaitlistAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname?.startsWith(p + '/')
  );

  useEffect(() => {
    if (!isLoading && !isAuthed && !isPublic) {
      router.replace('/login');
    }
  }, [isLoading, isAuthed, isPublic, router]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthed && !isPublic) return null;

  return <>{children}</>;
}
