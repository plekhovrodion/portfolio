# Оценки портфолио

Сайт статический (GitHub Pages), поэтому оценки сохраняются через **Google Apps Script** в таблицу. Вы смотрите их на странице `/ratings/` или прямо в Google Sheets.

## Что сохраняется

| Поле | Описание |
| --- | --- |
| `createdAt` | Время оценки (UTC) |
| `rating` | 1–5 звёзд |
| `visitorId` | Анонимный ID в браузере (чтобы видеть повторные визиты) |
| `page` | URL страницы |
| `referrer` | Откуда пришёл |
| `userAgent` | Браузер / устройство |

Имя и email не собираются — только оценка и технические метаданные.

Сайт отправляет оценку через **GET** (не POST): у Google Apps Script иначе блокируется CORS в браузере.

## Настройка за 10 минут

### 1. Google Таблица

1. Создайте таблицу, например «Portfolio ratings».
2. Переименуйте первый лист в `Ratings` (или оставьте — скрипт создаст заголовки сам).

### 2. Apps Script

1. **Расширения → Apps Script**.
2. Удалите шаблон `function myFunction() { }` целиком.
3. Вставьте код из `scripts/portfolio-ratings-google-apps-script.gs` **без обёртки** — `doGet` и `doPost` должны быть в корне файла `Code.gs`, не внутри другой функции.
4. Если видите ошибку «функция doPost удалена» — значит код случайно оказался внутри `myFunction`. Исправьте и сделайте **новый deployment** (см. ниже).
3. **Project Settings → Script properties**:
   - `ADMIN_KEY` — придумайте длинный секрет для `/ratings/`
   - `TELEGRAM_BOT_TOKEN` (необязательно) — токен бота
   - `TELEGRAM_CHAT_ID` (необязательно) — ваш chat id для уведомлений
5. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone** (не «Only myself» — иначе URL откроет страницу входа Google и сайт получит 401)
6. Скопируйте URL вида `https://script.google.com/macros/s/.../exec`.
7. После каждого изменения кода: **Deploy → Manage deployments → Edit → Version: New version → Deploy** (старый URL остаётся тем же).

### 3. Переменные окружения

Локально создайте `.env.local`:

```env
NEXT_PUBLIC_RATING_API_URL=https://script.google.com/macros/s/XXXX/exec
```

Для GitHub Pages добавьте секрет репозитория `RATING_API_URL` с тем же URL (см. workflow).

Пересоберите и задеплойте сайт.

### 4. Просмотр оценок

- Откройте **https://plekhov.online/ratings/** (или `/ratings` на localhost).
- Введите `ADMIN_KEY`.
- Увидите среднюю оценку, распределение и таблицу.

Параллельно все строки попадают в Google Таблицу.

## Telegram (необязательно)

Если задать `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`, на каждую оценку придёт сообщение в Telegram.

## Без API

Если `NEXT_PUBLIC_RATING_API_URL` не задан, виджет всё равно работает для посетителя (оценка в `localStorage`), но **вам данные не приходят**.

## Если «Не удалось найти функцию скрипта: doPost»

1. Откройте **Apps Script** → слева список файлов (`.gs`).
2. Откройте **Code.gs** (или единственный файл с кодом).
3. Убедитесь, что **нет** `function myFunction() {` в начале и лишней `}` в конце.
4. Выпадающий список функций сверху должен показывать **`doPost`** и **`doGet`** отдельно (не внутри `myFunction`).
5. **Deploy → Manage deployments → Edit → New version → Deploy**.

Проверка в редакторе: выберите **`testSubmit_`** → **Run** — в листе Ratings должна появиться строка.

## Если URL открывает «Sign in» или curl даёт 401

Деплой создан с доступом **только для вас**. Исправление:

1. **Deploy → Manage deployments** → карандаш.
2. **Who has access** → **Anyone**.
3. **Version: New version** → **Deploy**.
4. URL обычно не меняется — снова проверьте POST (должен вернуть `{"ok":true}`).

## Ограничения

- Нельзя узнать «настоящее» имя без ввода посетителем.
- Один `visitorId` = один браузер; другой браузер = новый ID.
- Защита от спама — только на стороне Apps Script (при необходимости добавьте лимиты в скрипт).
