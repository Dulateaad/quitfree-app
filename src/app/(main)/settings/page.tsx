'use client';

import { Button } from '@/components/ui/Button';
import { Bell, Globe, Volume2, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Настройки
          </h1>
          <p className="text-gray-300">
            Настройте приложение под себя
          </p>
        </div>

        <div className="space-y-6">
          {/* Уведомления */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">
                Уведомления
              </h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Напоминания о уроках</span>
                <input type="checkbox" className="w-5 h-5 text-purple-600 rounded accent-purple-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Ежедневные мотивации</span>
                <input type="checkbox" className="w-5 h-5 text-purple-600 rounded accent-purple-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Прогресс недели</span>
                <input type="checkbox" className="w-5 h-5 text-purple-600 rounded accent-purple-600" />
              </label>
            </div>
          </div>

          {/* Язык */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">
                Язык
              </h2>
            </div>
            <select className="w-full p-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option className="bg-gray-900">Русский</option>
              <option className="bg-gray-900">English</option>
              <option className="bg-gray-900">Қазақша</option>
            </select>
          </div>

          {/* Звук */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Volume2 className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">
                Звук
              </h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Громкость уведомлений</span>
                <input type="range" min="0" max="100" defaultValue="50" className="w-32 accent-purple-600" />
              </label>
            </div>
          </div>

          {/* Безопасность */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">
                Безопасность
              </h2>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Изменить пароль
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Двухфакторная аутентификация
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Сохранить изменения</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
