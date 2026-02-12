# TodoV1 Project

A full-stack todo application with Laravel backend and Angular frontend.

## Project Structure

- `backend/` - Laravel PHP backend API
- `frontend/` - Angular frontend application
- `docs/` - Project documentation

## Prerequisites

- PHP >= 8.4
- Composer
- Node.js >= 22.x
- npm or yarn
- MySQL or PostgreSQL database

## Backend Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure your database in the `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

6. Run database migrations:
```bash
php artisan migrate
```

7. (Optional) Seed the database:
```bash
php artisan db:seed
```

8. Link storage directory:
```bash
php artisan storage:link
```

9. Start the development server:
```bash
php artisan serve
```

The backend API will be available at `http://localhost:8000`

## Frontend Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - Update API endpoint in `src/environments/environment.ts` if needed

4. Start the development server:
```bash
npm start
```

The frontend application will be available at `http://localhost:4200`

## Development

### Backend Commands

- Run tests: `php artisan test`
- Run lint: `composer lint`
- Run lint fix: `composer lint:fix`
- Run code formatter: `./vendor/bin/pint`
- Clear cache: `php artisan cache:clear`
- Create migration: `php artisan make:migration migration_name`
- Create controller: `php artisan make:controller ControllerName`

### Frontend Commands

- Run tests: `npm test`
- Build for production: `npm run build`
- Lint: `npm run lint`
