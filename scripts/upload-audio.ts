#!/usr/bin/env node

/**
 * Скрипт для загрузки аудио файлов в Firebase Storage
 * 
 * Требования:
 * - Установлен Node.js
 * - Установлен firebase: npm install firebase
 * - Создан файл .env.local с конфигурацией Firebase
 * 
 * Использование:
 *   npx tsx scripts/upload-audio.ts <путь-к-файлу> [название-в-storage]
 * 
 * Примеры:
 *   npx tsx scripts/upload-audio.ts ./audio/welcome.mp3
 *   npx tsx scripts/upload-audio.ts ./audio/welcome.mp3 welcome-audio
 *   npx tsx scripts/upload-audio.ts ./welcome.mp3 welcome
 */

import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Загрузка переменных окружения из .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Файл .env.local не найден!');
    console.log('\n📝 Создайте файл .env.local в корне проекта со следующим содержимым:');
    console.log(`
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=quitfreeai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=quitfreeai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    `);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

// Получение конфигурации Firebase
function getFirebaseConfig() {
  const env = loadEnvFile();

  const config = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'quitfreeai',
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'quitfreeai.appspot.com',
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Проверка обязательных полей
  if (!config.apiKey || !config.projectId || !config.storageBucket) {
    console.error('❌ Не все обязательные переменные окружения заданы в .env.local');
    console.log('Требуются: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
    process.exit(1);
  }

  return config;
}

// Определение MIME типа по расширению
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac',
  };
  return mimeTypes[ext] || 'audio/mpeg';
}

// Загрузка файла в Firebase Storage
async function uploadAudioFile(filePath: string, storageName?: string) {
  try {
    console.log('🚀 Инициализация Firebase...\n');

    // Инициализация Firebase
    const config = getFirebaseConfig();
    
    // Проверка, не инициализирован ли Firebase уже
    let app;
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }

    const storage = getStorage(app);

    // Проверка существования файла
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }

    // Получение информации о файле
    const stats = fs.statSync(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(fileName);

    console.log(`📁 Файл: ${fileName}`);
    console.log(`📊 Размер: ${fileSizeMB} MB`);
    console.log(`🎵 Формат: ${fileExtension.slice(1).toUpperCase()}\n`);

    // Определение имени в Storage
    const finalStorageName = storageName || path.basename(fileName, fileExtension);
    const storagePath = `audio/${finalStorageName}${fileExtension}`;
    const storageRef = ref(storage, storagePath);

    console.log(`📤 Загрузка в Firebase Storage...`);
    console.log(`   Путь: ${storagePath}\n`);

    // Чтение файла
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(filePath);

    // Загрузка файла
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: mimeType,
    });

    console.log('✅ Файл успешно загружен!\n');

    // Получение URL для скачивания
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 URL файла:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(downloadURL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Используйте этот URL в вашем коде:');
    console.log(`   <AudioPlayer src="${downloadURL}" />\n`);

    // Сохранение URL в файл (опционально)
    const urlFilePath = path.join(process.cwd(), 'audio-urls.json');
    let urls: Record<string, string> = {};
    
    if (fs.existsSync(urlFilePath)) {
      urls = JSON.parse(fs.readFileSync(urlFilePath, 'utf-8'));
    }
    
    urls[finalStorageName] = downloadURL;
    fs.writeFileSync(urlFilePath, JSON.stringify(urls, null, 2));
    console.log(`💾 URL сохранён в: ${urlFilePath}`);

    return downloadURL;
  } catch (error: any) {
    console.error('\n❌ Ошибка при загрузке:');
    
    if (error.code === 'storage/unauthorized') {
      console.error('   Проблема с авторизацией. Проверьте правила Storage в Firebase Console.');
    } else if (error.code === 'storage/quota-exceeded') {
      console.error('   Превышен лимит хранилища.');
    } else if (error.message) {
      console.error(`   ${error.message}`);
    } else {
      console.error('   Неизвестная ошибка:', error);
    }
    
    process.exit(1);
  }
}

// Главная функция
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════╗
║   📤 Скрипт загрузки аудио в Firebase Storage          ║
╚════════════════════════════════════════════════════════╝

Использование:
  npx tsx scripts/upload-audio.ts <путь-к-файлу> [название]

Аргументы:
  путь-к-файлу    Путь к аудио файлу для загрузки
  название       (опционально) Имя файла в Storage (без расширения)

Примеры:
  npx tsx scripts/upload-audio.ts ./audio/welcome.mp3
  npx tsx scripts/upload-audio.ts ./audio/welcome.mp3 welcome-audio
  npx tsx scripts/upload-audio.ts ./welcome.mp3 welcome

Поддерживаемые форматы: MP3, WAV, OGG, M4A, AAC, FLAC

Требования:
  ✓ Файл .env.local с конфигурацией Firebase
  ✓ Установленный firebase: npm install firebase
  ✓ Установленный tsx: npm install -D tsx
    `);
    process.exit(0);
  }

  const [filePath, storageName] = args;
  await uploadAudioFile(filePath, storageName);
}

// Запуск скрипта
main().catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
});

