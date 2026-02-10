<?php

namespace App\Repositories;

use App\Models\Todo;
use App\Models\TodoShare;
use Illuminate\Database\Eloquent\Collection;

class TodoRepository
{

    public function getUserTodos(int $userId, array $filters = []): Collection
    {
        $query = Todo::where('owner_id', $userId);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getUserTodosIncludingShared(int $userId, array $filters = []): Collection
    {
        // Get owned todos
        $ownedTodosQuery = Todo::where('owner_id', $userId);

        // Get shared todos
        $sharedTodoIds = TodoShare::where('shared_with_user_id', $userId)
            ->pluck('todo_id')
            ->toArray();

        // Combine owned and shared todos with relationships
        $query = Todo::with([
            'owner:id,name,email',
            'shares' => function ($q) use ($userId) {
                $q->where('shared_with_user_id', $userId)
                  ->with('sharedByUser:id,name,email');
            }
        ])
        ->where(function ($q) use ($userId, $sharedTodoIds) {
            $q->where('owner_id', $userId)
              ->orWhereIn('id', $sharedTodoIds);
        });

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        $todos = $query->orderBy('created_at', 'desc')->get();

        // Add sharing information to each todo
        $todos->each(function ($todo) use ($userId) {
            $share = $todo->shares->first();
            
            if ($share && $todo->owner_id !== $userId) {
                $todo->is_shared = true;
                $todo->permission = $share->permission;
            } else {
                $todo->is_shared = false;
                $todo->permission = 'owner';
            }
            
            // Remove shares relationship from output to keep response clean
            unset($todo->shares);
        });

        return $todos;
    }

    public function findByIdAndUser(int $id, int $userId): ?Todo
    {
        return Todo::where('id', $id)
            ->where('owner_id', $userId)
            ->first();
    }

    public function create(array $data): Todo
    {
        return Todo::create($data);
    }

    public function update(Todo $todo, array $data): bool
    {
        return $todo->update($data);
    }

    public function delete(Todo $todo): bool
    {
        return $todo->delete();
    }

    public function findById(int $id): ?Todo
    {
        return Todo::find($id);
    }

    public function shareTodo(int $todoId, int $sharedWithUserId, int $sharedByUserId, string $permission = 'view'): TodoShare
    {
        return TodoShare::create([
            'todo_id' => $todoId,
            'shared_with_user_id' => $sharedWithUserId,
            'shared_by_user_id' => $sharedByUserId,
            'permission' => $permission,
        ]);
    }

    public function findExistingShare(int $todoId, int $sharedWithUserId): ?TodoShare
    {
        return TodoShare::where('todo_id', $todoId)
            ->where('shared_with_user_id', $sharedWithUserId)
            ->first();
    }

    public function getUserPermissionForTodo(int $todoId, int $userId): ?string
    {
        $todo = $this->findById($todoId);
        
        if (!$todo) {
            return null;
        }

        // Check if user is the owner
        if ($todo->owner_id === $userId) {
            return 'owner';
        }

        // Check if todo is shared with user
        $share = TodoShare::where('todo_id', $todoId)
            ->where('shared_with_user_id', $userId)
            ->first();

        return $share ? $share->permission : null;
    }

    public function findTodoWithAccess(int $id, int $userId, array $requiredPermissions = []): ?Todo
    {
        $todo = Todo::with(['owner:id,name,email', 'shares.sharedByUser:id,name,email'])->find($id);
        
        if (!$todo) {
            return null;
        }

        // Check if user is the owner
        if ($todo->owner_id === $userId) {
            return $todo;
        }

        // Check if todo is shared with user and has required permission
        $share = TodoShare::where('todo_id', $id)
            ->where('shared_with_user_id', $userId)
            ->first();

        if (!$share) {
            return null;
        }

        // If no specific permissions required, return the todo
        if (empty($requiredPermissions)) {
            return $todo;
        }

        // Check if user has required permission
        if (in_array($share->permission, $requiredPermissions)) {
            return $todo;
        }

        return null;
    }
}
