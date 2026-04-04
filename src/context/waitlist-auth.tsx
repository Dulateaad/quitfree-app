'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { findWaitlistByEmail } from '@/lib/waitlist';

interface WaitlistAuth {
  email: string | null;
  docId: string | null;
  isAuthed: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const WaitlistAuthContext = createContext<WaitlistAuth>({
  email: null,
  docId: null,
  isAuthed: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

const STORAGE_KEY = 'qf_waitlist_email';

export function WaitlistAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    findWaitlistByEmail(stored)
      .then((id) => {
        if (id) {
          setEmail(stored);
          setDocId(id);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (raw: string): Promise<boolean> => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return false;
    const id = await findWaitlistByEmail(trimmed);
    if (!id) return false;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setEmail(trimmed);
    setDocId(id);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEmail(null);
    setDocId(null);
  }, []);

  return (
    <WaitlistAuthContext.Provider value={{ email, docId, isAuthed: !!docId, isLoading, login, logout }}>
      {children}
    </WaitlistAuthContext.Provider>
  );
}

export const useWaitlistAuth = () => useContext(WaitlistAuthContext);
