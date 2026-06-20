# ExpenseFlow - Database Schema

The ExpenseFlow application uses a relational database structure managed by SQLAlchemy. In development, it uses SQLite, but it is fully compatible with PostgreSQL for production environments.

## Entity Relationship Overview

The core entities are `User`, `Category`, `Expense`, `Budget`, `SavingGoal`, and `Subscription`. All entities are linked to a specific user to ensure data privacy and tenant isolation.

### 1. User
The `User` table stores authentication credentials and personal profile details.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Unique identifier |
| `email` | String | Unique, Indexed, Not Null | User's login email address |
| `hashed_password` | String | Not Null | Bcrypt hashed password |
| `name` | String | Not Null | User's full name |
| `is_active` | Boolean | Default: True | Flag for active/deactivated accounts |
| `created_at` | DateTime | Default: func.now() | Timestamp of account creation |

### 2. Category
The `Category` table defines the classification of expenses (e.g., Food, Travel, Entertainment). Users can have custom categories, or default ones are generated for them.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Unique identifier |
| `name` | String | Not Null | Category name |
| `color` | String | | Hex color code for charts |
| `is_default` | Boolean | Default: False | Flag indicating system-default vs custom |
| `user_id` | Integer | Foreign Key (`user.id`) | Owner of the category |
| `created_at` | DateTime | Default: func.now() | Timestamp of creation |

### 3. Expense
The `Expense` table is the core transactional table recording individual spending events.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Unique identifier |
| `amount` | Float | Not Null | Transaction amount |
| `description` | String | Not Null | User-provided description |
| `date` | Date | Not Null, Indexed | Date of the transaction |
| `category_id` | Integer | Foreign Key (`category.id`) | Associated category |
| `user_id` | Integer | Foreign Key (`user.id`) | Owner of the expense |
| `created_at` | DateTime | Default: func.now() | Timestamp of record creation |

### 4. Budget
The `Budget` table defines monthly spending limits per category.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Unique identifier |
| `amount` | Float | Not Null | Maximum allowed spending amount |
| `period` | String | Default: 'monthly' | Frequency of the budget |
| `category_id` | Integer | Foreign Key (`category.id`) | Target category for the budget limit |
| `user_id` | Integer | Foreign Key (`user.id`) | Owner of the budget |
| `created_at` | DateTime | Default: func.now() | Timestamp of creation |

### 5. SavingGoal
The `SavingGoal` table allows users to track progress toward financial objectives.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Unique identifier |
| `name` | String | Not Null | Title of the goal |
| `target_amount` | Float | Not Null | Goal amount to reach |
| `current_amount` | Float | Default: 0.0 | Amount saved so far |
| `deadline` | Date | | Target completion date |
| `user_id` | Integer | Foreign Key (`user.id`) | Owner of the goal |
| `created_at` | DateTime | Default: func.now() | Timestamp of creation |

### 6. Subscription
The `Subscription` table tracks recurring expenses.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Unique identifier |
| `name` | String | Not Null | Service name (e.g., Netflix) |
| `amount` | Float | Not Null | Recurring charge amount |
| `billing_cycle` | String | Not Null | Frequency (e.g., 'monthly', 'yearly') |
| `next_billing_date` | Date | Not Null | Date of next expected charge |
| `status` | String | Default: 'active' | Current status (active/cancelled) |
| `user_id` | Integer | Foreign Key (`user.id`) | Owner of the subscription |
| `created_at` | DateTime | Default: func.now() | Timestamp of creation |
