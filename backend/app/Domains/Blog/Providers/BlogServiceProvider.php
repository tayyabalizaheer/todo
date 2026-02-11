<?php

namespace App\Domains\Blog\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Blog Domain Service Provider
 */
class BlogServiceProvider extends ServiceProvider
{
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
        // Register routes when implemented
        // $this->registerRoutes();
    }

}
