# Production Setup Instructions

This guide outlines the steps to take ExpenseFlow from a local development environment into a production-ready state.

## 1. Database Migration
For development, ExpenseFlow uses SQLite. For production, it is highly recommended to migrate to a robust RDBMS like **PostgreSQL**.

### Steps:
1. Provision a PostgreSQL database.
2. Update the `SQLALCHEMY_DATABASE_URL` in your `.env` file to point to your Postgres instance:
   `postgresql://user:password@host:port/dbname`
3. Install the psycopg2 adapter:
   ```bash
   pip install psycopg2-binary
   ```
4. Run Alembic migrations (if configured) or let SQLAlchemy create the metadata on first startup.

## 2. Backend Production Execution (FastAPI)
Never use `--reload` in production. Run the FastAPI application using a production-grade ASGI server like **Gunicorn** with **Uvicorn** workers.

### Steps:
1. Ensure all environment variables (`SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `DATABASE_URL`) are securely injected.
2. Run the server:
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
   ```
   *(Adjust the number of workers `-w` based on your server's CPU cores, typically `2 * cores + 1`)*

## 3. Frontend Production Build (Vite/React)
The frontend needs to be compiled into static HTML/CSS/JS assets.

### Steps:
1. Create a `.env.production` file in the `frontend` directory containing:
   `VITE_API_URL=https://api.yourdomain.com/api`
2. Build the application:
   ```bash
   npm run build
   ```
3. The resulting static files will be located in the `frontend/dist` directory. 
4. Serve these static files using a high-performance web server like **Nginx** or a CDN (e.g., AWS CloudFront, Vercel).

## 4. Reverse Proxy & SSL (Nginx)
Use Nginx as a reverse proxy to serve the frontend static files and route `/api` requests to your Gunicorn backend. Always secure your production app with SSL (HTTPS) using Let's Encrypt / Certbot.
