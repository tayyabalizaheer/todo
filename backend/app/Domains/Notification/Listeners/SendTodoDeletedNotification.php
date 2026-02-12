<?php

namespace App\Domains\Notification\Listeners;

use App\Domains\Auth\Models\User;
use App\Domains\Notification\Services\NotificationService;
use App\Domains\Todo\Events\TodoDeleted;

class SendTodoDeletedNotification
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
    public function handle(TodoDeleted $event): void
    {
        $todo = $event->todo;
        $deletedBy = $event->deletedBy;

        // Notify all shared users (passed from the event)
        foreach ($event->sharedUserIds as $userId) {
            // Skip the user who deleted the todo
            if ($userId === $deletedBy->id) {
                continue;
            }

            $user = User::find($userId);
            if ($user) {
                $this->notificationService->createNotification(
                    $user,
                    'todo_deleted',
                    [
                        'message' => "{$deletedBy->name} deleted the shared todo: \"{$todo->title}\"",
                        'todo_title' => $todo->title,
                        'deleted_by' => $deletedBy->name,
                        'deleted_by_id' => $deletedBy->id,
                    ]
                );
            }
        }
    }
}
