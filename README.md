# Briefify.de

MVP-сайт для пояснення німецьких листів українською мовою. Користувач завантажує `JPG`, `PNG` або `PDF`, сервіс аналізує документ через OpenAI Responses API і повертає:

- короткий зміст українською;
- список потрібних дій;
- дедлайни;
- ризики;
- чернетку відповіді німецькою;
- українське пояснення цієї відповіді.

## Що реалізовано

- український landing page з формою завантаження;
- `POST /api/analyze-letter`;
- валідація типів файлів і розміру;
- memory-only upload без постійного збереження файлів на диск;
- in-memory rate limiting;
- extraction flow:
  - `PDF` -> `pdf-parse`;
  - якщо PDF схожий на скан, fallback на file input в OpenAI;
  - `JPG/PNG` -> image input в OpenAI;
- structured JSON output через `text.format.type = "json_schema"`;
- сторінки `Impressum`, `Datenschutzerklärung`, `Kontakt`.

## Запуск

1. Встановіть Node.js `18.17+`.
2. Встановіть залежності:

```bash
npm install
```

3. Створіть `.env` на основі `.env.example`.
4. Заповніть:

- `OPENAI_API_KEY`
- `OPENAI_ANALYSIS_PROMPT`
- юридичні та контактні реквізити

5. Запустіть застосунок:

```bash
npm run dev
```

або

```bash
npm start
```

## Важливі зауваження

- Поточний текст legal pages є MVP-шаблоном і має бути перевірений юристом у Німеччині перед продакшн-запуском.
- Якщо потрібне пряме надсилання email, це краще робити окремим етапом.
- У продакшні варто додати reverse proxy limits, malware scanning та централізовані retention policy.
