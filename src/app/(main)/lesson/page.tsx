'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pause, Play, ArrowRight } from 'lucide-react';
import { getNodeByType, getNextNode, getNodeById } from '@/lib/flow';
import { FlowNode, NODE_TYPE_CONFIG } from '@/types/flow';

const EQUALIZER_VIDEO_URL = 'https://firebasestorage.googleapis.com/v0/b/studio-590355839-601a4.firebasestorage.app/o/IMG_2820%20(1).MP4?alt=media&token=0d0c2099-b49c-4aea-bcd5-9642b6c4f98d';

function LessonContent() {
  const [currentNode, setCurrentNode] = useState<FlowNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeId = searchParams.get('id');
  const nodeType = searchParams.get('type');

  useEffect(() => {
    const loadNode = async () => {
      try {
        let node: FlowNode | null = null;

        if (nodeId) {
          node = await getNodeById(nodeId);
        } else if (nodeType) {
          node = await getNodeByType(nodeType as FlowNode['type']);
        } else {
          node = await getNodeByType('intro');
        }

        setCurrentNode(node);
      } catch (error) {
        console.error('Ошибка загрузки узла:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNode();
  }, [nodeId, nodeType]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentNode?.audioUrl) return;

    audio.src = currentNode.audioUrl;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentNode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const navigateToNode = (node: FlowNode) => {
    const config = NODE_TYPE_CONFIG[node.type];
    if (config.hasAnswers) {
      router.push(`/question?id=${node.id}`);
    } else if (node.type === 'welcome') {
      router.push('/home');
    } else {
      router.push(`/lesson?id=${node.id}`);
    }
  };

  const handleNext = async () => {
    if (!currentNode) return;
    try {
      // Track completed node for progress
      if (typeof window !== 'undefined') {
        try {
          const completed = JSON.parse(localStorage.getItem('qf_completed') || '[]');
          if (!completed.includes(currentNode.id)) {
            completed.push(currentNode.id);
            localStorage.setItem('qf_completed', JSON.stringify(completed));
          }
        } catch { /* ignore */ }
      }

      const nextNode = await getNextNode(currentNode);
      if (nextNode) {
        navigateToNode(nextNode);
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error('Ошибка перехода:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Загрузка...</div>
      </main>
    );
  }

  if (!currentNode || !currentNode.audioUrl) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400">Аудио для этого шага еще не загружено в админке</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="px-4 pt-4 pb-4">
        <div className="text-sm text-gray-400 mb-1">
          {NODE_TYPE_CONFIG[currentNode.type]?.label || currentNode.type}
        </div>
        <h1 className="text-xl font-bold text-white mb-1">{currentNode.title}</h1>
        <p className="text-sm text-gray-300">{currentNode.text || 'Слушайте аудио'}</p>
      </div>

      <div className="relative w-full min-h-[60vh] bg-black flex flex-col items-center justify-center">
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            src={EQUALIZER_VIDEO_URL}
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <button
            onClick={togglePlay}
            className="w-24 h-24 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center shadow-2xl transition-all"
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white ml-1" />
            )}
          </button>
          <p className="text-white text-sm mt-4">Аудио</p>
        </div>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={handleNext}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          Далее
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <audio ref={audioRef} preload="metadata" />
    </main>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
          <div>Загрузка...</div>
        </main>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
