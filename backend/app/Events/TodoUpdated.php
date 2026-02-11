<?php

namespace App\Events;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TodoUpdated
{
    use Dispatchable, SerializesModels;

    public Todo $todo;
    public User $updatedBy;
    public array $sharedUserIds;

    /**
     * Create a new event instance.
     */
    public function __construct(Todo $todo, User $updatedBy, array $sharedUserIds = [])
    {
        $this->todo = $todo;
        $this->updatedBy = $updatedBy;
        $this->sharedUserIds = $sharedUserIds;
    }
}
