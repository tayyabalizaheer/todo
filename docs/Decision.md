# Technical Decisions

## Authentication
- **Laravel Sanctum**: Using Laravel Sanctum for API authentication to provide a simple and secure token-based authentication system for single-page applications and mobile applications.

## API Design
- **Proper API Response Format**: Implementing standardized API response structure to ensure consistency across all endpoints, including appropriate HTTP status codes, error messages, and data formatting.

## Database Performance
- **Composite Indexes**: Strategic use of composite and single-column indexes to optimize query performance while minimizing index overhead:
  - `['owner_id', 'status']` - Composite index for filtering todos by owner and status
  - `shared_with_user_id` - Index for efficient lookups on shared user queries
  - `shared_by_user_id` - Index for tracking who shared the todos
  - `['notifiable_type', 'notifiable_id']` - Composite index for polymorphic relationships in notifications

  Composite indexes are used where multiple columns are frequently queried together, reducing the need for multiple separate indexes and improving overall database performance.
