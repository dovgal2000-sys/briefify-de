# Briefify Quick Deploy

## Local

```bash
git add .
git commit -m "Update site"
git push
```

## Server

```bash
cd /usr/home/hybjty/briefify-app
git pull
npm install
node --check server.js
```

## konsoleH

- Open `Node.js Configuration`
- Click `Save`
- Click `Restart`

## Verify

```bash
cat /usr/home/hybjty/briefify.log
```

Open in browser:

- `https://briefify.de`
- `https://briefify.de/admin/login`
- `https://briefify.de/feedback`

## If something breaks

```bash
cat /usr/home/hybjty/briefify.log
cat /usr/home/hybjty/briefify-bootstrap.log
git status
node --check server.js
```
