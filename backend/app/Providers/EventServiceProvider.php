<?php

namespace App\Providers;

use App\Events\TodoShared;
use App\Events\TodoShareAccepted;
use App\Events\TodoUpdated;
use App\Events\TodoDeleted;
use App\Listeners\SendTodoSharedNotification;
use App\Listeners\SendTodoShareAcceptedNotification;
use App\Listeners\SendTodoUpdatedNotification;
use App\Listeners\SendTodoDeletedNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
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
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
