<?php

namespace App\Domains\Blog\Services;

use App\Domains\Blog\Models\Blog;
use App\Domains\Blog\Repositories\BlogRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Mews\Purifier\Facades\Purifier;

class BlogService
{
    protected BlogRepository $repository;

    public function __construct(BlogRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllBlogs(array $filters = [])
    {
        return $this->repository->getAllBlogs($filters);
    }

    public function getPublishedBlogs(array $filters = [])
    {
        return $this->repository->getPublishedBlogs($filters);
    }

    public function getBlogsByAuthor(int $authorId, array $filters = [])
    {
        return $this->repository->getBlogsByAuthor($authorId, $filters);
    }

    public function getBlogById(int $id): ?Blog
    {
        return $this->repository->findById($id);
    }

    public function getBlogBySlug(string $slug): ?Blog
    {
        $blog = $this->repository->findBySlug($slug);

        if ($blog && $blog->isPublished()) {
            $this->repository->incrementViews($blog);
        }

        return $blog;
    }

    public function getBlogByIdAndAuthor(int $id, int $authorId): ?Blog
    {
        return $this->repository->findByIdAndAuthor($id, $authorId);
    }

    public function createBlog(array $data, int $authorId): Blog
    {
        $data['author_id'] = $authorId;

        if (isset($data['content'])) {
            $data['content'] = Purifier::clean($data['content']);
        }

        if (isset($data['featured_image']) && $data['featured_image'] instanceof \Illuminate\Http\UploadedFile) {
            $file = $data['featured_image'];
            $extension = $file->getClientOriginalExtension();
            $randomName = Str::random(40) . '.' . $extension;
            $file->storeAs('blogs/featured-images', $randomName, 'public');
            $data['featured_image'] = $randomName;
        }

        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['title']);
        } else {
            $data['slug'] = Str::slug($data['slug']);
            if ($this->repository->slugExists($data['slug'])) {
                $data['slug'] = $this->generateUniqueSlug($data['slug']);
            }
        }

        if (! isset($data['status'])) {
            $data['status'] = 'draft';
        }

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = Carbon::now();
        }

        if (empty($data['excerpt']) && ! empty($data['content'])) {
            $data['excerpt'] = Str::limit(strip_tags($data['content']), 200);
        }

        return $this->repository->create($data);
    }

    public function updateBlog(int $id, array $data, int $authorId): ?Blog
    {
        $blog = $this->repository->findByIdAndAuthor($id, $authorId);

        if (! $blog) {
            return null;
        }

        if (isset($data['content'])) {
            $data['content'] = Purifier::clean($data['content']);
        }

        if (isset($data['featured_image']) && $data['featured_image'] instanceof \Illuminate\Http\UploadedFile) {
            if ($blog->featured_image && Storage::disk('public')->exists('blogs/featured-images/' . $blog->featured_image)) {
                Storage::disk('public')->delete('blogs/featured-images/' . $blog->featured_image);
            }
            $file = $data['featured_image'];
            $extension = $file->getClientOriginalExtension();
            $randomName = Str::random(40) . '.' . $extension;
            $file->storeAs('blogs/featured-images', $randomName, 'public');
            $data['featured_image'] = $randomName;
        }

        if (isset($data['slug'])) {
            $data['slug'] = Str::slug($data['slug']);
            if ($this->repository->slugExists($data['slug'], $blog->id)) {
                $data['slug'] = $this->generateUniqueSlug($data['slug'], $blog->id);
            }
        } elseif (isset($data['title']) && $blog->isDirty('title')) {
            $data['slug'] = $this->generateUniqueSlug($data['title'], $blog->id);
        }

        if (isset($data['status']) && $data['status'] === 'published' && $blog->status !== 'published') {
            $data['published_at'] = $data['published_at'] ?? Carbon::now();
        }

        if (isset($data['content']) && empty($data['excerpt'])) {
            $data['excerpt'] = Str::limit(strip_tags($data['content']), 200);
        }

        return $this->repository->update($blog, $data);
    }

    public function deleteBlog(int $id, int $authorId): bool
    {
        $blog = $this->repository->findByIdAndAuthor($id, $authorId);

        if (! $blog) {
            return false;
        }

        if ($blog->featured_image && Storage::disk('public')->exists('blogs/featured-images/' . $blog->featured_image)) {
            Storage::disk('public')->delete('blogs/featured-images/' . $blog->featured_image);
        }

        return $this->repository->delete($blog);
    }

    public function publishBlog(int $id, int $authorId): ?Blog
    {
        $blog = $this->repository->findByIdAndAuthor($id, $authorId);

        if (! $blog) {
            return null;
        }

        return $this->repository->update($blog, [
            'status' => 'published',
            'published_at' => Carbon::now(),
        ]);
    }

    public function unpublishBlog(int $id, int $authorId): ?Blog
    {
        $blog = $this->repository->findByIdAndAuthor($id, $authorId);

        if (! $blog) {
            return null;
        }

        return $this->repository->update($blog, [
            'status' => 'draft',
        ]);
    }

    public function archiveBlog(int $id, int $authorId): ?Blog
    {
        $blog = $this->repository->findByIdAndAuthor($id, $authorId);

        if (! $blog) {
            return null;
        }

        return $this->repository->update($blog, [
            'status' => 'archived',
        ]);
    }

    protected function generateUniqueSlug(string $title, ?int $exceptId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while ($this->repository->slugExists($slug, $exceptId)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
