# QuitFree Cloud Functions

## Waitlist Email

При подписке на waitlist автоматически отправляется приветственное письмо.

### Настройка

1. **Resend** — https://resend.com
   - Зарегистрируйтесь
   - Создайте API ключ: https://resend.com/api-keys
   - Подтвердите домен: https://resend.com/domains (для production)

2. **Переменные окружения**

   ```bash
   cd functions
   cp .env.example .env
   ```

   Заполните `.env`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   RESEND_FROM_EMAIL=QuitFree <hello@quitfree.ai>
   ```

   Для тестов можно использовать `onboarding@resend.dev` (без верификации домена).

3. **Деплой**

   ```bash
   cd /Users/dulatea/quitfree-app
   firebase deploy --only functions
   ```

   При первом деплое CLI спросит значения параметров, если их нет в `.env`.
