# Database Schema

The ExpenseFlow backend uses PostgreSQL (via Neon) mapped with SQLAlchemy ORM.

## Models

### 1. User
Represents an application user.
- `id` (Integer, Primary Key)
- `email` (String, Unique, Index)
- `hashed_password` (String)
- `name` (String)
- `is_active` (Integer, Default: 1)
- `is_verified` (Integer, Default: 0) - *Added for email verification*
- `created_at` (DateTime)

### 2. Category
Represents a spending category (e.g., Food, Rent).
- `id` (Integer, Primary Key)
- `user_id` (Integer, ForeignKey)
- `name` (String)
- `icon` (String, Optional)
- `color` (String, Optional)
- `created_at` (DateTime)

### 3. Expense
Represents a single logged expense transaction.
- `id` (Integer, Primary Key)
- `user_id` (Integer, ForeignKey)
- `category_id` (Integer, ForeignKey)
- `title` (String)
- `amount` (Float)
- `date` (Date)
- `notes` (String, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 4. Budget
Represents a user's monthly budget for a specific category.
- `id` (Integer, Primary Key)
- `user_id` (Integer, ForeignKey)
- `category_id` (Integer, ForeignKey)
- `amount` (Float)
- `month` (Integer)
- `year` (Integer)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 5. SavingGoal
Represents a target amount to save by a certain date.
- `id` (Integer, Primary Key)
- `user_id` (Integer, ForeignKey)
- `name` (String)
- `target_amount` (Float)
- `current_amount` (Float)
- `target_date` (Date)
- `is_completed` (Integer, Default: 0)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 6. Subscription
Represents recurring payments.
- `id` (Integer, Primary Key)
- `user_id` (Integer, ForeignKey)
- `name` (String)
- `amount` (Float)
- `billing_cycle` (String)
- `next_billing_date` (Date)
- `is_active` (Integer, Default: 1)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## Relationships
- **User** has many **Categories**, **Expenses**, **Budgets**, **SavingGoals**, **Subscriptions**.
- **Category** has many **Expenses** and **Budgets**.
- Deleting a Category currently cascades/requires handling of related Expenses and Budgets.
