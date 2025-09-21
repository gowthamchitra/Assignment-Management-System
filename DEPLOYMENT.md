# Deployment Guide

This guide covers deploying the Assignment Management System to various platforms.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or MongoDB instance
- Domain name (optional)
- SSL certificate (for production)

## Environment Variables

Create a `.env` file with the following production variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/assignment-management
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_app_password

# Google Sheets API
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials/google-service-account.json
GOOGLE_SHEETS_SPREADSHEET_ID=your_production_spreadsheet_id
GOOGLE_SHEETS_RANGE=Sheet1!A1:D10

# Frontend URL
CLIENT_URL=https://your-domain.com
```

## Deployment Options

### 1. Heroku Deployment

#### Step 1: Prepare for Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name
```

#### Step 2: Configure Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set JWT_EXPIRE=7d
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_USER=your_email@gmail.com
heroku config:set EMAIL_PASS=your_app_password
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
```

#### Step 3: Deploy
```bash
# Add MongoDB Atlas addon
heroku addons:create mongolab:sandbox

# Deploy to Heroku
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 2. Vercel Deployment

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Configure for Vercel
Create `vercel.json` in the root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

#### Step 3: Deploy
```bash
vercel --prod
```

### 3. DigitalOcean App Platform

#### Step 1: Create App Spec
Create `.do/app.yaml`:

```yaml
name: assignment-management
services:
- name: api
  source_dir: /
  github:
    repo: your-username/assignment-management
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: your_mongodb_connection_string
  - key: JWT_SECRET
    value: your_jwt_secret
  - key: CLIENT_URL
    value: https://your-app.ondigitalocean.app

- name: client
  source_dir: /client
  github:
    repo: your-username/assignment-management
    branch: main
  run_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  static_sites:
  - name: client
    source_dir: /client
    build_command: npm run build
    output_dir: build
    routes:
    - path: /
```

### 4. AWS EC2 Deployment

#### Step 1: Launch EC2 Instance
- Choose Ubuntu 20.04 LTS
- Select t2.micro (free tier)
- Configure security groups (ports 22, 80, 443, 3000, 5000)

#### Step 2: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Step 3: Deploy Application
```bash
# Clone repository
git clone your-repo-url
cd assignment-management-system

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Start with PM2
pm2 start server.js --name "assignment-management"
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx
Create `/etc/nginx/sites-available/assignment-management`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/assignment-management-system/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/assignment-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user
4. Whitelist your IP address
5. Get connection string
6. Update `MONGODB_URI` in environment variables

### Self-hosted MongoDB

```bash
# Install MongoDB
sudo apt install mongodb -y

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database
mongo
use assignment-management
```

## SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Maintenance

### PM2 Monitoring
```bash
# View logs
pm2 logs assignment-management

# Monitor resources
pm2 monit

# Restart application
pm2 restart assignment-management
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## Backup Strategy

### Database Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your_mongodb_uri" --out="/backups/mongodb_$DATE"
tar -czf "/backups/mongodb_$DATE.tar.gz" "/backups/mongodb_$DATE"
rm -rf "/backups/mongodb_$DATE"
EOF

chmod +x backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### Application Backup
```bash
# Backup application files
tar -czf "app_backup_$(date +%Y%m%d).tar.gz" /path/to/assignment-management-system
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 PID
   ```

2. **MongoDB connection failed**
   - Check connection string
   - Verify network access
   - Check authentication credentials

3. **Build failures**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   ```

### Logs and Debugging

```bash
# Application logs
pm2 logs assignment-management --lines 100

# System logs
sudo journalctl -u nginx -f

# Database logs
sudo tail -f /var/log/mongodb/mongod.log
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable MongoDB authentication
- [ ] Configure firewall rules
- [ ] Enable SSL/TLS
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup data regularly

## Performance Optimization

1. **Enable Gzip compression** in Nginx
2. **Use CDN** for static assets
3. **Implement caching** strategies
4. **Database indexing** for frequently queried fields
5. **Load balancing** for high traffic

## Scaling Considerations

- **Horizontal scaling**: Multiple app instances behind load balancer
- **Database scaling**: MongoDB replica sets or sharding
- **Caching layer**: Redis for session storage
- **CDN**: CloudFlare or AWS CloudFront
- **Monitoring**: Application performance monitoring tools
