<?php

namespace App\Domains\Auth\Observers;

use App\Domains\Auth\Models\User;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Log the user creation
        Log::info('New user created', [
            'user_id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
        ]);

        // TODO: Send welcome email
        
        // For now, just log that we would send an email
        Log::info('Welcome email should be sent', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Add logic for user updates if needed
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        // Add logic for user deletion if needed
        Log::info('User deleted', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        // Add logic for user restoration if needed
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        // Add logic for force deletion if needed
    }
}
