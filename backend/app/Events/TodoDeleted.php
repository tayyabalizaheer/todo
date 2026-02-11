<?php

namespace App\Events;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TodoDeleted
{
    use Dispatchable, SerializesModels;

    public Todo $todo;
    public User $deletedBy;
    public array $sharedUserIds;

    /**
     * Create a new event instance.
     */
    public function __construct(Todo $todo, User $deletedBy, array $sharedUserIds = [])
    {
        $this->todo = $todo;
        $this->deletedBy = $deletedBy;
        $this->sharedUserIds = $sharedUserIds;
    }
}
