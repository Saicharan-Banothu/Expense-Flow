# ExpenseFlow - API Documentation

The ExpenseFlow backend is built on **FastAPI**. All endpoints (except public Auth routes) require a Bearer token in the `Authorization` header.

## Base URL
`/api`

---

## Authentication (`/api/auth`)

### `POST /auth/register`
Register a new user account.
- **Body:** `{ "name": "string", "email": "user@example.com", "password": "password123" }`
- **Response (200):** User object.

### `POST /auth/login`
OAuth2 compatible token login.
- **Body (Form Data):** `username` (email), `password`
- **Response (200):** `{ "access_token": "...", "token_type": "bearer" }`

### `GET /auth/me`
Retrieve the currently authenticated user's details.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** User object.

### `PUT /auth/me`
Update the currently authenticated user's details.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "name": "string" (optional), "email": "string" (optional), "password": "newpassword" (optional) }`
- **Response (200):** Updated User object.

---

## Dashboard (`/api/dashboard`)

### `GET /dashboard`
Retrieve aggregated financial metrics for the current user.
- **Response (200):**
```json
{
  "total_expenses": 1250.50,
  "this_month_expenses": 450.00,
  "active_categories": 5,
  "budget_used_percentage": 65.5,
  "expenses_by_category": [
    { "name": "Food", "color": "#f59e0b", "total": 200.00 }
  ],
  "recent_daily_expenses": [
    { "date": "2026-06-15", "total": 45.00 }
  ]
}
```

---

## Expenses (`/api/expenses`)

### `GET /expenses`
List all expenses for the user. Supports pagination and filtering.
- **Query Params:** `skip` (int), `limit` (int)
- **Response (200):** Array of Expense objects.

### `POST /expenses`
Create a new expense.
- **Body:** `{ "amount": 45.50, "description": "Groceries", "date": "2026-06-20", "category_id": 1 (optional) }`
- **Note:** If `category_id` is null or invalid, it gracefully falls back to an "Uncategorized" category.

### `DELETE /expenses/{id}`
Delete a specific expense.

---

## Categories (`/api/categories`)

### `GET /categories`
Retrieve all categories belonging to the user.

### `POST /categories`
Create a custom category.
- **Body:** `{ "name": "Travel", "color": "#3b82f6" }`

---

## Budgets (`/api/budgets`)

### `GET /budgets`
Retrieve all configured budgets.

### `POST /budgets`
Create a new budget limit for a category.
- **Body:** `{ "amount": 500, "period": "monthly", "category_id": 1 }`

---

## Saving Goals (`/api/saving-goals`)

### `GET /saving-goals`
List all active saving goals.

### `POST /saving-goals`
Create a new financial goal.
- **Body:** `{ "name": "Vacation Fund", "target_amount": 2000, "current_amount": 500, "deadline": "2026-12-31" }`

---

## Subscriptions (`/api/subscriptions`)

### `GET /subscriptions`
List all active recurring subscriptions.

### `POST /subscriptions`
Track a new subscription.
- **Body:** `{ "name": "Netflix", "amount": 15.99, "billing_cycle": "monthly", "next_billing_date": "2026-07-01", "status": "active" }`
