<?php

namespace App\Listeners;

use App\Events\TodoUpdated;
use App\Services\NotificationService;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendTodoUpdatedNotification implements ShouldQueue
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
    public function handle(TodoUpdated $event): void
    {
        $todo = $event->todo;
        $updatedBy = $event->updatedBy;
        
        // Notify the owner if they didn't make the update
        if ($todo->owner_id !== $updatedBy->id) {
            $this->notificationService->createNotification(
                $todo->owner,
                'todo_updated',
                [
                    'message' => "{$updatedBy->name} updated the shared todo: \"{$todo->title}\"",
                    'todo_id' => $todo->id,
                    'todo_title' => $todo->title,
                    'updated_by' => $updatedBy->name,
                    'updated_by_id' => $updatedBy->id,
                ]
            );
        }
        
        // Notify all shared users (passed from the event) except the one who made the update
        foreach ($event->sharedUserIds as $userId) {
            // Skip the user who updated the todo
            if ($userId === $updatedBy->id) {
                continue;
            }
            
            $user = User::find($userId);
            if ($user) {
                $this->notificationService->createNotification(
                    $user,
                    'todo_updated',
                    [
                        'message' => "{$updatedBy->name} updated the shared todo: \"{$todo->title}\"",
                        'todo_id' => $todo->id,
                        'todo_title' => $todo->title,
                        'updated_by' => $updatedBy->name,
                        'updated_by_id' => $updatedBy->id,
                    ]
                );
            }
        }
    }
}
