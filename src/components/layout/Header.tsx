'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, BarChart3, User, Settings, Heart, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

const navigation = [
  { name: 'Главная', href: '/', icon: Home },
  { name: 'Уроки', href: '/lessons', icon: BookOpen },
  { name: 'Прогресс', href: '/progress', icon: BarChart3 },
  { name: 'Профиль', href: '/profile', icon: User },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Конструктор', href: '/admin', icon: Shield },
  { name: 'Аналитика', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Пользователи', href: '/admin/users', icon: User },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="relative z-50 bg-black">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {/* Логотип */}
          <Link href="/" className="flex items-center space-x-2 z-10">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              QuitFree.ai
            </span>
          </Link>
        </div>

        {/* Навигация в стиле glassmorphism (островок) - мобильная адаптация */}
        <nav className="flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2 sm:py-3 shadow-2xl w-full sm:w-auto overflow-x-auto">
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-max sm:min-w-0">
              {(pathname?.startsWith('/admin') ? adminNavigation : navigation).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation',
                      isActive
                        ? 'bg-purple-600/80 text-white shadow-lg'
                        : 'text-gray-300 active:bg-white/10 active:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
