'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserProgress } from '@/types/progress';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'completed'>('all');

  // TODO: Загрузить реальные данные из Firestore
  useEffect(() => {
    const mockUsers: UserProgress[] = [
      {
        userId: '1',
        userName: 'Иван Петров',
        userEmail: 'ivan@example.com',
        currentNodeId: '5',
        completedNodes: ['1', '2', '3', '4'],
        answers: { '4': 'answer-1' },
        startedAt: new Date('2025-01-10'),
        lastActivityAt: new Date('2025-01-13'),
        status: 'active',
      },
      {
        userId: '2',
        userName: 'Мария Иванова',
        userEmail: 'maria@example.com',
        currentNodeId: '2',
        completedNodes: ['1'],
        answers: {},
        startedAt: new Date('2025-01-12'),
        lastActivityAt: new Date('2025-01-13'),
        status: 'active',
      },
      {
        userId: '3',
        userName: 'Алексей Смирнов',
        userEmail: 'alex@example.com',
        currentNodeId: null,
        completedNodes: ['1', '2', '3', '4', '5', '6', '7', '8'],
        answers: { '4': 'answer-1', '8': 'answer-1' },
        startedAt: new Date('2025-01-01'),
        lastActivityAt: new Date('2025-01-13'),
        status: 'completed',
      },
      {
        userId: '4',
        userName: 'Елена Козлова',
        userEmail: 'elena@example.com',
        currentNodeId: '3',
        completedNodes: ['1', '2'],
        answers: {},
        startedAt: new Date('2025-01-11'),
        lastActivityAt: new Date('2025-01-12'),
        status: 'paused',
      },
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/20 text-green-400';
      case 'paused':
        return 'bg-yellow-900/20 text-yellow-400';
      case 'completed':
        return 'bg-purple-900/20 text-purple-400';
      default:
        return 'bg-gray-900/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'paused':
        return 'Приостановлен';
      case 'completed':
        return 'Завершён';
      default:
        return status;
    }
  };

  const calculateProgress = (user: UserProgress) => {
    // TODO: Рассчитать на основе общего количества узлов
    return Math.min((user.completedNodes.length / 10) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок и фильтры */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Прогресс пользователей
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Фильтры */}
            <div className="flex gap-2">
              {(['all', 'active', 'paused', 'completed'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === 'all' ? 'Все' : getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Таблица пользователей */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Текущий узел
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Прогресс
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Последняя активность
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/10">
                {filteredUsers.map((user) => {
                  const progress = calculateProgress(user);
                  return (
                    <tr key={user.userId} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user.userName || 'Без имени'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.currentNodeId ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-white">
                              Узел {user.currentNodeId}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-gray-400">
                              Завершено
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 w-32 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white w-12">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {new Date(user.lastActivityAt).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-gray-400 hover:text-gray-300">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                Пользователи не найдены
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

