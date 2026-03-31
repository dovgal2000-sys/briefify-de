# Deploy Briefify.de on Hetzner (Ubuntu VPS)

This guide assumes:

- You have a Hetzner Cloud or VPS server with Ubuntu 22.04 or 24.04
- Your domain `briefify.de` will point to this server
- You want to run the app with `systemd` and serve it through `nginx`

## 1. Connect to the server

```bash
ssh root@YOUR_SERVER_IP
```

## 2. Update packages

```bash
apt update && apt upgrade -y
```

## 3. Install Node.js 20, nginx, git, certbot

```bash
apt install -y curl git nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Check versions:

```bash
node -v
npm -v
nginx -v
```

## 4. Create app directory

```bash
mkdir -p /var/www/briefify
cd /var/www/briefify
```

## 5. Upload project

Option A: clone from GitHub

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/briefify-de.git .
```

Option B: upload project files via SFTP/rsync, then continue here.

## 6. Install dependencies

```bash
npm install
```

## 7. Create production .env

```bash
nano /var/www/briefify/.env
```

Example:

```env
PORT=3000
OPENAI_API_KEY=YOUR_REAL_OPENAI_KEY
OPENAI_MODEL=gpt-4.1
OPENAI_ANALYSIS_PROMPT=YOUR_REAL_PROMPT

APP_NAME=Briefify.de
SITE_ORIGIN=https://briefify.de
ENABLE_ADSENSE=false

COMPANY_NAME=Briefify.de
OWNER_NAME=Viktoriia Dovhal
STREET_ADDRESS=Neurieder Weg 26
POSTAL_CODE=86609
CITY=Donauwörth
COUNTRY=Deutschland
VAT_ID=
SUPPORT_EMAIL=info@briefify.de
CONTACT_EMAIL=info@briefify.de
PHONE_NUMBER=+4917687792807

TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

MAX_FILE_SIZE_BYTES=10485760
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=5
TEXT_EXTRACTION_MIN_CHARS=120
```

Save and exit.

## 8. Test app manually

```bash
cd /var/www/briefify
npm start
```

If you see:

```text
[briefify] server listening on http://localhost:3000
```

stop it with:

```bash
Ctrl+C
```

## 9. Create systemd service

```bash
nano /etc/systemd/system/briefify.service
```

Paste:

```ini
[Unit]
Description=Briefify.de Node app
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/briefify
ExecStart=/usr/bin/node /var/www/briefify/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
User=root

[Install]
WantedBy=multi-user.target
```

Then run:

```bash
systemctl daemon-reload
systemctl enable briefify
systemctl start briefify
systemctl status briefify
```

## 10. Configure nginx

```bash
nano /etc/nginx/sites-available/briefify
```

Paste:

```nginx
server {
    server_name briefify.de www.briefify.de;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/briefify /etc/nginx/sites-enabled/briefify
nginx -t
systemctl reload nginx
```

## 11. Point domain to server

In your DNS, point:

- `briefify.de` -> your server IP
- `www.briefify.de` -> your server IP

Wait until DNS resolves correctly.

## 12. Enable HTTPS with Let's Encrypt

```bash
certbot --nginx -d briefify.de -d www.briefify.de
```

Choose redirect to HTTPS when asked.

## 13. Final checks

Open:

- `https://briefify.de`
- `https://briefify.de/impressum`
- `https://briefify.de/datenschutz`
- `https://briefify.de/ads.txt`
- `https://briefify.de/sitemap.xml`

## Useful commands

Restart app:

```bash
systemctl restart briefify
```

See logs:

```bash
journalctl -u briefify -n 100 --no-pager
```

Reload nginx:

```bash
systemctl reload nginx
```

## Updating the app later

```bash
cd /var/www/briefify
git pull
npm install
systemctl restart briefify
```
