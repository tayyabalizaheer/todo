<?php

namespace App\Domains\Todo\Events;

use App\Domains\Todo\Models\Todo;
use App\Domains\Todo\Models\TodoShare;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TodoShared
{
    use Dispatchable, SerializesModels;

    public Todo $todo;

    public TodoShare $share;

    /**
     * Create a new event instance.
     */
    public function __construct(Todo $todo, TodoShare $share)
    {
        $this->todo = $todo;
        $this->share = $share;
    }
}
