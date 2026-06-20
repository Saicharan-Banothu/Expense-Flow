# Deployment & Local Setup Guide

ExpenseFlow uses a modern stack comprising Vercel (Frontend), Render (Backend), and Neon (Database).

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Google Cloud Console Account (for OAuth Client ID)
- Resend Account (for Email sending APIs)

## Local Development Setup

### 1. Database (Local SQLite or Remote Neon)
By default, running locally without a `DATABASE_URL` will create a local `expense.db` SQLite database. If you wish to test with PostgreSQL, create a database on [Neon.tech](https://neon.tech) and copy the connection string.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
# Optional, defaults to sqlite:///./expense.db
DATABASE_URL=postgresql://user:pass@ep-rest-of-url.neon.tech/dbname?sslmode=require

SECRET_KEY=your_secure_random_string_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

RESEND_API_KEY=re_your_resend_api_key_here
```

Run the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Start the Vite development server:
```bash
npm run dev
```

## Production Deployment

### Frontend (Vercel)
The frontend is deployed as a static site using Vercel.
1. Connect your GitHub repository to Vercel.
2. Select the `frontend` folder as the Root Directory.
3. Framework Preset: **Vite**.
4. Set the Environment Variables:
   - `VITE_API_URL` = `https://your-render-backend-url.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID` = `your_google_client_id.apps.googleusercontent.com`
5. Deploy.

### Backend (Render)
The backend is deployed as a Web Service on Render.
1. Connect your GitHub repository to Render.
2. Root Directory: `backend`
3. Environment: `Python 3`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Set the Environment Variables:
   - `DATABASE_URL` = `postgresql://...` (Your Neon connection string)
   - `SECRET_KEY` = `your_production_secret_key`
   - `RESEND_API_KEY` = `your_resend_api_key`
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `1440`
7. Deploy. Note that Alembic or `Base.metadata.create_all()` runs automatically inside `main.py` to create tables.

### Database (Neon PostgreSQL)
Neon handles serverless scaling. No special configuration is required beyond copying the connection string and providing it to the Render environment variables.
