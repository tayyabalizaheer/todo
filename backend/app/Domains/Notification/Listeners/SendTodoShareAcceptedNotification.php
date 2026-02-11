<?php

namespace App\Domains\Notification\Listeners;

use App\Domains\Todo\Events\TodoShareAccepted;
use App\Domains\Notification\Services\NotificationService;

class SendTodoShareAcceptedNotification
{
    protected NotificationService $notificationService;

    /**
     * Create the event listener.
     */
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(TodoShareAccepted $event): void
    {
        $todo = $event->todo;
        $share = $event->share;
        
        // Get the user who accepted the share
        $acceptedByUser = $share->sharedWithUser;
        
        // Send notification to the owner of the todo
        $this->notificationService->createNotification(
            $todo->owner,
            'todo_share_accepted',
            [
                'message' => "{$acceptedByUser->name} accepted your shared todo: \"{$todo->title}\"",
                'todo_id' => $todo->id,
                'todo_title' => $todo->title,
                'accepted_by' => $acceptedByUser->name,
                'accepted_by_id' => $acceptedByUser->id,
            ]
        );
    }
}
