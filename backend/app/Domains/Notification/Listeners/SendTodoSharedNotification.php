<?php

namespace App\Domains\Notification\Listeners;

use App\Domains\Notification\Services\NotificationService;
use App\Domains\Todo\Events\TodoShared;

class SendTodoSharedNotification
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
    public function handle(TodoShared $event): void
    {
        $todo = $event->todo;
        $share = $event->share;

        // Get the user who shared the todo
        $sharedByUser = $share->sharedByUser;

        // Send notification to the user who received the share
        $this->notificationService->createNotification(
            $share->sharedWithUser,
            'todo_shared',
            [
                'message' => "{$sharedByUser->name} shared a todo with you: \"{$todo->title}\"",
                'todo_id' => $todo->id,
                'todo_title' => $todo->title,
                'shared_by' => $sharedByUser->name,
                'shared_by_id' => $sharedByUser->id,
                'permission' => $share->permission,
                'share_id' => $share->id,
            ]
        );
    }
}
