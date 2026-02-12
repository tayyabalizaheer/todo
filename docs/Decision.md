# Technical Decisions

---

# Backend Architecture

## Domain-Driven Design (DDD)

- **Domain-Based Architecture**: The backend follows a domain-driven design approach with clear separation of business domains:
  - **Auth Domain**: User authentication, registration, login/logout, user search
  - **Todo Domain**: Todo CRUD operations, sharing, completion status management
  - **Blog Domain**: Blog post management, publishing, archiving
  - **Notification Domain**: User notifications for todo activities
  - **Shared Domain**: Common interfaces and contracts used across domains

- **Domain Structure**: Each domain is self-contained with its own:
  - **Models**: Domain entities (User, Todo, Blog, Notification)
  - **Controllers**: HTTP request handlers
  - **Services**: Business logic layer
  - **Repositories**: Data access layer
  - **Events**: Domain events (TodoShared, TodoUpdated, etc.)
  - **Policies**: Authorization rules
  - **Providers**: Service registration and route binding
  - **routes.php**: Domain-specific route definitions

- **Shared Resources**: 
  - Auth domain is used by Todo and Blog domains for user management
  - Notification domain is used by Todo, Auth, and Blog domains for sending notifications
  - Common contracts in Shared domain enable loose coupling between domains

## Observer Pattern

- **User Observer**: Implemented `UserObserver` to handle user lifecycle events:
  - **created()**: Triggered when a new user is created
    - Logs user creation details (user_id, email, name)
    - Placeholder for welcome email functionality (to be implemented)
  - **updated()**: Hook for user profile updates
  - **deleted()**: Logs user deletion
  - **restored()**: Hook for soft delete restoration
  - **forceDeleted()**: Hook for permanent deletion
  
  Registered in `EventServiceProvider` to automatically observe User model changes. This provides a clean way to decouple side effects from the main business logic.

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

---

# Frontend Architecture

## Framework

- **Angular**: Using Angular as the frontend framework for building a robust, scalable single-page application with TypeScript support, dependency injection, and reactive programming capabilities.

## Authentication & Token Management

- **HTTP Interceptor for Auth Token**: Implemented `AuthTokenInterceptor` to automatically attach authentication tokens to all outgoing HTTP requests:
  - Intercepts HTTP requests and adds Authorization header with Bearer token
  - Centralized token management without duplicating logic across services
  - Seamless integration with Angular's HTTP client
  - Handles token refresh and expiration scenarios

- **Token Storage Service**: Using `TokenStorageService` for centralized token management:
  - Tokens stored in localStorage for persistence across browser sessions
  - Globally accessible through Angular's dependency injection
  - Encapsulates token storage/retrieval logic in a single service
  - Provides clean API for token operations (save, get, clear)
  - Easy to switch storage mechanism (localStorage/sessionStorage/cookies) without affecting other components

## Error Handling

- **Centralized HTTP Error Service**: Implemented `HttpErrorService` for consistent error handling across the application:
  - Catches and processes HTTP errors from API calls
  - Transforms backend error responses into user-friendly messages
  - Provides consistent error format for components to consume
  - Handles different error scenarios (network errors, 4xx, 5xx responses)
  - Improves user experience with meaningful error feedback

## State Management

- **Service-Based State Management**: Using Angular services as state containers for managing application state:
  - Services hold state and expose it through observables (RxJS)
  - Components subscribe to state changes and react accordingly
  - Unidirectional data flow for predictable state updates
  - Facade pattern (e.g., `AuthFacade`) to abstract complex state operations
  - Clear separation between presentation (components) and business logic (services)

## Architecture Patterns

- **Feature-Based Structure**: Organizing code by features rather than technical layers:
  - `features/auth/` - Authentication module with login, register, services
  - `features/dashboard/` - Dashboard with todo management components
  - `core/` - Shared services, guards, interceptors, models
  - Improves code discoverability and maintainability
  - Facilitates lazy loading and code splitting

- **Guard-Based Route Protection**: Using Angular guards for route authorization:
  - `AuthGuard` - Protects authenticated routes, redirects to login if unauthorized
  - `GuestGuard` - Prevents authenticated users from accessing auth pages
  - Declarative route protection in routing configuration
  - Centralized authentication logic

- **API Service Layer**: Separation of concerns with dedicated API services:
  - `auth.api.ts` - Handles authentication API calls
  - `todo.service.ts` - Manages todo CRUD operations
  - `notification.service.ts` - Handles notification operations
  - Clean abstraction between components and HTTP layer
  - Easy to mock for testing

## Component Design

- **Smart and Presentational Components**: Following container/presentational component pattern:
  - Smart components (pages) handle business logic and state
  - Presentational components (modals, forms) focus on UI rendering
  - Improves reusability and testability
  - Clear component responsibilities

## UI/UX Enhancements

- **SweetAlert2 for User Feedback**: Replaced native browser alerts with SweetAlert2 for professional user interactions:
  - **Success notifications**: Toast-style notifications (top-right corner, auto-dismiss)
  - **Error alerts**: Modal dialogs with error icons and detailed messages
  - **Confirmation dialogs**: Beautiful confirm/cancel dialogs for destructive actions
  - **Warning messages**: File validation errors with appropriate icons
  - Used across todo deletion, blog management, file uploads, and sharing features
  - Provides consistent, modern, and user-friendly feedback throughout the application

- **Quill WYSIWYG Editor**: Integrated Quill rich text editor for blog content creation:
  - **Rich text formatting**: Bold, italic, underline, strike-through
  - **Headers**: H1-H6 support
  - **Lists**: Ordered and bullet lists
  - **Blockquotes and code blocks**: For formatted content
  - **Text alignment**: Left, center, right, justify
  - **Colors**: Text and background color customization
  - **Links and images**: Embedded media support
  - **Font sizes**: Multiple size options
  - **Clean formatting**: Remove unwanted formatting
  - Minimum height of 300px for comfortable editing
  - Error state styling integrated with form validation
  - Uses Snow theme for clean, professional appearance

---
