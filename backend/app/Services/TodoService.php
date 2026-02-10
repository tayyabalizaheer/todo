<?php

namespace App\Services;

use App\Repositories\TodoRepository;
use App\Repositories\UserRepository;
use App\Models\Todo;
use App\Models\TodoShare;
use Illuminate\Database\Eloquent\Collection;
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

    public function getUserTodos(int $userId, array $filters = []): Collection
    {
        return $this->repository->getUserTodosIncludingShared($userId, $filters);
    }

    public function getTodo(int $id, int $userId): ?Todo
    {
        // Check if user can access this todo (owner or shared with any permission)
        return $this->repository->findTodoWithAccess($id, $userId);
    }

    public function createTodo(array $data, int $userId): Todo
    {
        $data['owner_id'] = $userId;
        
        // Set default status if not provided
        if (!isset($data['status'])) {
            $data['status'] = 'open';
        }

        return $this->repository->create($data);
    }

    public function updateTodo(int $id, array $data, int $userId): ?Todo
    {
        // Check if user can edit this todo (owner, edit, or owner permission)
        $todo = $this->repository->findTodoWithAccess($id, $userId, ['edit', 'owner']);

        if (!$todo) {
            return null;
        }

        if (isset($data['status']) && $data['status'] === 'completed' && $todo->status !== 'completed') {
            $data['completed_at'] = Carbon::now();
        }

        if (isset($data['status']) && $data['status'] === 'open' && $todo->status === 'completed') {
            $data['completed_at'] = null;
        }

        $this->repository->update($todo, $data);

        return $todo->fresh();
    }

 
    public function deleteTodo(int $id, int $userId): bool
    {
        // Only owner can delete a todo
        $todo = $this->repository->findTodoWithAccess($id, $userId, ['owner']);

        if (!$todo) {
            return false;
        }

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

        if (!$todo) {
            return [
                'success' => false,
                'message' => 'Todo not found or you do not have permission to share it.',
            ];
        }

        // Find the user by email
        $sharedWithUser = $this->userRepository->findByEmail($email);

        if (!$sharedWithUser) {
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

        if (!$share) {
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

        return [
            'success' => true,
            'message' => 'Todo accepted successfully.',
            'share' => $share->fresh(),
        ];
    }
    
}
