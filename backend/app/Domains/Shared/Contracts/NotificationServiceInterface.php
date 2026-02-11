<?php

namespace App\Domains\Shared\Contracts;

use App\Domains\Auth\Models\User;
use App\Domains\Notification\Models\Notification;

interface NotificationServiceInterface
{
    /**
     * Create a notification for a user
     */
    public function createNotification(User $user, string $type, array $data): Notification;

    /**
     * Get all notifications for a user
     */
    public function getUserNotifications(int $userId, bool $unreadOnly = false, int $perPage = 15);

    /**
     * Mark notification as read
     */
    public function markAsRead(string $notificationId, int $userId): bool;

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(int $userId): int;

    /**
     * Get unread notification count
     */
    public function getUnreadCount(int $userId): int;
}
