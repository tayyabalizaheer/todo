<?php

namespace App\Domains\Todo\Providers;

use App\Domains\Notification\Listeners\SendTodoDeletedNotification;
use App\Domains\Notification\Listeners\SendTodoShareAcceptedNotification;
use App\Domains\Notification\Listeners\SendTodoSharedNotification;
use App\Domains\Notification\Listeners\SendTodoUpdatedNotification;
use App\Domains\Todo\Events\TodoDeleted;
use App\Domains\Todo\Events\TodoShareAccepted;
use App\Domains\Todo\Events\TodoShared;
use App\Domains\Todo\Events\TodoUpdated;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class TodoServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the Todo domain.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        TodoShared::class => [
            SendTodoSharedNotification::class,
        ],
        TodoShareAccepted::class => [
            SendTodoShareAcceptedNotification::class,
        ],
        TodoUpdated::class => [
            SendTodoUpdatedNotification::class,
        ],
        TodoDeleted::class => [
            SendTodoDeletedNotification::class,
        ],
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerRoutes();
        $this->registerEventListeners();
    }

    /**
     * Register the Todo domain routes.
     */
    protected function registerRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__ . '/../routes.php');
    }

    /**
     * Register event listeners for the Todo domain.
     */
    protected function registerEventListeners(): void
    {
        foreach ($this->listen as $event => $listeners) {
            foreach ($listeners as $listener) {
                Event::listen($event, $listener);
            }
        }
    }
}
