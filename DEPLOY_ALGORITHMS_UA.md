# Алгоритми деплою Briefify.de на Hetzner Webhosting / konsoleH

Цей файл описує production-деплой Briefify.de саме для Hetzner Webhosting через `konsoleH`.

- хостинг: Hetzner Webhosting;
- керування Node.js: `konsoleH`;
- директорія застосунку на сервері: `/usr/home/hybjty/briefify-app`;
- стартовий файл: `server.js`;
- production URL: `https://briefify.de`.

## 1. Звичайний деплой змін

Використовуйте цей алгоритм для більшості оновлень сайту: зміни CSS, HTML, SEO, статей, `robots.txt`, `llms.txt`, sitemap, невеликі правки логіки.

### Локально

1. Перевірити, які файли змінені:

```bash
git status
```

2. Перевірити синтаксис Node-файлів, якщо змінювали `server.js` або файли в `src/`:

```bash
node --check server.js
node --check src/templates.js
```

3. Запустити сайт локально:

```bash
npm start
```

4. Відкрити локально:

- `http://localhost:3000`;
- `http://localhost:3000/robots.txt`;
- `http://localhost:3000/llms.txt`;
- `http://localhost:3000/sitemap.xml`;
- `http://localhost:3000/admin/login`;
- `http://localhost:3000/feedback`.

5. Зробити commit і push:

```bash
git add .
git commit -m "Describe your changes"
git push
```

### На сервері

1. Підключитися по SSH:

```bash
ssh hybjty@YOUR_HETZNER_HOST
```

2. Перейти в директорію сайту:

```bash
cd /usr/home/hybjty/briefify-app
```

3. Завантажити новий код:

```bash
git pull
```

4. Оновити залежності:

```bash
npm install
```

5. Перевірити синтаксис:

```bash
node --check server.js
```

6. У `konsoleH` відкрити `Node.js Configuration` і натиснути:

1. `Save`;
2. `Restart`.

7. Перевірити логи:

```bash
cat /usr/home/hybjty/briefify.log
cat /usr/home/hybjty/briefify-bootstrap.log
```

Очікувано має бути щось на кшталт:

```text
[briefify] server listening on http://localhost:3000
```

## 2. Перший деплой на Hetzner Webhosting

Цей алгоритм потрібен, якщо сервер ще порожній або застосунок переноситься в нову директорію.

1. Підключитися до сервера:

```bash
ssh hybjty@YOUR_HETZNER_HOST
```

2. Створити директорію:

```bash
mkdir -p /usr/home/hybjty/briefify-app
cd /usr/home/hybjty/briefify-app
```

3. Клонувати репозиторій:

```bash
git clone YOUR_REPOSITORY_URL .
```

4. Встановити залежності:

```bash
npm install
```

5. Створити папку для SQLite:

```bash
mkdir -p /usr/home/hybjty/briefify-app/data
touch /usr/home/hybjty/briefify-app/data/.gitkeep
```

6. Створити production `.env`:

```bash
nano /usr/home/hybjty/briefify-app/.env
```

Мінімально важливі значення:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5

TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...

STATS_DB_PATH=./data/briefify.sqlite

ADMIN_USERNAME=...
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
ADMIN_COOKIE_NAME=briefify_admin_session
ADMIN_SESSION_MAX_AGE_MS=43200000
ADMIN_TIME_ZONE=Europe/Berlin

FEEDBACK_ACCESS_COOKIE_NAME=briefify_feedback_access
FEEDBACK_ACCESS_MAX_AGE_MS=604800000

APP_NAME=Briefify
SITE_ORIGIN=https://briefify.de
SUPPORT_EMAIL=info@briefify.de
CONTACT_EMAIL=info@briefify.de
CITY=Donauwörth
COUNTRY=Deutschland
```

7. Перевірити синтаксис:

```bash
node --check server.js
```

8. У `konsoleH` налаштувати Node.js:

- `Version`: `20`;
- `Working directory`: `briefify-app`;
- `Script path`: `server.js`;
- `Log file`: `briefify.log`;
- `Memory limit`: `256`.

9. Натиснути `Save`, потім `Restart`.

10. Перевірити production URL:

- `https://briefify.de`;
- `https://briefify.de/admin/login`;
- `https://briefify.de/feedback`;
- `https://briefify.de/robots.txt`;
- `https://briefify.de/llms.txt`;
- `https://briefify.de/sitemap.xml`.

## 3. Деплой після SEO або AI-readiness змін

Цей алгоритм варто використовувати після змін у:

- `robots.txt`;
- `llms.txt`;
- `sitemap.xml`;
- JSON-LD schema;
- trust-сторінках;
- статтях.

Після стандартного деплою обов'язково перевірити:

```bash
curl -I https://briefify.de/robots.txt
curl -I https://briefify.de/llms.txt
curl -I https://briefify.de/sitemap.xml
```

Потім відкрити в браузері:

