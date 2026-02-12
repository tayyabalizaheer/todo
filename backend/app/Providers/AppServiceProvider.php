<?php

namespace App\Providers;

use App\Domains\Notification\Models\Notification;
use App\Domains\Notification\Policies\NotificationPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Notification::class, NotificationPolicy::class);
    }
}
