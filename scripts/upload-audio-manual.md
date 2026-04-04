# 📤 Инструкция по загрузке аудио файлов в Firebase Storage

## Способ 1: Через Firebase Console (Рекомендуется для начала)

### Шаги:

1. **Откройте Firebase Console**
   - Перейдите на https://console.firebase.google.com
   - Выберите проект `quitfreeai`

2. **Перейдите в Storage**
   - В левом меню выберите **Storage**
   - Если Storage не включен, нажмите **"Начать"** и следуйте инструкциям

3. **Создайте папку для аудио**
   - Нажмите **"Добавить файл"** или **"Загрузить файл"**
   - Создайте папку `audio` (если её нет)
   - Или просто загрузите файл, он будет в корне

4. **Загрузите файл приветствия**
   - Нажмите **"Загрузить файл"**
   - Выберите ваш аудио файл (например, `welcome.mp3`)
   - Дождитесь завершения загрузки

5. **Получите URL файла**
   - Кликните на загруженный файл
   - Скопируйте **Download URL**
   - Пример: `https://firebasestorage.googleapis.com/v0/b/quitfreeai.appspot.com/o/audio%2Fwelcome.mp3?alt=media&token=...`

6. **Используйте URL в коде**
   ```tsx
   <AudioPlayer src="https://firebasestorage.googleapis.com/..." />
   ```

---

## Способ 2: Через скрипт (Автоматически)

### Подготовка:

1. **Установите зависимости** (если еще не установлены):
   ```bash
   npm install firebase
   ```

2. **Создайте файл `.env.local`** в корне проекта:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=quitfreeai
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=quitfreeai.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

3. **Добавьте скрипт в `package.json`**:
   ```json
   {
     "scripts": {
       "upload-audio": "tsx scripts/upload-audio.ts"
     }
   }
   ```

4. **Установите tsx** (если еще не установлен):
   ```bash
   npm install -D tsx
   ```

### Использование:

```bash
# Загрузить файл приветствия
npm run upload-audio ./audio/welcome.mp3 welcome-audio

# Загрузить урок
npm run upload-audio ./audio/lesson-1.mp3 lesson-1
```

---

## Способ 3: Через код в приложении (Для админ-панели)

Создайте компонент для загрузки файлов:

```tsx
import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function AudioUploader() {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `audio/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUrl(downloadURL);
      console.log('URL:', downloadURL);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />
      {url && <p>URL: {url}</p>}
    </div>
  );
}
```

---

## 📁 Рекомендуемая структура в Firebase Storage:

```
storage/
  └── audio/
      ├── welcome.mp3          # Приветствие
      ├── intro.mp3            # Введение
      ├── lesson-1.mp3         # Урок 1
      ├── lesson-2.mp3         # Урок 2
      └── ...
```

---

## 🔒 Настройка правил безопасности Storage

Убедитесь, что в `storage.rules` есть правила для чтения аудио:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Публичный доступ к аудио файлам
    match /audio/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Только авторизованные пользователи могут загружать
    }
  }
}
```

Затем деплойте правила:
```bash
firebase deploy --only storage
```

---

## ✅ Проверка загрузки

После загрузки проверьте:
1. Файл виден в Firebase Console → Storage
2. URL файла открывается в браузере
3. Аудио воспроизводится в `<AudioPlayer>`

---

## 💡 Советы:

- **Формат**: Рекомендуется использовать MP3 для лучшей совместимости
- **Размер**: Оптимизируйте файлы (сжимайте до 128-192 kbps)
- **Названия**: Используйте понятные названия без пробелов (welcome-audio, lesson-1)
- **Кэширование**: Firebase Storage автоматически кэширует файлы

