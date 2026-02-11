<?php

namespace App\Domains\Auth\Repositories;

use App\Domains\Auth\Models\User;

class UserRepository
{
    /**
     * Create a new user
     */
    public function create(array $data): User
    {
        return User::create($data);
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Find user by id
     */
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    /**
     * Search users by email (live search)
     */
    public function searchByEmail(string $searchTerm, int $limit = 10, ?int $excludeUserId = null): array
    {
        $query = User::where('email', 'like', '%' . $searchTerm . '%');
        
        if ($excludeUserId !== null) {
            $query->where('id', '!=', $excludeUserId);
        }
        
        return $query->select('name', 'email')
            ->limit($limit)
            ->get()
            ->all();
    }
}
