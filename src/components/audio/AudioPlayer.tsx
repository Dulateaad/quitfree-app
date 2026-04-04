'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AudioPlayerProps {
  src: string;
  title?: string;
  onEnded?: () => void;
  className?: string;
}

const EQUALIZER_VIDEO_URL = 'https://firebasestorage.googleapis.com/v0/b/studio-590355839-601a4.firebasestorage.app/o/IMG_2820%20(1).MP4?alt=media&token=0d0c2099-b49c-4aea-bcd5-9642b6c4f98d';

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  onEnded,
  className,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Обработчики аудио
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      setHasError(false);
      setDuration(audio.duration);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      console.error('Ошибка загрузки аудио:', src);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
    };
  }, [onEnded, src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error('Ошибка воспроизведения:', err);
        setHasError(true);
      });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const handleReplay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(console.error);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn('w-full flex flex-col items-center justify-center', className)}>
      <div className="relative w-full min-h-[50vh] sm:min-h-[350px] bg-black overflow-hidden flex items-center justify-center mb-6">
        <video
          ref={videoRef}
          src={EQUALIZER_VIDEO_URL}
          loop
          muted
          playsInline
          className="w-full h-full object-cover absolute inset-0"
        />

        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="text-white/90 text-sm font-medium">Загрузка...</div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="text-center px-4">
              <div className="text-white/90 text-sm font-medium mb-2">Аудио не найдено</div>
              <div className="text-white/60 text-xs">Загрузите аудио в админке</div>
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Стеклянный плеер-капсула */}
      <div 
        className="relative w-full max-w-xs sm:max-w-sm mx-auto px-6 py-5 rounded-[40px] overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Прогресс-бар сверху */}
        <div 
          className="absolute top-0 left-0 w-full h-1 bg-white/10 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-white/60 transition-all duration-100"
            style={{ 
              width: `${progressPercent}%`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
            }}
          />
        </div>

        {/* Контролы */}
        <div className="flex items-center justify-center gap-8 mt-2">
          {/* Назад */}
          <button
            onClick={() => skip(-10)}
            className="text-white/80 hover:text-white hover:scale-110 transition-all p-2 touch-manipulation"
            aria-label="Назад 10 секунд"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="text-white/80 hover:text-white hover:scale-110 transition-all p-2 touch-manipulation"
            aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-0.5" />
            )}
          </button>

          {/* Вперёд */}
          <button
            onClick={() => skip(10)}
            className="text-white/80 hover:text-white hover:scale-110 transition-all p-2 touch-manipulation"
            aria-label="Вперёд 10 секунд"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Реплей */}
          <button
            onClick={handleReplay}
            className="text-white/80 hover:text-white hover:scale-110 transition-all p-2 touch-manipulation"
            aria-label="Переиграть"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
