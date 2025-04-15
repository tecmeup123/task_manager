# Deployment Guide: Training Session Management Application

This guide provides detailed instructions for deploying the Training Session Management Application on a Virtual Private Server (VPS). It covers all necessary steps from server preparation to application configuration and maintenance.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Preparation](#server-preparation)
3. [Application Deployment](#application-deployment)
4. [Database Setup](#database-setup)
5. [Web Server Configuration](#web-server-configuration)
6. [Environment Variables](#environment-variables)
7. [SSL Configuration](#ssl-configuration)
8. [Running the Application](#running-the-application)
9. [Process Management](#process-management)
10. [Maintenance and Updates](#maintenance-and-updates)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

Before beginning the deployment process, ensure you have:

- A VPS running Ubuntu 20.04 LTS or newer
- Root or sudo access to the server
- A domain name pointed to your server's IP address (for SSL)
- Basic knowledge of Linux command line and SSH

## Server Preparation

### 1. SSH into your VPS

```bash
ssh username@your-server-ip
```

### 2. Update the system

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Install required system dependencies

```bash
sudo apt install -y curl wget git build-essential nginx software-properties-common
```

### 4. Install Node.js (v20.x recommended)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify the installation:

```bash
node -v  # Should show v20.x.x
npm -v   # Should show 9.x.x or newer
```

### 5. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

## Application Deployment

### 1. Create a directory for the application

```bash
sudo mkdir -p /var/www/training-app
sudo chown -R $USER:$USER /var/www/training-app
```

### 2. Clone the repository

```bash
cd /var/www/training-app
git clone https://your-repository-url.git .
```

### 3. Install application dependencies

```bash
npm install
```

## Database Setup

### 1. Create a PostgreSQL database and user

```bash
sudo -i -u postgres psql
```

In the PostgreSQL prompt, run:

```sql
CREATE DATABASE training_management;
CREATE USER training_app WITH ENCRYPTED PASSWORD 'choose-a-strong-password';
GRANT ALL PRIVILEGES ON DATABASE training_management TO training_app;
\q
```

### 2. Push the schema to the database

From the application directory:

```bash
npm run db:push
```

## Web Server Configuration

### 1. Create a Nginx configuration file

```bash
sudo nano /etc/nginx/sites-available/training-app
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/training-app /etc/nginx/sites-enabled/
sudo nginx -t  # Test the Nginx configuration
sudo systemctl restart nginx
```

## Environment Variables

### 1. Create an environment file

```bash
cd /var/www/training-app
nano .env
```

Add the following environment variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgres://training_app:choose-a-strong-password@localhost:5432/training_management
SESSION_SECRET=choose-a-very-secure-random-string
```

## SSL Configuration

### 1. Install Certbot

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. Obtain an SSL certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts to complete the SSL setup.

## Running the Application

### 1. Build the application for production

```bash
cd /var/www/training-app
npm run build
```

### 2. Test the application

```bash
npm start
```

Access your application at your-domain.com to verify it's working properly.

## Process Management

For production deployments, use a process manager to keep the application running.

### 1. Install PM2

```bash
sudo npm install -g pm2
```

### 2. Start the application with PM2

```bash
cd /var/www/training-app
pm2 start npm --name "training-app" -- start
```

### 3. Configure PM2 to start on system boot

```bash
pm2 startup
```

Follow the instructions provided by the command, then:

```bash
pm2 save
```

### 4. Check application status

```bash
pm2 status
pm2 logs training-app
```

## Maintenance and Updates

### Regular Updates

1. Pull the latest changes:

```bash
cd /var/www/training-app
git pull
```

2. Install dependencies and rebuild:

```bash
npm install
npm run build
```

3. Restart the application:

```bash
pm2 restart training-app
```

### Database Backups

Schedule regular backups of your PostgreSQL database:

```bash
sudo -u postgres pg_dump training_management > /path/to/backups/training_db_backup_$(date +%Y%m%d).sql
```

Add this command to a cron job for automatic backups.

### System Updates

Regularly update your server:

```bash
sudo apt update
sudo apt upgrade -y
```

## Troubleshooting

### Check Application Logs

```bash
pm2 logs training-app
```

### Check Nginx Logs

```bash
sudo cat /var/log/nginx/error.log
sudo cat /var/log/nginx/access.log
```

### Database Connection Issues

Verify the database connection:

```bash
psql -U training_app -h localhost -d training_management
```

If you can't connect, check PostgreSQL's configuration:

```bash
sudo cat /etc/postgresql/12/main/pg_hba.conf
```

### Application Not Starting

1. Check for syntax or dependency errors:

```bash
cd /var/www/training-app
npm run build
```

2. Verify environment variables:

```bash
cat .env
```

3. Test running the application directly:

```bash
node server/index.js
```

### SSL Certificate Issues

Renew certificates if they're expired:

```bash
sudo certbot renew
```

## Security Considerations

1. **Firewall Configuration**: 
   Set up a firewall to restrict access to only the necessary ports:

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

2. **Regular Security Updates**:
   Keep your system updated with security patches:

```bash
sudo apt update && sudo apt upgrade -y
```

3. **Secure PostgreSQL**:
   Ensure PostgreSQL only accepts local connections by checking:

```bash
sudo nano /etc/postgresql/12/main/postgresql.conf
```

Verify that the listen_addresses parameter is set to 'localhost'.

4. **Fail2Ban Installation**:
   Install Fail2Ban to protect against brute force attacks:

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

5. **Regular Backups**:
   Implement automated backups as described in the Maintenance section.

---

For additional assistance or questions about deployment, please refer to the project documentation or contact the development team.