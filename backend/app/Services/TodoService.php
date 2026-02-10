<?php

namespace App\Services;

use App\Repositories\TodoRepository;
use App\Models\Todo;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class TodoService
{
    protected TodoRepository $repository;

    public function __construct(TodoRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getUserTodos(int $userId, array $filters = []): Collection
    {
        return $this->repository->getUserTodos($userId, $filters);
    }

    public function getTodo(int $id, int $userId): ?Todo
    {
        return $this->repository->findByIdAndUser($id, $userId);
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
        $todo = $this->repository->findByIdAndUser($id, $userId);

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
        $todo = $this->repository->findByIdAndUser($id, $userId);

        if (!$todo) {
            return false;
        }

        return $this->repository->delete($todo);
    }

    
}
