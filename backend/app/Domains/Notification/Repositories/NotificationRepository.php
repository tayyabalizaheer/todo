<?php

namespace App\Domains\Notification\Repositories;

use App\Domains\Auth\Models\User;
use App\Domains\Notification\Models\Notification;

class NotificationRepository
{
    /**
     * Create a notification
     */
    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    /**
     * Get paginated notifications for a user
     */
    public function getUserNotifications(int $userId, bool $unreadOnly = false, int $perPage = 15)
    {
        $query = Notification::where('notifiable_type', User::class)
            ->where('notifiable_id', $userId)
            ->orderBy('created_at', 'desc');

        if ($unreadOnly) {
            $query->unread();
        }

        return $query->paginate($perPage);
    }

    /**
     * Find notification by ID and user
     */
    public function findByIdAndUser(string $notificationId, int $userId): ?Notification
    {
        return Notification::where('id', $notificationId)
            ->where('notifiable_id', $userId)
            ->first();
    }

    /**
     * Update notification
     */
    public function update(Notification $notification, array $data): bool
    {
        return $notification->update($data);
    }

    /**
     * Mark all unread notifications as read for a user
     */
    public function markAllAsRead(int $userId): int
    {
        return Notification::where('notifiable_type', User::class)
            ->where('notifiable_id', $userId)
            ->unread()
            ->update(['read_at' => now()]);
    }

    /**
     * Delete notification
     */
    public function delete(Notification $notification): bool
    {
        return $notification->delete();
    }

    /**
     * Get unread notification count
     */
    public function getUnreadCount(int $userId): int
    {
        return Notification::where('notifiable_type', User::class)
            ->where('notifiable_id', $userId)
            ->unread()
            ->count();
    }
}
