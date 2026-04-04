# ⚡ Быстрый старт: Загрузка аудио

## 📦 Шаг 1: Установка

```bash
cd /Users/dulatea/Quitfree-app
npm install firebase
npm install -D tsx @types/node
```

## ⚙️ Шаг 2: Настройка .env.local

Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=ваш-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=quitfreeai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=quitfreeai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=quitfreeai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=ваш-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=ваш-app-id
```

**Где найти:**
1. Откройте https://console.firebase.google.com/project/quitfreeai
2. ⚙️ **Project Settings** → **General**
3. Скопируйте значения из раздела **Your apps**

## 🎵 Шаг 3: Загрузите аудио

```bash
npx tsx scripts/upload-audio.ts ./audio/welcome.mp3 welcome
```

## ✅ Готово!

Скрипт выведет URL файла. Используйте его в `<AudioPlayer>`:

```tsx
<AudioPlayer src="https://firebasestorage.googleapis.com/..." />
```

---

## 🔒 Важно: Настройте правила Storage

Перед загрузкой выполните:

```bash
firebase deploy --only storage
```

Это позволит всем читать аудио файлы.

