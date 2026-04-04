'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('user@email.com');
  const [name, setName] = useState('Alex');

  return (
    <main className="min-h-screen bg-black text-white flex flex-col px-4 py-8">
      {/* Статус бар */}
      <div className="text-sm text-gray-400 mb-4">9:15</div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">QuitFree</h1>
          </div>

          {/* Форма */}
          <div className="space-y-6">
            {/* Email поле */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Name поле */}
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Кнопка Send magic link */}
            <Button
              onClick={() => {}}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
            >
              Send magic link
            </Button>

            {/* Кнопка Continue */}
            <button
              onClick={() => {}}
              className="w-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer текст */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Dontinue Continue
      </div>
    </main>
  );
}

