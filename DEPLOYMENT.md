# EHockey League Site - Deployment Guide

This guide covers multiple deployment options for the EHockey League site, including Docker, Platform-as-a-Service (PaaS), and Virtual Private Server (VPS) deployments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [PaaS Deployment](#paas-deployment)
5. [VPS Deployment](#vps-deployment)
6. [SSL/HTTPS Configuration](#sslhttps-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- **Supabase Project**: Set up and configured with the required database schema
- **Domain Name**: (Optional but recommended for production)
- **SSL Certificate**: (Required for HTTPS in production)
- **Environment Variables**: All required variables configured

### Required Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Branding Configuration (optional)
NEXT_PUBLIC_BRAND_LOGO_URL=https://your-domain.com/logo.png
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=#1e40af
NEXT_PUBLIC_BRAND_SECONDARY_COLOR=#3b82f6
NEXT_PUBLIC_BRAND_ACCENT_COLOR=#f59e0b

# Database Configuration (if using external database)
DATABASE_URL=your_database_url

# Authentication Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Email Configuration (for password reset, etc.)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# File Upload Configuration (for logos, etc.)
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/svg+xml

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## Docker Deployment

### Option 1: Docker Compose (Recommended for Development)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd eashl-site-master
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.production
   # Edit .env.production with your actual values
   ```

3. **Build and run with Docker Compose**:
   ```bash
   # Development setup (includes Supabase local)
   docker-compose up -d

   # Production setup (without local Supabase)
   docker-compose --profile production up -d
   ```

4. **Access the application**:
   - Main site: http://localhost:3000
   - Supabase Studio: http://localhost:3001 (development only)

### Option 2: Standalone Docker

1. **Build the Docker image**:
   ```bash
   docker build -t eashl-site .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name eashl-site \
     -p 3000:3000 \
     --env-file .env.production \
     eashl-site
   ```

### Option 3: Docker with Nginx Reverse Proxy

1. **Create nginx configuration** (`nginx/nginx.conf`):
   ```nginx
   events {
       worker_connections 1024;
   }

   http {
       upstream eashl_backend {
           server eashl-site:3000;
       }

       server {
           listen 80;
           server_name your-domain.com;

           location / {
               proxy_pass http://eashl_backend;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }
       }
   }
   ```

2. **Run with nginx**:
   ```bash
   docker-compose --profile production up -d
   ```

## PaaS Deployment

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Configure environment variables** in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all required environment variables

4. **Configure custom domain** (optional):
   - Go to Project Settings > Domains
   - Add your custom domain

### Netlify Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Deploy
   netlify deploy --prod --dir=out
   ```

3. **Configure environment variables** in Netlify dashboard

### Railway Deployment

1. **Connect your repository** to Railway
2. **Configure environment variables** in Railway dashboard
3. **Deploy automatically** on git push

### Render Deployment

1. **Create a new Web Service** in Render
2. **Connect your repository**
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. **Add environment variables**
5. **Deploy**

## VPS Deployment

### Ubuntu/Debian Server Setup

1. **Update system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2** (process manager):
   ```bash
   sudo npm install -g pm2
   ```

4. **Install Nginx**:
   ```bash
   sudo apt install nginx -y
   ```

5. **Clone and setup the application**:
   ```bash
   git clone <repository-url>
   cd eashl-site-master
   npm install
   npm run build
   ```

6. **Configure PM2**:
   ```bash
   # Create ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'eashl-site',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   EOF

   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/eashl-site
   ```

   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/eashl-site /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### CentOS/RHEL Server Setup

1. **Update system**:
   ```bash
   sudo yum update -y
   ```

2. **Install Node.js**:
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. **Follow steps 3-8 from Ubuntu setup** (PM2 and Nginx configuration)

## SSL/HTTPS Configuration

### Let's Encrypt with Certbot

1. **Install Certbot**:
   ```bash
   # Ubuntu/Debian
   sudo apt install certbot python3-certbot-nginx -y

   # CentOS/RHEL
   sudo yum install certbot python3-certbot-nginx -y
   ```

2. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**:
   ```bash
   sudo crontab -e
   # Add this line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Cloudflare SSL (Alternative)

1. **Add your domain** to Cloudflare
2. **Update nameservers** to point to Cloudflare
3. **Enable SSL/TLS** in Cloudflare dashboard
4. **Set SSL mode** to "Full" or "Full (strict)"

## Monitoring and Maintenance

### Health Checks

1. **Create health check endpoint** (`/api/health`):
   ```typescript
   export async function GET() {
     return NextResponse.json({ 
       status: 'healthy', 
       timestamp: new Date().toISOString() 
     });
   }
   ```

2. **Monitor with UptimeRobot** or similar service

### Logs and Monitoring

1. **PM2 monitoring** (VPS):
   ```bash
   pm2 monit
   pm2 logs eashl-site
   ```

2. **Docker logs**:
   ```bash
   docker-compose logs -f eashl-site
   ```

3. **Nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### Backup Strategy

1. **Database backups** (Supabase):
   - Enable automatic backups in Supabase dashboard
   - Set up manual backup schedule

2. **Application backups**:
   ```bash
   # Create backup script
   cat > backup.sh << EOF
   #!/bin/bash
   DATE=\$(date +%Y%m%d_%H%M%S)
   tar -czf backup_\$DATE.tar.gz /path/to/app
   EOF
   chmod +x backup.sh
   ```

3. **Automated backups**:
   ```bash
   # Add to crontab
   0 2 * * * /path/to/backup.sh
   ```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Find process using port 3000
   sudo lsof -i :3000
   # Kill process
   sudo kill -9 <PID>
   ```

2. **Permission denied**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /path/to/app
   chmod +x /path/to/app
   ```

3. **Environment variables not loading**:
   - Ensure `.env.production` exists
   - Check variable names match exactly
   - Restart the application

4. **Database connection issues**:
   - Verify Supabase URL and keys
   - Check network connectivity
   - Ensure database is running

### Performance Optimization

1. **Enable compression** in Nginx:
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Add caching headers**:
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Optimize images**:
   - Use WebP format
   - Implement lazy loading
   - Use appropriate image sizes

### Security Considerations

1. **Firewall configuration**:
   ```bash
   # UFW (Ubuntu)
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable

   # Firewalld (CentOS)
   sudo firewall-cmd --permanent --add-service=ssh
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https
   sudo firewall-cmd --reload
   ```

2. **Regular updates**:
   ```bash
   # System updates
   sudo apt update && sudo apt upgrade -y

   # Application updates
   git pull origin main
   npm install
   npm run build
   pm2 restart eashl-site
   ```

3. **Security headers**:
   Add to Nginx configuration:
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-XSS-Protection "1; mode=block" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header Referrer-Policy "no-referrer-when-downgrade" always;
   add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
   ```

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review application logs
3. Verify environment variables
4. Test database connectivity
5. Check network connectivity

For additional support, refer to the main README.md file or create an issue in the repository.