- `https://briefify.de/robots.txt`;
- `https://briefify.de/llms.txt`;
- `https://briefify.de/sitemap.xml`;
- `https://briefify.de/pro-nas`;
- `https://briefify.de/yak-pratsiuye`;
- `https://briefify.de/bezpeka-ta-pryvatnist`;
- `https://briefify.de/redaktsiina-polityka`.

У HTML головної та статей треба перевірити наявність:

```html
application/ld+json
```

## 4. Деплой з перевіркою функції аналізу документа

Цей алгоритм потрібен після змін у:

- `server.js`;
- `src/openai.js`;
- `src/document.js`;
- `public/app.js`;
- формі завантаження;
- Turnstile;
- `.env`.

Після деплою:

1. Відкрити `https://briefify.de`.
2. Завантажити тестовий JPG, PNG або PDF.
3. Перевірити, що з'являється статус обробки.
4. Дочекатися результату.
5. Перевірити блоки:

- коротке пояснення;
- дії;
- дедлайни;
- ризики;
- чернетка відповіді;
- дисклеймер.

Якщо аналіз не працює, перевірити:

```bash
cat /usr/home/hybjty/briefify.log
cat /usr/home/hybjty/briefify-bootstrap.log
```

Також перевірити в `.env`:

- `OPENAI_API_KEY`;
- `OPENAI_MODEL`;
- `TURNSTILE_SITE_KEY`;
- `TURNSTILE_SECRET_KEY`;
- `MAX_FILE_SIZE_BYTES`;
- `TEXT_EXTRACTION_MIN_CHARS`.

## 5. Деплой з перевіркою feedback/admin

Цей алгоритм потрібен після змін у:

- `/feedback`;
- `/admin`;
- SQLite;
- moderation flow;
- cookie/session логіці.

Після деплою:

1. Відкрити `https://briefify.de`.
2. Зробити тестовий аналіз документа.
3. Перейти на `https://briefify.de/feedback`.
4. Надіслати тестовий feedback.
5. Увійти в `https://briefify.de/admin/login`.
6. Approve тестовий feedback.
7. Перевірити, що він з'явився на головній сторінці.

Перевірка SQLite:

```bash
cd /usr/home/hybjty/briefify-app
git status
git ls-files data
ls -la /usr/home/hybjty/briefify-app/data
```

Очікування:

- `git ls-files data` показує тільки `data/.gitkeep`;
- `briefify.sqlite` не має бути в git;
- база має залишатися на сервері між деплоями.

## 6. Rollback, якщо після деплою сайт зламався

1. Зайти на сервер:

```bash
ssh hybjty@YOUR_HETZNER_HOST
cd /usr/home/hybjty/briefify-app
```

2. Подивитися останні commits:

```bash
git log --oneline -5
```

3. Повернутися на попередній стабільний commit:

```bash
git checkout COMMIT_HASH
```

4. Оновити залежності, якщо потрібно:

```bash
npm install
```

5. Перевірити синтаксис:

```bash
node --check server.js
```

6. У `konsoleH` натиснути:

1. `Save`;
2. `Restart`.

7. Перевірити сайт і логи:

```bash
cat /usr/home/hybjty/briefify.log
cat /usr/home/hybjty/briefify-bootstrap.log
```

Після rollback краще локально виправити помилку, зробити новий commit і знову задеплоїти нормальним алгоритмом.

## 7. Якщо `git pull` не працює

Перевірити стан репозиторію на сервері:

```bash
cd /usr/home/hybjty/briefify-app
git status
```

Якщо є локальні зміни на сервері, не видаляйте їх одразу. Спершу подивіться, що саме змінено:

```bash
git diff
```

Типові варіанти:

- змінений `.env` не має заважати, бо він не повинен бути в git;
- змінені log-файли краще не тримати в git;
- якщо випадково змінений код на сервері, треба вирішити, чи переносити ці зміни в репозиторій, чи відкотити їх.

## 8. Якщо сайт не стартує

На сервері виконати:

```bash
cd /usr/home/hybjty/briefify-app
node --check server.js
cat /usr/home/hybjty/briefify.log
cat /usr/home/hybjty/briefify-bootstrap.log
```

Найчастіші причини:

- помилка синтаксису в `server.js` або `src/*.js`;
- відсутній або неправильний `.env`;
- неправильна Node.js версія в `konsoleH`;
- не встановлені залежності після `git pull`;
- немає доступу до `data/briefify.sqlite`;
- неправильний `SITE_ORIGIN`.

## 9. Коротка шпаргалка

Найчастіший деплой:

```bash
git status
git add .
git commit -m "Update site"
git push
ssh hybjty@YOUR_HETZNER_HOST
cd /usr/home/hybjty/briefify-app
git pull
npm install
node --check server.js
```

Потім у `konsoleH`:

1. `Save`;
2. `Restart`.

Фінальна перевірка:

```bash
cat /usr/home/hybjty/briefify.log
```

Відкрити:

- `https://briefify.de`;
- `https://briefify.de/admin/login`;
- `https://briefify.de/feedback`;
- `https://briefify.de/robots.txt`;
- `https://briefify.de/llms.txt`;
- `https://briefify.de/sitemap.xml`.
