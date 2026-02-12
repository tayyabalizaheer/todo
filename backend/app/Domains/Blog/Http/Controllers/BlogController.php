<?php

namespace App\Domains\Blog\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Blog\Http\Requests\StoreBlogRequest;
use App\Domains\Blog\Http\Requests\UpdateBlogRequest;
use App\Domains\Blog\Http\Resources\BlogResource;
use App\Domains\Blog\Http\Resources\PublicBlogResource;
use App\Domains\Blog\Services\BlogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    protected BlogService $blogService;

    public function __construct(BlogService $blogService)
    {
        $this->blogService = $blogService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search', 'per_page']);
        
        if ($request->user()) {
            $blogs = $this->blogService->getBlogsByAuthor($request->user()->id, $filters);
            return response()->json([
                'success' => true,
                'data' => BlogResource::collection($blogs->items()),
                'pagination' => [
                    'current_page' => $blogs->currentPage(),
                    'per_page' => $blogs->perPage(),
                    'total' => $blogs->total(),
                    'last_page' => $blogs->lastPage(),
                    'from' => $blogs->firstItem(),
                    'to' => $blogs->lastItem(),
                ],
            ]);
        } else {
            $blogs = $this->blogService->getPublishedBlogs($filters);
            return response()->json([
                'success' => true,
                'data' => PublicBlogResource::collection($blogs->items()),
                'pagination' => [
                    'current_page' => $blogs->currentPage(),
                    'per_page' => $blogs->perPage(),
                    'total' => $blogs->total(),
                    'last_page' => $blogs->lastPage(),
                    'from' => $blogs->firstItem(),
                    'to' => $blogs->lastItem(),
                ],
            ]);
        }
    }

    public function store(StoreBlogRequest $request): JsonResponse
    {
        $blog = $this->blogService->createBlog(
            $request->validated(),
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Blog created successfully',
            'data' => new BlogResource($blog),
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $blog = is_numeric($id) 
            ? $this->blogService->getBlogById((int) $id)
            : $this->blogService->getBlogBySlug($id);

        if (!$blog) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found',
            ], 404);
        }

        if ($blog->status !== 'published' && (!$request->user() || $request->user()->id !== $blog->author_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found',
            ], 404);
        }

        $resource = ($blog->status === 'published' && (!$request->user() || $request->user()->id !== $blog->author_id))
            ? new PublicBlogResource($blog)
            : new BlogResource($blog);

        return response()->json([
            'success' => true,
            'message' => 'Blog retrieved successfully',
            'data' => $resource,
        ]);
    }

    public function update(UpdateBlogRequest $request, int $id): JsonResponse
    {
        $blog = $this->blogService->updateBlog(
            $id,
            $request->validated(),
            $request->user()->id
        );

        if (!$blog) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found or you do not have permission to update it',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog updated successfully',
            'data' => new BlogResource($blog),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->blogService->deleteBlog($id, $request->user()->id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found or you do not have permission to delete it',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog deleted successfully',
        ]);
    }

    public function publish(Request $request, int $id): JsonResponse
    {
        $blog = $this->blogService->publishBlog($id, $request->user()->id);

        if (!$blog) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found or you do not have permission to publish it',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog published successfully',
            'data' => new BlogResource($blog),
        ]);
    }

    public function unpublish(Request $request, int $id): JsonResponse
    {
        $blog = $this->blogService->unpublishBlog($id, $request->user()->id);

        if (!$blog) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found or you do not have permission to unpublish it',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog unpublished successfully',
            'data' => new BlogResource($blog),
        ]);
    }

    public function archive(Request $request, int $id): JsonResponse
    {
        $blog = $this->blogService->archiveBlog($id, $request->user()->id);

        if (!$blog) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found or you do not have permission to archive it',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog archived successfully',
            'data' => new BlogResource($blog),
        ]);
    }

    public function posts(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page']);
        $blogs = $this->blogService->getPublishedBlogs($filters);

        return response()->json([
            'success' => true,
            'data' => PublicBlogResource::collection($blogs->items()),
            'pagination' => [
                'current_page' => $blogs->currentPage(),
                'per_page' => $blogs->perPage(),
                'total' => $blogs->total(),
                'last_page' => $blogs->lastPage(),
                'from' => $blogs->firstItem(),
                'to' => $blogs->lastItem(),
            ],
        ]);
    }

    public function post(Request $request, string $slug): JsonResponse
    {
        $blog = $this->blogService->getBlogBySlug($slug);

        if (!$blog) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new PublicBlogResource($blog),
        ]);
    }
}
