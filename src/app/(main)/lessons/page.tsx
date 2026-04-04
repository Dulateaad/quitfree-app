'use client';

import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Button } from '@/components/ui/Button';
import { BookOpen, CheckCircle } from 'lucide-react';

const lessons = [
  { id: 1, title: 'Урок 1: Введение', description: 'Знакомство с программой', duration: '5 мин', completed: true },
  { id: 2, title: 'Урок 2: Понимание зависимости', description: 'Как работает никотиновая зависимость', duration: '8 мин', completed: false },
  { id: 3, title: 'Урок 3: Стратегии отказа', description: 'Эффективные методы борьбы с тягой', duration: '10 мин', completed: false },
  { id: 4, title: 'Урок 4: Управление стрессом', description: 'Как справляться со стрессом без сигарет', duration: '12 мин', completed: false },
];

export default function LessonsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Уроки
          </h1>
          <p className="text-gray-300">
            Изучайте материалы и следуйте программе отказа от курения
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Список уроков */}
          <div className="lg:col-span-1 space-y-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">
                      {lesson.title}
                    </h3>
                  </div>
                  {lesson.completed && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {lesson.duration}
                  </span>
                  <Button size="sm" variant={lesson.completed ? 'outline' : 'default'}>
                    {lesson.completed ? 'Повторить' : 'Начать'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Аудио плеер */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Текущий урок
              </h2>
              <AudioPlayer 
                src="https://firebasestorage.googleapis.com/v0/b/quitfreeai.appspot.com/o/audio%2Fwelcome.mp3?alt=media"
                title="Урок 1: Введение"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
