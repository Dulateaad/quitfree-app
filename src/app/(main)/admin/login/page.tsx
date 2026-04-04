'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_EMAILS = ['dulatea.dot@gmail.com', 'servile4853@gmail.com'];

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [checkingLink, setCheckingLink] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkMagicLink = async () => {
      const { getAuth, isSignInWithEmailLink, signInWithEmailLink } = await import('firebase/auth');
      const { default: app } = await import('@/lib/firebase');
      const auth = getAuth(app);
      
      // Проверяем, пришёл ли пользователь по magic link
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn = window.localStorage.getItem('emailForSignIn');
        
        if (!emailForSignIn) {
          emailForSignIn = window.prompt('Введите ваш email для подтверждения');
        }
        
        if (emailForSignIn) {
          setLoading(true);
          try {
            const result = await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            
            if (result.user.email && ADMIN_EMAILS.includes(result.user.email.toLowerCase())) {
              router.push('/admin');
            } else {
              setMessage('Доступ запрещён. Только для администратора.');
              await auth.signOut();
            }
          } catch (error: any) {
            console.error('Ошибка входа:', error);
            setMessage('Ошибка входа: ' + error.message);
          } finally {
            setLoading(false);
            setCheckingLink(false);
          }
        } else {
          setCheckingLink(false);
        }
      } else {
        setCheckingLink(false);
      }
    };
    
    checkMagicLink();
  }, [router]);

  const handleSendLink = async () => {
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setMessage('Доступ запрещён для этого email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { getAuth, sendSignInLinkToEmail } = await import('firebase/auth');
      const { default: app } = await import('@/lib/firebase');
      const auth = getAuth(app);
      
      const actionCodeSettings = {
        url: window.location.origin + '/admin/login',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Ссылка для входа отправлена на ' + email);
    } catch (error: any) {
      console.error('Ошибка отправки:', error);
      setMessage('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingLink) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Проверка авторизации...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            Вход в админку
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Только для администратора
          </p>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />

            <button
              onClick={handleSendLink}
              disabled={loading || !email}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Отправка...' : 'Отправить ссылку для входа'}
            </button>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('Ошибка') || message.includes('запрещён') || message.includes('разрешён')
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-green-500/20 text-green-300'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

