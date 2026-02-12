<?php

namespace App\Domains\Todo\Services;

use App\Domains\Auth\Models\User;
use App\Domains\Auth\Repositories\UserRepository;
use App\Domains\Todo\Events\TodoDeleted;
use App\Domains\Todo\Events\TodoShareAccepted;
use App\Domains\Todo\Events\TodoShared;
use App\Domains\Todo\Events\TodoUpdated;
use App\Domains\Todo\Models\Todo;
use App\Domains\Todo\Repositories\TodoRepository;
use Carbon\Carbon;

class TodoService
{
    protected TodoRepository $repository;

    protected UserRepository $userRepository;

    public function __construct(TodoRepository $repository, UserRepository $userRepository)
    {
        $this->repository = $repository;
        $this->userRepository = $userRepository;
    }

    public function getUserTodos(int $userId, array $filters = [])
    {
        return $this->repository->getUserTodosIncludingShared($userId, $filters);
    }

    public function getTodo(int $id, int $userId): ?Todo
    {
        // Check if user can access this todo (owner or shared with any permission)
        $todo = $this->repository->findTodoWithAccess($id, $userId);

        if (! $todo) {
            return null;
        }

        return $this->addSharingInfo($todo, $userId);
    }

    public function createTodo(array $data, int $userId): Todo
    {
        $data['owner_id'] = $userId;

        // Set default status if not provided
        if (! isset($data['status'])) {
            $data['status'] = 'open';
        }

        return $this->repository->create($data);
    }

    public function updateTodo(int $id, array $data, int $userId): ?Todo
    {
        // Check if user can edit this todo (owner, edit, or owner permission)
        $todo = $this->repository->findTodoWithAccess($id, $userId, ['edit', 'owner']);

        if (! $todo) {
            return null;
        }

        if (isset($data['status']) && $data['status'] === 'completed' && $todo->status !== 'completed') {
            $data['completed_at'] = Carbon::now();
        }

        if (isset($data['status']) && $data['status'] === 'open' && $todo->status === 'completed') {
            $data['completed_at'] = null;
        }

        // Get all shared user IDs (who have accepted) before updating
        $sharedUserIds = $todo->shares()
            ->whereNotNull('accepted_at')
            ->pluck('shared_with_user_id')
            ->toArray();

        $this->repository->update($todo, $data);

        // Fire TodoUpdated event for shared todos
        $updatedBy = User::find($userId);
        event(new TodoUpdated($todo->fresh(), $updatedBy, $sharedUserIds));

        return $this->addSharingInfo($todo->fresh(), $userId);
    }

    public function deleteTodo(int $id, int $userId): bool
    {
        // Only owner can delete a todo
        $todo = $this->repository->findTodoWithAccess($id, $userId, ['owner']);

        if (! $todo) {
            return false;
        }

        // Get all shared user IDs before deleting
        $sharedUserIds = $todo->shares()->pluck('shared_with_user_id')->toArray();

        // Fire TodoDeleted event
        $deletedBy = User::find($userId);
        event(new TodoDeleted($todo, $deletedBy, $sharedUserIds));

        return $this->repository->delete($todo);
    }

    public function markAsCompleted(int $id, int $userId): ?Todo
    {
        return $this->updateTodo($id, ['status' => 'completed'], $userId);
    }

    public function markAsOpen(int $id, int $userId): ?Todo
    {
        return $this->updateTodo($id, ['status' => 'open'], $userId);
    }

    public function shareTodo(int $todoId, string $email, int $currentUserId, string $permission = 'view'): array
    {
        // Check if the todo exists and belongs to the current user
        $todo = $this->repository->findByIdAndUser($todoId, $currentUserId);

        if (! $todo) {
            return [
                'success' => false,
                'message' => 'Todo not found or you do not have permission to share it.',
            ];
        }

        // Find the user by email
        $sharedWithUser = $this->userRepository->findByEmail($email);

        if (! $sharedWithUser) {
            return [
                'success' => false,
                'message' => 'User with this email does not exist.',
            ];
        }

        // Check if user is trying to share with themselves
        if ($sharedWithUser->id === $currentUserId) {
            return [
                'success' => false,
                'message' => 'You cannot share a todo with yourself.',
            ];
        }

        // Check if already shared
        $existingShare = $this->repository->findExistingShare($todoId, $sharedWithUser->id);

        if ($existingShare) {
            return [
                'success' => false,
                'message' => 'This todo is already shared with this user.',
            ];
        }

        // Create the share
        $share = $this->repository->shareTodo($todoId, $sharedWithUser->id, $currentUserId, $permission);

        // Fire TodoShared event
        event(new TodoShared($todo, $share));

        return [
            'success' => true,
            'message' => 'Todo shared successfully.',
            'share' => $share,
        ];
    }

    public function acceptSharedTodo(int $todoId, int $userId): array
    {
        // Find the share
        $share = $this->repository->findExistingShare($todoId, $userId);

        if (! $share) {
            return [
                'success' => false,
                'message' => 'This todo is not shared with you.',
            ];
        }

        // Check if already accepted
        if ($share->accepted_at !== null) {
            return [
                'success' => false,
                'message' => 'This todo has already been accepted.',
            ];
        }

        // Accept the share
        $this->repository->acceptShare($share);

        // Fire TodoShareAccepted event
        $todo = $share->todo;
        event(new TodoShareAccepted($todo, $share->fresh()));

        return [
            'success' => true,
            'message' => 'Todo accepted successfully.',
            'share' => $share->fresh(),
        ];
    }

    /**
     * Add sharing information to a todo (owner, is_shared, permission)
     */
    private function addSharingInfo(Todo $todo, int $userId): Todo
    {
        // Check if this is a shared todo
        $share = $todo->shares->where('shared_with_user_id', $userId)->first();

        if ($share && $todo->owner_id !== $userId) {
            $todo->is_shared = true;
            $todo->permission = $share->permission;
        } else {
            $todo->is_shared = false;
            $todo->permission = 'owner';
        }

        // Remove shares relationship from output to keep response clean
        unset($todo->shares);

        return $todo;
    }
}
