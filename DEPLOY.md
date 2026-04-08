# Briefify Deploy on Hetzner Webhosting

This is the short deploy checklist for the current production setup:

- Hetzner Webhosting
- `konsoleH` Node.js configuration
- app directory: `/usr/home/hybjty/briefify-app`
- startup file: `server.js`

## 1. Local preparation

Make sure everything works locally before deploy:

```bash
npm install
npm start
```

Check:

- home page
- `/admin/login`
- `/feedback`
- document analysis
- approved feedback carousel
- German and Ukrainian UI

## 2. Push code to GitHub

```bash
git status
git add .
git commit -m "Describe your changes"
git push
```

## 3. Connect to Hetzner over SSH

```bash
ssh hybjty@YOUR_HETZNER_HOST
```

## 4. Update project on server

Run exactly in this order:

```bash
cd /usr/home/hybjty/briefify-app
git pull
npm install
mkdir -p /usr/home/hybjty/briefify-app/data
touch /usr/home/hybjty/briefify-app/data/.gitkeep
node --check server.js
```

## 5. Check production .env

Open:

```bash
nano /usr/home/hybjty/briefify-app/.env
```

Make sure the important values exist:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5
OPENAI_ANALYSIS_PROMPT=You explain official and everyday documents in a clear, practical, non-legal style. Analyze the uploaded document carefully. Identify what the document is, what the person is expected to do, any deadlines, risks, or consequences, and the most useful next steps. When appropriate, produce a polite reply draft. If any part of the document is unclear, explicitly mention the uncertainty.

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

Save the file and exit.

## 6. Check Node.js config in konsoleH

Open `Node.js Configuration` and verify:

- `Version`: `20`
- `Working directory`: `briefify-app`
- `Script path`: `server.js`
- `Log file`: `briefify.log`
- `Memory limit`: `256`

Then click:

1. `Save`
2. `Restart`

## 7. Verify app startup

Immediately after restart, run:

```bash
cat /usr/home/hybjty/briefify.log
cat /usr/home/hybjty/briefify-bootstrap.log
ps aux | grep node
```

Expected result:

```text
[briefify] server listening on http://localhost:3000
```

## 8. Browser checks

Open:

- `https://briefify.de`
- `https://briefify.de/?lang=de`
- `https://briefify.de/admin/login`
- `https://briefify.de/feedback`

Then test:

1. analyze a document
2. open `/feedback`
3. submit feedback
4. approve it in `/admin`
5. confirm it appears on the home page carousel

## 9. SQLite checks

```bash
git status
git ls-files data
ls -la /usr/home/hybjty/briefify-app/data
```

Expected:

- `git ls-files data` shows only `data/.gitkeep`
- SQLite files remain on disk but are not tracked by git

## 10. Standard future deploy

For normal updates later:

```bash
cd /usr/home/hybjty/briefify-app
git pull
npm install
node --check server.js
```

Then in `konsoleH`:

1. `Save`
2. `Restart`

And verify:

```bash
cat /usr/home/hybjty/briefify.log
```

## 11. If deploy fails

Check:

```bash
cat /usr/home/hybjty/briefify.log
cat /usr/home/hybjty/briefify-bootstrap.log
git status
node --check server.js
```

If needed, also verify:

- `.env`
- Node version in `konsoleH`
- `briefify.sqlite` file exists in `data/`
