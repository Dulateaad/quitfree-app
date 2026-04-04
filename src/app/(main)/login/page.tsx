'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWaitlistAuth } from '@/context/waitlist-auth';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthed } = useWaitlistAuth();
  const router = useRouter();

  if (isAuthed) {
    router.replace('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const ok = await login(email);
      if (ok) {
        router.replace('/');
      } else {
        setError('This email is not on the waitlist. Sign up first!');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Heart className="w-10 h-10 text-purple-400 mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-1">QuitFree</h1>
          <p className="text-white/50 text-sm">Enter your waitlist email to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="name@email.com"
            required
            disabled={loading}
            autoFocus
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-[15px] transition-all"
          />

          {error && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-red-400 text-sm text-center">{error}</p>
              <button
                type="button"
                onClick={() => router.push('/waitlist')}
                className="text-orange-400 text-sm underline underline-offset-2 hover:text-orange-300 transition-colors"
              >
                Join the waitlist
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className={cn(
              'w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide text-white flex items-center justify-center gap-2',
              'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600',
              'shadow-[0_4px_20px_rgba(139,92,246,0.35)]',
              'transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_28px_rgba(139,92,246,0.45)]',
              'active:scale-[0.98]',
              'disabled:opacity-50 disabled:hover:brightness-100 disabled:hover:shadow-[0_4px_20px_rgba(139,92,246,0.35)]',
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-8">
          Only users on the waitlist can access the app
        </p>
      </div>
    </main>
  );
}
