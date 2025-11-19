# Portfolio Quentin

This repo contains the source for my personal portfolio built with Vite + React..

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
   - Point a server block to `/var/www/portfolio/dist` with `try_files $uri /index.html` for SPA routing.
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

