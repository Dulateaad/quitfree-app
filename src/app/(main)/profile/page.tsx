'use client';

import { Button } from '@/components/ui/Button';
import { User, Mail, Calendar, Target, Edit } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Профиль
          </h1>
          <p className="text-gray-300">
            Управляйте своей учетной записью и настройками
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Пользователь
                </h2>
                <p className="text-gray-300">user@example.com</p>
              </div>
            </div>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <Mail className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm text-gray-300">Email</div>
                <div className="font-medium text-white">user@example.com</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm text-gray-300">Дата регистрации</div>
                <div className="font-medium text-white">13 января 2025</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <Target className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm text-gray-300">Цель</div>
                <div className="font-medium text-white">Бросить курить навсегда</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Действия
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Изменить пароль
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Настройки уведомлений
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-400 hover:text-red-300">
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
