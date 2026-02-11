<?php

namespace App\Domains\Notification\Services;

use App\Domains\Auth\Models\User;
use App\Domains\Notification\Models\Notification;
use App\Domains\Notification\Repositories\NotificationRepository;
use App\Domains\Shared\Contracts\NotificationServiceInterface;

class NotificationService implements NotificationServiceInterface
{
    protected NotificationRepository $repository;

    public function __construct(NotificationRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Create a notification for a user
     */
    public function createNotification(User $user, string $type, array $data): Notification
    {
        return $this->repository->create([
            'type' => $type,
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => $data,
            'read_at' => null,
        ]);
    }

    /**
     * Get all notifications for a user
     */
    public function getUserNotifications(int $userId, bool $unreadOnly = false, int $perPage = 15)
    {
        return $this->repository->getUserNotifications($userId, $unreadOnly, $perPage);
    }

    /**
     * Get a notification by ID for a specific user
     */
    public function getNotificationById(string $notificationId, int $userId): ?Notification
    {
        return $this->repository->findByIdAndUser($notificationId, $userId);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(string $notificationId, int $userId): bool
    {
        $notification = $this->repository->findByIdAndUser($notificationId, $userId);

        if (!$notification) {
            return false;
        }

        $notification->markAsRead();
        return true;
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(int $userId): int
    {
        return $this->repository->markAllAsRead($userId);
    }

    /**
     * Delete a notification
     */
    public function deleteNotification(string $notificationId, int $userId): bool
    {
        $notification = $this->repository->findByIdAndUser($notificationId, $userId);

        if (!$notification) {
            return false;
        }

        return $this->repository->delete($notification);
    }

    /**
     * Get unread notification count
     */
    public function getUnreadCount(int $userId): int
    {
        return $this->repository->getUnreadCount($userId);
    }
}
