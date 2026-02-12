<?php

namespace App\Domains\Notification\Providers;

use App\Domains\Notification\Models\Notification;
use App\Domains\Notification\Policies\NotificationPolicy;
use App\Domains\Notification\Services\NotificationService;
use App\Domains\Shared\Contracts\NotificationServiceInterface;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class NotificationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind the NotificationService to the interface
        $this->app->bind(NotificationServiceInterface::class, NotificationService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerRoutes();
        $this->registerPolicies();
    }

    /**
     * Register the Notification domain routes.
     */
    protected function registerRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__ . '/../routes.php');
    }

    /**
     * Register policies for the Notification domain.
     */
    protected function registerPolicies(): void
    {
        Gate::policy(Notification::class, NotificationPolicy::class);
    }
}
