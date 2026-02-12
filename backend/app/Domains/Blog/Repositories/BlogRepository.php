<?php

namespace App\Domains\Blog\Repositories;

use App\Domains\Blog\Models\Blog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BlogRepository
{
    public function getAllBlogs(array $filters = []): LengthAwarePaginator
    {
        $query = Blog::with('author:id,name,email');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['author_id'])) {
            $query->where('author_id', $filters['author_id']);
        }

        if (isset($filters['search'])) {
            $query->search($filters['search']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getPublishedBlogs(array $filters = []): LengthAwarePaginator
    {
        $query = Blog::with('author:id,name')->published();

        if (isset($filters['search'])) {
            $query->search($filters['search']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('published_at', 'desc')
            ->paginate($perPage);
    }

    public function getBlogsByAuthor(int $authorId, array $filters = []): LengthAwarePaginator
    {
        $query = Blog::with('author:id,name,email')
            ->where('author_id', $authorId);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $query->search($filters['search']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Blog
    {
        return Blog::with('author:id,name,email')->find($id);
    }

    public function findBySlug(string $slug): ?Blog
    {
        return Blog::with('author:id,name')
            ->where('slug', $slug)
            ->first();
    }

    public function findByIdAndAuthor(int $id, int $authorId): ?Blog
    {
        return Blog::with('author:id,name,email')
            ->where('id', $id)
            ->where('author_id', $authorId)
            ->first();
    }

    public function create(array $data): Blog
    {
        return Blog::create($data);
    }

    public function update(Blog $blog, array $data): Blog
    {
        $blog->update($data);
        $blog->refresh();

        return $blog;
    }

    public function delete(Blog $blog): bool
    {
        return $blog->delete();
    }

    public function slugExists(string $slug, ?int $exceptId = null): bool
    {
        $query = Blog::where('slug', $slug);

        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->exists();
    }

    public function incrementViews(Blog $blog): void
    {
        $blog->incrementViews();
    }
}
