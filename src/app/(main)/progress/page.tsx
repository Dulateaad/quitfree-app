'use client';

import { Calendar, TrendingUp, DollarSign, Heart, Award } from 'lucide-react';

const stats = [
  { label: 'Дней без курения', value: '7', icon: Calendar, color: 'text-purple-400' },
  { label: 'Сигарет не выкурено', value: '140', icon: Heart, color: 'text-red-400' },
  { label: 'Денег сэкономлено', value: '2 800 ₽', icon: DollarSign, color: 'text-green-400' },
  { label: 'Уроков пройдено', value: '3/10', icon: Award, color: 'text-yellow-400' },
];

const progressData = [
  { day: 'Пн', value: 20 },
  { day: 'Вт', value: 0 },
  { day: 'Ср', value: 5 },
  { day: 'Чт', value: 0 },
  { day: 'Пт', value: 0 },
  { day: 'Сб', value: 0 },
  { day: 'Вс', value: 0 },
];

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Прогресс
          </h1>
          <p className="text-gray-300">
            Отслеживайте свой прогресс на пути к свободе от курения
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-300">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* График прогресса */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Недельный прогресс
          </h2>
          <div className="flex items-end justify-between h-64 space-x-2">
            {progressData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all"
                    style={{ height: `${(item.value / 20) * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-gray-300">
                  {item.day}
                </div>
                <div className="text-xs text-gray-400">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Достижения */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Достижения
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Первая неделя', description: '7 дней без курения', unlocked: true },
              { title: 'Экономия', description: 'Сэкономлено 1000₽', unlocked: true },
              { title: 'Ученик', description: 'Пройдено 5 уроков', unlocked: false },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  achievement.unlocked
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-gray-700 bg-gray-800/50 opacity-50'
                }`}
              >
                <Award className={`w-8 h-8 mb-2 ${achievement.unlocked ? 'text-purple-400' : 'text-gray-600'}`} />
                <h3 className="font-semibold text-white mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-300">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
