<?php

namespace App\Providers;

use App\Domains\Auth\Models\User;
use App\Domains\Auth\Observers\UserObserver;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // Domain-specific events are registered in their respective domain providers
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        // Register User Observer
        User::observe(UserObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
