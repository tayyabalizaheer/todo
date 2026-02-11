<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(Request $request): JsonResponse
    {
        $unreadOnly = $request->query('unread_only', false);
        $perPage = $request->query('per_page', 15);
        
        $notifications = $this->notificationService->getUserNotifications(
            $request->user()->id,
            filter_var($unreadOnly, FILTER_VALIDATE_BOOLEAN),
            (int) $perPage
        );

        $unreadCount = $this->notificationService->getUnreadCount($request->user()->id);

        return response()->json([
            'success' => true,
            'notifications' => NotificationResource::collection($notifications->items()),
            'unread_count' => $unreadCount,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
                'from' => $notifications->firstItem(),
                'to' => $notifications->lastItem(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $this->notificationService->getNotificationById($id, $request->user()->id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found.',
            ], 404);
        }

        // Authorize access
        $this->authorize('update', $notification);

        $result = $this->notificationService->markAsRead($id, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead($request->user()->id);

        return response()->json([
            'success' => true,
            'message' => "{$count} notification(s) marked as read.",
            'count' => $count,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $notification = $this->notificationService->getNotificationById($id, $request->user()->id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found.',
            ], 404);
        }

        // Authorize access
        $this->authorize('delete', $notification);

        $result = $this->notificationService->deleteNotification($id, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted.',
        ]);
    }
}
