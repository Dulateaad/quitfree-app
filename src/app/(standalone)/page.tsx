'use client';

import { useState, useEffect } from 'react';
import { addToWaitlist, findWaitlistByEmail, updateWaitlistA2HS } from '@/lib/waitlist';
import { event } from '@/lib/analytics';
import { MessageCircle, Clock, Heart, Bell, Plus, Mail } from 'lucide-react';
import { LiquidGlassCard } from '@/components/ui/liquid-glass';
import { cn } from '@/utils/cn';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [docId, setDocId] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'subscribed' | 'denied' | 'unsupported'>('idle');
  const [showA2HSInstructions, setShowA2HSInstructions] = useState(false);
  const [a2hsDone, setA2hsDone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => Promise<{ outcome: string }> } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt: () => Promise<{ outcome: string }> });
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setMessage('');
    try {
      const id = await addToWaitlist(email.trim());
      setDocId(id);
      setStatus('success');
      setMessage("You're on the list!");
      event('waitlist_signup', { method: 'email' });
      fetch('/api/waitlist-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      }).catch(() => {});
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const handlePushSubscribe = async () => {
    if (!VAPID_PUBLIC || !('PushManager' in window) || !('serviceWorker' in navigator)) {
      setPushStatus('unsupported');
      return;
    }
    setPushStatus('loading');
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await reg.update();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as BufferSource,
      });
      const json = sub.toJSON();
      const existingId = docId ?? (email ? await findWaitlistByEmail(email) : null);
      if (existingId) {
        const { updateWaitlistPush } = await import('@/lib/waitlist');
        await updateWaitlistPush(existingId, json);
      } else if (email) {
        await addToWaitlist(email, { pushSubscription: json });
      }
      setPushStatus('subscribed');
      event('push_subscribe', { status: 'subscribed' });
    } catch (err) {
      if ((err as Error).name === 'NotAllowedError') setPushStatus('denied');
      else setPushStatus('unsupported');
    }
  };

  const handleAddClick = async () => {
    if (deferredPrompt) {
      const { outcome } = await deferredPrompt.prompt();
      if (outcome === 'accepted') {
        setA2hsDone(true);
        if (docId) updateWaitlistA2HS(docId).catch(() => {});
        event('add_to_home_screen', { outcome: 'accepted' });
      }
    } else {
      setShowA2HSInstructions((v) => !v);
    }
  };

  const handleA2HSConfirm = () => {
    setA2hsDone(true);
    setShowA2HSInstructions(false);
    if (docId) updateWaitlistA2HS(docId).catch(() => {});
    event('add_to_home_screen', { outcome: 'manual_confirm' });
  };

  return (
    <main className="min-h-[100dvh] relative overflow-hidden">
      {/* Full background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/waitlist-bg.png)' }}
      />
      <div className="absolute inset-0 bg-black/25" />

      <div
        className={cn(
          'relative z-10 px-4 max-w-lg mx-auto',
          /* Extra space under notch / Dynamic Island + safe area */
          'pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+1.75rem))] sm:pt-[max(2rem,calc(env(safe-area-inset-top,0px)+0.5rem))]',
          'pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] sm:py-10',
        )}
      >
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-white/80 mb-1 sm:mb-2 leading-snug px-1">
            A gentle digital program to help you get ready to quit smoking
          </p>
          <h1 className="text-[1.65rem] sm:text-4xl font-serif text-white leading-[1.15] mb-2 sm:mb-3 drop-shadow-lg px-0.5">
            You don&apos;t need to quit smoking{' '}
            <span className="text-orange-400" style={{ textShadow: '0 0 20px rgba(255,140,0,0.5)' }}>today</span>
          </h1>
          <p className="text-sm sm:text-lg text-white/70 leading-snug">
            Start getting ready, at your own pace
          </p>
        </div>

        {/* Content card — This might feel familiar */}
        <LiquidGlassCard
          glowIntensity="sm"
          shadowIntensity="md"
          borderRadius="20px"
          blurIntensity="lg"
          className="p-4 sm:p-5 mb-3 sm:mb-5"
        >
          <h2 className="text-sm sm:text-base font-medium text-white/90 mb-2.5 sm:mb-3">
            This might feel familiar:
          </h2>
          <ul className="space-y-0">
            {[
              { icon: MessageCircle, text: "You've been thinking about quitting for a while", color: 'orange' },
              { icon: Clock, text: "You've tried before — but it didn't really stick", color: 'blue' },
              { icon: Heart, text: "It feels like it's time to stop — but it keeps getting pushed away", color: 'orange' },
            ].map(({ icon: Icon, text, color }) => (
              <li
                key={text}
                className="flex items-center gap-3 py-2 sm:py-2.5 border-b border-white/10 last:border-0 last:pb-0 first:pt-0"
              >
                <Icon
                  className={cn('w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0', color === 'blue' ? 'text-blue-400' : 'text-orange-400')}
                  style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}
                />
                <span className="text-white/90 text-[13px] sm:text-[15px] leading-snug text-left">{text}</span>
              </li>
            ))}
          </ul>
        </LiquidGlassCard>

        {/* Get early access — same corner radius as card above (no “capsule”) */}
        <LiquidGlassCard
          glowIntensity="sm"
          shadowIntensity="md"
          blurIntensity="sm"
          borderRadius="20px"
          className="mb-2 sm:mb-4 overflow-hidden p-1"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5 p-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              required
              disabled={status === 'loading'}
              className="flex-1 min-w-0 px-3 sm:px-4 h-11 rounded-xl bg-white/5 text-white placeholder-white/45 focus:outline-none focus:ring-2 focus:ring-orange-400/40 text-[15px] border border-white/10"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className={cn(
                'h-11 w-full sm:w-auto shrink-0 rounded-xl px-5 sm:px-6 text-sm font-semibold tracking-wide text-white',
                'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
                'shadow-[0_4px_20px_rgba(251,146,60,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]',
                'border border-orange-300/40',
                'transition-all duration-200',
                'hover:shadow-[0_6px_28px_rgba(251,146,60,0.55)] hover:brightness-105 hover:scale-[1.02]',
                'active:scale-[0.98]',
                'disabled:opacity-55 disabled:hover:scale-100 disabled:hover:shadow-[0_4px_20px_rgba(251,146,60,0.45)]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50'
              )}
            >
              {status === 'loading' ? '…' : 'Get early access'}
            </button>
          </form>
          <p className="mt-1 flex items-start gap-2 text-[11px] sm:text-xs text-white/60 px-3 pb-2 sm:pb-3 leading-snug">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
            Get the first gentle exercises and simple guidance by email.
          </p>
          {message && (
            <p className={cn('text-sm px-3 pb-2 sm:pb-3', status === 'error' ? 'text-red-400' : 'text-emerald-400')}>
              {message}
            </p>
          )}
        </LiquidGlassCard>

        {/* Enable Notifications — compact row */}
        {VAPID_PUBLIC && (
          <LiquidGlassCard glowIntensity="md" shadowIntensity="sm" blurIntensity="sm" borderRadius="18px" className="mb-2 group">
            <button
              onClick={handlePushSubscribe}
              disabled={pushStatus === 'loading' || pushStatus === 'subscribed'}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-left text-white font-medium',
                'transition-all duration-200 active:scale-[0.99]',
                'hover:bg-white/[0.06]',
                'disabled:cursor-default',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-[17px]'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  'bg-gradient-to-br from-white/15 to-white/5 ring-1 ring-white/20 shadow-inner',
                  'group-hover:ring-orange-300/40 group-hover:shadow-[0_0_20px_rgba(251,146,60,0.2)]',
                  'transition-all duration-200'
                )}
              >
                <Bell className={cn('w-5 h-5', pushStatus === 'subscribed' ? 'text-emerald-400' : 'text-white')} />
              </span>
              <span className="text-sm leading-snug">
                {pushStatus === 'subscribed' ? 'Notifications enabled' : pushStatus === 'loading' ? 'Enabling…' : 'Enable Notifications'}
              </span>
            </button>
          </LiquidGlassCard>
        )}

        {/* Add to Home Screen — compact row */}
        <LiquidGlassCard
          glowIntensity="md"
          shadowIntensity="sm"
          blurIntensity="sm"
          borderRadius="18px"
          className="mb-3 sm:mb-5 overflow-hidden group"
        >
          <button
            onClick={handleAddClick}
            disabled={a2hsDone}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-left text-white font-medium',
              'transition-all duration-200 active:scale-[0.99]',
              'hover:bg-white/[0.06]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-[17px]',
              a2hsDone && 'opacity-70 cursor-default hover:bg-transparent'
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                'bg-gradient-to-br from-sky-400/25 to-blue-600/20 ring-1 ring-sky-400/35 shadow-inner',
                'group-hover:ring-sky-300/50 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]',
                'transition-all duration-200'
              )}
            >
              <Plus className="w-[18px] h-[18px] text-sky-100" strokeWidth={2.5} />
            </span>
            <span className="text-sm leading-snug">{a2hsDone ? 'Added to Home Screen' : 'Add to Home Screen'}</span>
          </button>

          {showA2HSInstructions && !deferredPrompt && (
            <LiquidGlassCard glowIntensity="sm" shadowIntensity="sm" blurIntensity="md" borderRadius="16px" className="mt-4 mx-4 mb-4 p-4">
              <p className="font-medium text-white/90">Instructions:</p>
              <p>1) Tap &quot;Add to Home Screen&quot;</p>
              <p>2) Tap &quot;Add&quot; in the top right</p>
              <button
                onClick={handleA2HSConfirm}
                className={cn(
                  'w-full py-3 mt-3 rounded-xl text-sm font-semibold tracking-wide text-emerald-50',
                  'bg-gradient-to-br from-emerald-500/90 to-teal-600/90',
                  'border border-emerald-400/50',
                  'shadow-[0_4px_18px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]',
                  'transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_24px_rgba(16,185,129,0.45)] active:scale-[0.98]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40'
                )}
              >
                I&apos;ve added it
              </button>
            </LiquidGlassCard>
          )}
        </LiquidGlassCard>

        {/* Footer — tight so more fits above the fold */}
        <p className="text-xs sm:text-sm text-white/70 text-center mb-1 leading-snug">
          No pressure | At your own pace | You can leave anytime
        </p>
        <p className="text-[10px] sm:text-[11px] text-white/40 text-center mb-0.5 leading-snug px-2">
          This is not medical advice. It does not replace professional care.
        </p>
        <p className="text-[10px] sm:text-[11px] text-white/40 text-center">18+ | Privacy & Terms</p>
      </div>
    </main>
  );
}
