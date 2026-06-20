# API Documentation

The backend exposes a RESTful API using FastAPI. All endpoints are prefixed with `/api`.

## Authentication endpoints (`/api/auth`)
- `POST /register`: Register a new user and trigger an email verification link.
- `POST /login`: OAuth2 password flow login. Returns JWT access token. Fails if user is unverified.
- `POST /google`: Authenticates user with a Google token. Creates a verified user if new.
- `GET /verify-email`: Accepts a token and activates a user's account.
- `GET /me`: Returns the currently authenticated user details.

## Dashboard endpoints (`/api/dashboard`)
- `GET /`: Retrieves an aggregated summary including `total_expenses`, `this_month_expenses`, `active_categories`, `budget_used_percentage`, `total_budget`, `remaining_budget`, `expenses_by_category`, and `recent_daily_expenses`.

## Categories endpoints (`/api/categories`)
- `GET /`: Get all categories for the user.
- `POST /`: Create a new category.
- `PUT /{id}`: Update category.
- `DELETE /{id}`: Delete category.

## Expenses endpoints (`/api/expenses`)
- `GET /`: Get all user expenses (sorted by date desc).
- `POST /`: Create a new expense. Validates that the expense falls within the current calendar month.
- `PUT /{id}`: Update an expense.
- `DELETE /{id}`: Delete an expense.

## Budgets endpoints (`/api/budgets`)
- `GET /`: Get all budgets for a given month/year.
- `POST /`: Set a new budget for a category.
- `PUT /{id}`: Update an existing budget.
- `DELETE /{id}`: Delete a budget.

## Saving Goals endpoints (`/api/goals`)
- `GET /`: Get all active saving goals.
- `POST /`: Create a new saving goal. Validates that the target date is strictly in the future.
- `PUT /{id}`: Update progress on a saving goal. Marks `is_completed=1` if progress hits target.
- `DELETE /{id}`: Delete a saving goal.

## Subscriptions endpoints (`/api/subscriptions`)
- `GET /`: Get all subscriptions.
- `POST /`: Create a subscription. Validates date is within current month, handles integer/boolean compatibility, and automatically logs an initial `Expense` for the billing cycle.
- `PUT /{id}`: Update subscription.
- `DELETE /{id}`: Delete subscription.

## Security
All endpoints (except login, register, google, and verify-email) require a Bearer JWT Token in the `Authorization` header.
