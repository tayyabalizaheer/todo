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
}
