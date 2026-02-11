# Technical Decisions

## Authentication
- **Laravel Sanctum**: Using Laravel Sanctum for API authentication to provide a simple and secure token-based authentication system for single-page applications and mobile applications.

## API Design
- **Proper API Response Format**: Implementing standardized API response structure to ensure consistency across all endpoints, including appropriate HTTP status codes, error messages, and data formatting.

- **API Resources**: Using Laravel API Resources (TodoResource, NotificationResource) to transform models into consistent JSON responses, providing a transformation layer between Eloquent models and JSON responses sent to clients. This ensures proper data formatting, hides sensitive attributes, and maintains clean separation between internal data structure and API output.

- **Pagination Support**: Implemented pagination for todos and notifications endpoints to improve performance and user experience when dealing with large datasets. Returns pagination metadata including current page, total items, and page count.

## Architecture Patterns

- **Service-Repository Pattern**: Implementing a clean architecture with separation of concerns:
  - **Repositories** (TodoRepository, NotificationRepository, UserRepository): Handle all database queries and data persistence logic
  - **Services** (TodoService, NotificationService, UserService): Contain business logic, coordinate between repositories, and handle complex operations
  - **Controllers**: Act as thin HTTP layer, handling requests/responses and delegating to services
  
  This pattern improves testability, maintainability, and allows for easier changes to data sources without affecting business logic.

## Event-Driven Architecture

- **Events and Listeners for Notifications**: Decoupled notification system using Laravel's event system:
  - **Events**: TodoUpdated, TodoDeleted, TodoShared, TodoShareAccepted
  - **Listeners**: SendTodoUpdatedNotification, SendTodoDeletedNotification, SendTodoSharedNotification, SendTodoShareAcceptedNotification
  
  This approach separates notification logic from core business operations, making the system more maintainable, testable, and extensible. Listeners can be easily queued for background processing in production environments.

## Security & Authorization

- **Ownership and Permission Guards**: Implemented comprehensive query-level security to ensure users can only access and modify authorized resources:
  - Todo ownership verification (only owners can delete)
  - Permission-based access control (view, edit, owner permissions)
  - Shared todo access validation (checks if todo is shared with user and permission level)
  - Composite queries that combine ownership and sharing logic securely

- **Notification Policy**: Implemented Laravel Policy (NotificationPolicy) to enforce user-level access control on notifications:
  - Users can only view their own notifications
  - Users can only mark their own notifications as read
  - Users can only delete their own notifications
  - Automatic 403 Forbidden response for unauthorized access attempts
  
  This policy-based authorization ensures proper segregation of user notifications and prevents unauthorized access at the framework level.

## Database Performance
- **Composite Indexes**: Strategic use of composite and single-column indexes to optimize query performance while minimizing index overhead:
  - `['owner_id', 'status']` - Composite index for filtering todos by owner and status
  - `shared_with_user_id` - Index for efficient lookups on shared user queries
  - `shared_by_user_id` - Index for tracking who shared the todos
  - `['notifiable_type', 'notifiable_id']` - Composite index for polymorphic relationships in notifications

  Composite indexes are used where multiple columns are frequently queried together, reducing the need for multiple separate indexes and improving overall database performance.
