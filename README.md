# Portfolio Quentin

This repo contains the source for my personal portfolio built with Vite + React.

## Prerequisites
- Node.js 20+ and npm
- Git access to this repository
- A Raspberry Pi (64-bit OS) with SSH access
- Optional but recommended: an Nginx reverse proxy and a Cloudflare account for tunneling your domain

## Local development
```bash
npm install
npm run dev
```
The dev server runs on `http://127.0.0.1:4173/`.

## Production build
```bash
npm install
npm run build
```
The static assets end up in `dist/`.

## Deploying on a Raspberry Pi via GitHub
1. **Prepare the Pi**
   - Install Raspberry Pi OS Lite and enable SSH.
   - Install Node and Git: `sudo apt update && sudo apt install git -y`.
2. **Clone the repo**
   ```bash
   cd /var/www
   sudo git clone https://github.com/QuentinfHn/portfolio-Quentin.git portfolio
   cd portfolio
   ```
3. **Install dependencies and build**
   ```bash
   npm install
   npm run build
   ```
4. **Serve with Nginx (recommended)**
   - Install Nginx: `sudo apt install nginx -y`.
   - Create `/etc/nginx/sites-available/portfolio` with the server block below and symlink it into `sites-enabled`:

    ```nginx
    server {
       listen 80;
       server_name your.domain.com;

       root /var/www/portfolio/dist;
       index index.html;

       location / {
          try_files $uri /index.html;
          add_header Cache-Control "public, max-age=3600";
       }

       location ~* \.(js|css|png|jpe?g|gif|svg|webp)$ {
          try_files $uri =404;
          add_header Cache-Control "public, max-age=31536000, immutable";
       }
    }
    ```

   - Adjust `server_name` if you use a custom domain or `_` to listen for all hosts.
   - Enable the config: `sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio`.
   - Reload Nginx: `sudo systemctl reload nginx`.
5. **Update deployments**
   ```bash
   cd /var/www/portfolio
   git pull origin main
   npm install --production
   npm run build
   sudo systemctl reload nginx
   ```

## Cloudflare Tunnel + custom domain (optional)
1. Install `cloudflared` on the Pi, run `cloudflared tunnel login`, and create a tunnel.
2. Point the tunnel to `http://localhost:80` (or the port Nginx uses).
3. Create a DNS record in Cloudflare that routes your domain/subdomain through the tunnel.
4. Enable "Always Use HTTPS" + "Automatic HTTPS Rewrites" for effortless TLS.

