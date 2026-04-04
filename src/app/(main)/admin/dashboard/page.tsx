'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, CheckCircle2, BarChart3, PieChart, Activity, Search, Bell, Filter, Calendar, RefreshCw, MoreVertical } from 'lucide-react';
import { FlowStats } from '@/types/progress';

export default function DashboardPage() {
  const [stats, setStats] = useState<FlowStats>({
    totalUsers: 0,
    activeUsers: 0,
    completedUsers: 0,
    averageProgress: 0,
    nodesStats: {},
  });

  const [selectedPeriod, setSelectedPeriod] = useState<'meetings' | 'hours' | 'participants'>('meetings');

  // TODO: Загрузить реальные данные из Firestore
  useEffect(() => {
    setStats({
      totalUsers: 352,
      activeUsers: 89,
      completedUsers: 142,
      averageProgress: 67,
      nodesStats: {
        '1': { completed: 342, current: 8, percentage: 93 },
        '2': { completed: 298, current: 12, percentage: 64 },
        '3': { completed: 276, current: 5, percentage: 50 },
      },
    });
  }, []);

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats.totalUsers,
      change: '+12%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Среднее на пользователя',
      value: '15',
      change: '+9%',
      trend: 'up',
      icon: Activity,
    },
    {
      title: 'Активные сейчас',
      value: stats.activeUsers,
      change: '+8%',
      trend: 'up',
      icon: CheckCircle2,
    },
    {
      title: 'Завершили флоу',
      value: stats.completedUsers,
      change: '+15%',
      trend: 'up',
      icon: TrendingUp,
    },
  ];

  const progressData = [
    { day: '1.05', value: 15 },
    { day: '4.05', value: 42 },
    { day: '7.05', value: 25 },
    { day: '10.05', value: 18 },
    { day: '13.05', value: 30 },
    { day: '16.05', value: 22 },
    { day: '19.05', value: 28 },
  ];

  const maxProgress = Math.max(...progressData.map(d => d.value));

  const platforms = [
    { name: 'Google Meet', percentage: 46, color: '#3b82f6' },
    { name: 'Zoom', percentage: 42, color: '#60a5fa' },
    { name: 'MS Teams', percentage: 12, color: '#9333ea' },
  ];

  const sentiments = [
    { name: 'Positive', percentage: 34, color: '#10b981' },
    { name: 'Negative', percentage: 5, color: '#ef4444' },
    { name: 'Neutral', percentage: 61, color: '#6b7280' },
  ];

  const participants = [
    { name: 'Evan Brightwood', role: 'Product Manager', time: '42h 14m', progress: 85 },
    { name: 'Lila Casterly', role: 'Senior Software Developer', time: '35h 47m', progress: 72 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-purple-950 relative overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Верхняя панель */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Q Find any user moment..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                <Filter className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Filters</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                <Calendar className="w-4 h-4 text-white" />
                <span className="text-white text-sm">This month</span>
              </div>
              <button className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка */}
          <div className="lg:col-span-2 space-y-6">
            {/* General stats */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">General stats</h2>
                </div>
              </div>

              {/* Toggle buttons */}
              <div className="flex gap-2 mb-6">
                {(['meetings', 'hours', 'participants'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPeriod === period
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {period === 'meetings' ? 'Meetings' : period === 'hours' ? 'Hours' : 'Participants'}
                  </button>
                ))}
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {statCards.slice(0, 2).map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4"
                    >
                      <div className="text-sm text-gray-300 mb-1">{card.title}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold text-white">{card.value}</div>
                        <span className="text-sm font-semibold text-green-400">{card.change}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bar chart */}
              <div className="mt-6">
                <div className="flex items-end justify-between h-48 space-x-2">
                  {progressData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-full relative">
                        <div
                          className="w-full bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400 rounded-t-lg transition-all hover:opacity-80 shadow-lg"
                          style={{ height: `${(item.value / maxProgress) * 100}%` }}
                        />
                        <div className="absolute -top-6 text-xs font-medium text-white">
                          {item.value}
                        </div>
                      </div>
                      <div className="mt-2 text-xs font-medium text-gray-300">{item.day}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time spent */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">Time spent in meetings</h2>
              </div>
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-gray-300">Participants 23</span>
                <span className="text-white font-semibold">Average 9h 12m</span>
              </div>
              <div className="space-y-4">
                {participants.map((participant, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-white font-medium">{participant.name}</div>
                        <div className="text-sm text-gray-400">{participant.role}</div>
                      </div>
                      <div className="text-white font-semibold">{participant.time}</div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all"
                        style={{ width: `${participant.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка */}
          <div className="space-y-6">
            {/* Platforms */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">Platforms</h2>
              </div>
              <div className="space-y-3 mb-4">
                {platforms.map((platform, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">{platform.name}</span>
                      <span className="text-sm font-semibold text-white">{platform.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${platform.percentage}%`, backgroundColor: platform.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Donut chart placeholder */}
              <div className="flex items-center justify-center mt-4">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray={`${46 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="8"
                      strokeDasharray={`${42 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`-${46 * 2.51}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="8"
                      strokeDasharray={`${12 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`-${88 * 2.51}`}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sentiments */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">Sentiments</h2>
              </div>
              <div className="space-y-3 mb-4">
                {sentiments.map((sentiment, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sentiment.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{sentiment.name}</span>
                        <span className="text-sm font-semibold text-white">{sentiment.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${sentiment.percentage}%`, backgroundColor: sentiment.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Donut chart placeholder */}
              <div className="flex items-center justify-center mt-4">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={`${34 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="8"
                      strokeDasharray={`${61 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`-${34 * 2.51}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="8"
                      strokeDasharray={`${5 * 2.51} ${100 * 2.51}`}
                      strokeDashoffset={`-${95 * 2.51}`}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Talk to listen ratio */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">Talk to listen ratio</h2>
              </div>
              <div className="text-sm text-gray-300 mb-4">Participants 23</div>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white font-medium mb-2">Luna Fairchild</div>
                  <div className="text-sm text-gray-400 mb-3">VP of Marketing</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Talk % 74%</span>
                    <span className="text-sm text-gray-300">Listen % 26%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500" style={{ width: '74%' }} />
                      <div className="bg-purple-300" style={{ width: '26%' }} />
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-white font-medium mb-2">Ava Starfall</div>
                  <div className="text-sm text-gray-400 mb-3">Technical Lead</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Talk % 70%</span>
                    <span className="text-sm text-gray-300">Listen % 30%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500" style={{ width: '70%' }} />
                      <div className="bg-purple-300" style={{ width: '30%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
