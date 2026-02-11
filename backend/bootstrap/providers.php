<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\EventServiceProvider::class,
    
    // Domain Service Providers
    App\Domains\Auth\Providers\AuthServiceProvider::class,
    App\Domains\Notification\Providers\NotificationServiceProvider::class,
    App\Domains\Todo\Providers\TodoServiceProvider::class,
    App\Domains\Blog\Providers\BlogServiceProvider::class,
];
