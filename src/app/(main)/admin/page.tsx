'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Play, Pause, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { uploadFlowAudio, saveFlowNode, getFlowNodes, deleteFlowNode } from '@/lib/admin/flow';
import { FlowNode } from '@/types/flow';

const ADMIN_EMAILS = ['dulatea.dot@gmail.com', 'servile4853@gmail.com'];

interface AudioItem {
  id: string;
  title: string;
  audioUrl: string;
  type: string;
}

export default function AdminPage() {
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Проверка авторизации
  useEffect(() => {
    const checkAuth = async () => {
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const { default: app } = await import('@/lib/firebase');
      const auth = getAuth(app);
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          setIsAuthorized(true);
          loadAudioItems();
        } else {
          setIsAuthorized(false);
          router.push('/admin/login');
        }
        setCheckingAuth(false);
      });

      return unsubscribe;
    };
    
    let unsubscribe: (() => void) | undefined;
    checkAuth().then(unsub => { unsubscribe = unsub; });
    
    return () => { unsubscribe?.(); };
  }, [router]);

  const loadAudioItems = async () => {
    try {
      setLoading(true);
      const nodes = await getFlowNodes();
      const items: AudioItem[] = nodes.map(node => ({
        id: node.id,
        title: node.title,
        audioUrl: node.audioUrl || '',
        type: node.type,
      }));
      setAudioItems(items);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAudio = async (file: File) => {
    if (!newTitle.trim()) {
      alert('Введите название аудио');
      return;
    }

    setUploading(true);
    try {
      const nodeId = Date.now().toString();
      const url = await uploadFlowAudio(file, nodeId);
      
      const newNode: FlowNode = {
        id: nodeId,
        type: 'welcome',
        title: newTitle.trim(),
        audioUrl: url,
        text: '',
        position: { x: 0, y: 0 },
        nextNodeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await saveFlowNode(newNode);
      
      setAudioItems(prev => [...prev, {
        id: nodeId,
        title: newTitle.trim(),
        audioUrl: url,
        type: 'welcome',
      }]);
      
      setNewTitle('');
      alert('Аудио успешно загружено!');
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка загрузки: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const togglePlay = (id: string, url: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingId(id);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить это аудио?')) {
      try {
        await deleteFlowNode(id);
        setAudioItems(prev => prev.filter(item => item.id !== id));
        alert('Аудио удалено!');
      } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления: ' + (error as Error).message);
      }
    }
  };

  const handleLogout = async () => {
    const { getAuth, signOut } = await import('firebase/auth');
    const { default: app } = await import('@/lib/firebase');
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/admin/login');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Проверка авторизации...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Управление аудио</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/flow')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Управление Flow
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>

        {/* Форма загрузки */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Загрузить новое аудио</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Название аудио (например: Приветствие)"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadAudio(file);
              }}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !newTitle.trim()}
              className="whitespace-nowrap"
            >
              <Upload className="w-5 h-5 mr-2" />
              {uploading ? 'Загрузка...' : 'Выбрать файл'}
            </Button>
          </div>
        </div>

        {/* Список аудио */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">
            Загруженные аудио ({audioItems.length})
          </h2>
          
          {loading ? (
            <div className="text-center text-gray-400 py-8">Загрузка...</div>
          ) : audioItems.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Нет загруженных аудио. Добавьте первое аудио выше.
            </div>
          ) : (
            <div className="space-y-3">
              {audioItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePlay(item.id, item.audioUrl)}
                      className="w-12 h-12 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                    >
                      {playingId === item.id ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                    
                    <div>
                      <div className="text-white font-medium">{item.title}</div>
                      <div className="text-gray-400 text-sm">ID: {item.id}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Инструкция */}
        <div className="mt-8 p-4 bg-purple-900/30 rounded-xl border border-purple-500/30">
          <h3 className="text-purple-300 font-medium mb-2">💡 Подсказка</h3>
          <p className="text-gray-300 text-sm">
            Первое загруженное аудио с типом "welcome" будет автоматически воспроизводиться 
            на главной странице приложения.
          </p>
        </div>
      </div>
    </div>
  );
}
