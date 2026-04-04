'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, SkipBack, SkipForward, ChevronRight } from 'lucide-react';
import { getStartNode, getNextNode, getMainFlowChain } from '@/lib/flow';
import { FlowNode, NODE_TYPE_CONFIG } from '@/types/flow';

const BG_VIDEO_URL = '/front-bg.mp4';

function getCompletedNodes(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('qf_completed') || '[]'); }
  catch { return []; }
}

function markNodeCompleted(nodeId: string) {
  const completed = getCompletedNodes();
  if (!completed.includes(nodeId)) {
    completed.push(nodeId);
    localStorage.setItem('qf_completed', JSON.stringify(completed));
  }
}

function getStartDate(): Date {
  if (typeof window === 'undefined') return new Date();
  const stored = localStorage.getItem('qf_start_date');
  if (stored) return new Date(stored);
  const now = new Date();
  localStorage.setItem('qf_start_date', now.toISOString());
  return now;
}

function getDaysSince(start: Date): number {
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
}

export default function Home() {
  const [welcomeNode, setWelcomeNode] = useState<FlowNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [days, setDays] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [craving, setCraving] = useState(100);
  const [totalStages, setTotalStages] = useState(0);
  const [completedStages, setCompletedStages] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainChainRef = useRef<string[]>([]);
  const router = useRouter();

  const recalcProgress = useCallback((chain: string[]) => {
    const completed = getCompletedNodes();
    const done = chain.filter(id => completed.includes(id)).length;
    const total = chain.length || 1;
    const pct = Math.round((done / total) * 100);
    setCompletedStages(done);
    setTotalStages(chain.length);
    setStageProgress(pct);
    setCraving(Math.max(0, 100 - pct));
  }, []);

  // Auto-scroll 1px to collapse Safari bottom bar
  useEffect(() => {
    setTimeout(() => window.scrollTo(0, 1), 100);
  }, []);

  useEffect(() => {
    setDays(getDaysSince(getStartDate()));

    const init = async () => {
      try {
        const [node, chain] = await Promise.all([getStartNode(), getMainFlowChain()]);
        if (node) setWelcomeNode(node);
        mainChainRef.current = chain;
        recalcProgress(chain);
      } catch (e) {
        console.error('Ошибка загрузки:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [recalcProgress]);

  const handleEnded = useCallback(async () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (welcomeNode) {
      markNodeCompleted(welcomeNode.id);
      recalcProgress(mainChainRef.current);

      const next = await getNextNode(welcomeNode);
      if (next) {
        const config = NODE_TYPE_CONFIG[next.type];
        router.push(config.hasAnswers ? `/question?id=${next.id}` : `/lesson?id=${next.id}`);
      }
    }
  }, [welcomeNode, router, recalcProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [handleEnded]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  };

  const skip = (s: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + s));
  };

  const fmt = (s: number) => {
    if (isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const audioPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const cravingColor = craving > 60 ? '#ef4444' : craving > 30 ? '#f59e0b' : '#22c55e';

  return (
    <main className="relative flex flex-col bg-black" style={{ height: 'calc(100dvh + 1px)' }}>
      <video ref={videoRef} src={BG_VIDEO_URL} loop muted playsInline autoPlay className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

      {welcomeNode?.audioUrl && <audio ref={audioRef} src={welcomeNode.audioUrl} preload="metadata" />}

      {/* Compact top stats */}
      <div className="relative z-10 px-4 pt-10 pb-1">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Days */}
          <div className="flex items-center gap-1.5 pr-3" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">{days}</span>
            <span className="text-[10px] text-white/50 leading-tight">
              {days === 1 ? 'день' : days >= 2 && days <= 4 ? 'дня' : 'дней'}<br />без курения
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1.5 px-3" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-lg font-bold text-blue-400 tabular-nums">{stageProgress}%</span>
            <span className="text-[10px] text-white/50 leading-tight">прогресс<br />{completedStages}/{totalStages}</span>
          </div>

          {/* Craving */}
          <div className="flex items-center gap-1.5 pl-2 flex-1">
            <span className="text-lg font-bold tabular-nums" style={{ color: cravingColor }}>{craving}%</span>
            <div className="flex-1">
              <span className="text-[10px] text-white/50 block mb-0.5">желание курить</span>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${craving}%`, background: cravingColor }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Bottom controls */}
      <div className="relative z-10 px-5 pb-6">
        {welcomeNode && (
          <div className="text-center mb-5">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Сейчас</p>
            <h2 className="text-white text-base font-medium">{welcomeNode.title}</h2>
          </div>
        )}

        {/* Audio progress bar */}
        <div className="mb-1">
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <div className="h-full rounded-full" style={{ width: `${audioPct}%`, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', transition: 'width 0.1s ease' }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/35 tabular-nums">{fmt(currentTime)}</span>
            <span className="text-[10px] text-white/35 tabular-nums">{fmt(duration || 0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-1">
          <button onClick={() => skip(-10)} className="w-11 h-11 flex items-center justify-center rounded-full active:scale-90 transition-transform" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <SkipBack className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={togglePlay}
            className="flex items-center justify-center rounded-full active:scale-90 transition-transform"
            style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 6px 24px rgba(99,102,241,0.35)' }}
          >
            {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-0.5" />}
          </button>
          <button onClick={() => skip(10)} className="w-11 h-11 flex items-center justify-center rounded-full active:scale-90 transition-transform" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <SkipForward className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {!loading && welcomeNode && !welcomeNode.audioUrl && (
          <button
            onClick={async () => {
              if (!welcomeNode) return;
              markNodeCompleted(welcomeNode.id);
              const next = await getNextNode(welcomeNode);
              if (next) {
                const config = NODE_TYPE_CONFIG[next.type];
                router.push(config.hasAnswers ? `/question?id=${next.id}` : `/lesson?id=${next.id}`);
              }
            }}
            className="mt-5 w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-medium active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
          >
            <span className="text-white text-sm">Продолжить</span>
            <ChevronRight className="w-4 h-4 text-white/80" />
          </button>
        )}
      </div>
    </main>
  );
}
