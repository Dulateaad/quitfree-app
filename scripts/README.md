# 📤 Скрипт загрузки аудио в Firebase Storage

## 🚀 Быстрый старт

### 1. Установите зависимости

```bash
npm install firebase
npm install -D tsx @types/node
```

### 2. Создайте файл `.env.local` в корне проекта

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=quitfreeai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=quitfreeai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=quitfreeai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Где найти эти значения:**
- Откройте Firebase Console: https://console.firebase.google.com/project/quitfreeai
- Перейдите в **Project Settings** (⚙️) → **General**
- Скопируйте значения из раздела **Your apps**

### 3. Загрузите аудио файл

```bash
# Простой способ (имя файла будет использовано как название в Storage)
npx tsx scripts/upload-audio.ts ./audio/welcome.mp3

# С указанием имени в Storage
npx tsx scripts/upload-audio.ts ./audio/welcome.mp3 welcome-audio
```

### 4. Используйте URL в коде

Скрипт выведет URL файла. Используйте его в компоненте:

```tsx
<AudioPlayer src="https://firebasestorage.googleapis.com/..." />
```

---

## 📝 Примеры использования

```bash
# Загрузить приветствие
npx tsx scripts/upload-audio.ts ./audio/welcome.mp3 welcome

# Загрузить урок 1
npx tsx scripts/upload-audio.ts ./audio/lesson-1.mp3 lesson-1

# Загрузить введение
npx tsx scripts/upload-audio.ts ./audio/intro.mp3 intro-audio
```

---

## 📁 Структура файлов

После загрузки файлы будут в Firebase Storage по пути:
```
storage/
  └── audio/
      ├── welcome.mp3
      ├── lesson-1.mp3
      └── ...
```

---

## 🔒 Настройка правил Storage

Перед загрузкой убедитесь, что правила Storage настроены. Выполните:

```bash
firebase deploy --only storage
```

Правила должны быть в файле `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{allPaths=**} {
      allow read: if true;  // Публичный доступ для чтения
      allow write: if request.auth != null;  // Только авторизованные для записи
    }
  }
}
```

---

## ✅ Что делает скрипт

1. ✅ Проверяет наличие `.env.local`
2. ✅ Инициализирует Firebase
3. ✅ Загружает файл в `audio/` папку
4. ✅ Выводит Download URL
5. ✅ Сохраняет URL в `audio-urls.json` (для удобства)

---

## 🐛 Решение проблем

### Ошибка: "Файл .env.local не найден"
- Создайте файл `.env.local` в корне проекта
- Заполните его значениями из Firebase Console

### Ошибка: "storage/unauthorized"
- Проверьте правила Storage в Firebase Console
- Убедитесь, что правила деплоены: `firebase deploy --only storage`

### Ошибка: "Cannot find module 'firebase'"
- Установите зависимости: `npm install firebase`

### Ошибка: "Cannot find module 'tsx'"
- Установите tsx: `npm install -D tsx`

---

## 💡 Советы

- **Формат**: Используйте MP3 для лучшей совместимости
- **Размер**: Оптимизируйте файлы (128-192 kbps достаточно)
- **Названия**: Используйте понятные названия без пробелов
- **Организация**: Храните все аудио в папке `audio/` в Storage

---

## 📚 Дополнительная информация

Подробная инструкция: [upload-audio-manual.md](./upload-audio-manual.md)

