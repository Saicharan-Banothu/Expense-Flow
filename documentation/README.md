# ExpenseFlow

ExpenseFlow is a modern, premium SaaS web application designed to help users manage their personal finances, track daily expenses, monitor subscriptions, and achieve saving goals.

## Tech Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS v4, Recharts, Shadcn UI.
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite (Development) / PostgreSQL (Production).
- **Authentication:** OAuth2 with JWT (JSON Web Tokens) and Bcrypt hashing.

## Key Features
- **Vibrant Dashboard:** Comprehensive overview with dynamic Pie and Bar charts illustrating spending habits.
- **Expense Tracking:** Advanced filtering and sorting capabilities to monitor individual transactions.
- **Budgeting:** Set limits on spending categories and visually track utilization.
- **Saving Goals:** Track financial milestones with visual progress bars.
- **Subscription Management:** Keep track of recurring services and upcoming billing dates.
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
│   │   └── schemas/      # Pydantic validation schemas
├── documentation/        # Project documentation
```

## Local Development
Please refer to `production_setup.md` for information on running the application locally and deploying it to a production environment.
