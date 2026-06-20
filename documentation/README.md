# ExpenseFlow

ExpenseFlow is a modern, premium SaaS web application designed to help users manage their personal finances, track daily expenses, monitor subscriptions, and achieve saving goals.

## Tech Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS v4, Recharts, Shadcn UI.
- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL (Neon).
- **Authentication:** OAuth2 with JWT (JSON Web Tokens), Google OAuth integration, and Resend for Email Verification.
- **Deployment:** Vercel (Frontend) and Render (Backend).

## Key Features
- **Vibrant Dashboard:** Comprehensive overview with dynamic Pie and Bar charts illustrating spending habits and budget tracking.
- **Expense Tracking:** Strict date validations ensuring expenses only happen within the current month.
- **Budgeting:** Set limits on spending categories and visually track utilization.
- **Saving Goals:** Track financial milestones with progressive inputs and date enforcement.
- **Subscription Management:** Keep track of recurring services and automatically log subscription expenses with current-month validation.
- **Authentication:** Standard JWT auth mixed with Google OAuth 2.0 flow and verified email checking.
- **Dark/Light Mode:** Seamless theme toggling with persistent user preferences.
- **Full Customization:** Users can manage their profile, emails, and passwords directly from the app.

## Project Structure
```text
ExpenseFlow/
├── frontend/             # React SPA (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React Context providers (Auth, Theme)
│   │   ├── features/     # Feature-based architecture (Dashboard, Expenses, etc)
│   │   ├── services/     # API Axios client
│   │   └── utils/        # Helper functions
├── backend/              # FastAPI Server
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Security and Configuration
│   │   ├── models/       # SQLAlchemy Database Models
│   │   ├── utils/        # Utility helpers (e.g., email sending)
│   │   └── schemas/      # Pydantic validation schemas
├── documentation/        # Project documentation
```

## Local Development
Please refer to `production_setup.md` for information on running the application locally and deploying it to a production environment.
