# AWS Deployment Guide

This document outlines how to deploy ExpenseFlow to Amazon Web Services (AWS) using an EC2 instance. This represents a robust, single-server deployment strategy.

## Architecture
- **Compute:** EC2 (t3.micro or t3.small)
- **OS:** Ubuntu 22.04 LTS
- **Database:** Amazon RDS (PostgreSQL) or Local Postgres on EC2
- **Web Server:** Nginx (Reverse Proxy & Static File Hosting)
- **App Server:** Gunicorn + Uvicorn

---

## Step 1: Provision Infrastructure
1. Log into the AWS Console.
2. Navigate to **EC2** and launch a new instance (Ubuntu 22.04).
3. Ensure the associated Security Group allows inbound traffic on ports **22 (SSH)**, **80 (HTTP)**, and **443 (HTTPS)**.
4. Optional: Provision an **RDS PostgreSQL** database if you prefer managed databases.

## Step 2: Server Preparation
SSH into your new EC2 instance:
```bash
ssh -i "your-key.pem" ubuntu@<your-ec2-ip>
```

Update packages and install dependencies:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx git curl -y
```

Install Node.js (for the frontend build):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## Step 3: Application Setup
Clone the repository:
```bash
git clone <your-repo-url> expenseflow
cd expenseflow
```

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```
Create a `.env` file with your production database credentials and secure `SECRET_KEY`.

### Frontend Setup
```bash
cd ../frontend
npm install
echo "VITE_API_URL=https://yourdomain.com/api" > .env.production
npm run build
```

## Step 4: Configure Nginx
We will use Nginx to serve the React static files and proxy API requests to the Python backend.

Copy the frontend build to Nginx's default directory:
```bash
sudo cp -r dist/* /var/www/html/
```

Create an Nginx configuration file `/etc/nginx/sites-available/expenseflow`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/expenseflow /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## Step 5: Configure Systemd (Backend Service)
To keep the backend running permanently and restarting on boot, create a systemd service.

Create `/etc/systemd/system/expenseflow-api.service`:
```ini
[Unit]
Description=Gunicorn instance to serve ExpenseFlow API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/expenseflow/backend
Environment="PATH=/home/ubuntu/expenseflow/backend/venv/bin"
ExecStart=/home/ubuntu/expenseflow/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl start expenseflow-api
sudo systemctl enable expenseflow-api
```

## Step 6: Secure with SSL (HTTPS)
Use Certbot to provision a free SSL certificate from Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Your ExpenseFlow application is now fully deployed on AWS!
