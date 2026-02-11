<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Requests\ShareTodoRequest;
use App\Http\Resources\TodoResource;
use App\Services\TodoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    protected TodoService $todoService;

    public function __construct(TodoService $todoService)
    {
        $this->todoService = $todoService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search', 'per_page']);
        $todos = $this->todoService->getUserTodos($request->user()->id, $filters);

        return response()->json([
            'success' => true,
            'data' => TodoResource::collection($todos->items()),
            'pagination' => [
                'current_page' => $todos->currentPage(),
                'per_page' => $todos->perPage(),
                'total' => $todos->total(),
                'last_page' => $todos->lastPage(),
                'from' => $todos->firstItem(),
                'to' => $todos->lastItem(),
            ],
        ]);
    }

    public function store(StoreTodoRequest $request): JsonResponse
    {
        $todo = $this->todoService->createTodo(
            $request->validated(),
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Todo created successfully',
            'data' => $todo,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $todo = $this->todoService->getTodo($id, $request->user()->id);

        if (!$todo) {
            return response()->json([
                'success' => false,
                'message' => 'Todo not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Todo retrieved successfully',
            'data' => $todo,
        ]);
    }

    public function update(UpdateTodoRequest $request, int $id): JsonResponse
    {
        $todo = $this->todoService->updateTodo(
            $id,
            $request->validated(),
            $request->user()->id
        );

        if (!$todo) {
            return response()->json([
                'success' => false,
                'message' => 'Todo not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Todo updated successfully',
            'data' => $todo,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->todoService->deleteTodo($id, $request->user()->id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Todo not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Todo deleted successfully',
        ]);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $todo = $this->todoService->markAsCompleted($id, $request->user()->id);

        if (!$todo) {
            return response()->json([
                'success' => false,
                'message' => 'Todo not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Todo marked as completed',
            'data' => $todo,
        ]);
    }

    public function reopen(Request $request, int $id): JsonResponse
    {
        $todo = $this->todoService->markAsOpen($id, $request->user()->id);

        if (!$todo) {
            return response()->json([
                'success' => false,
                'message' => 'Todo not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Todo reopened',
            'data' => $todo,
        ]);
    }

    public function share(ShareTodoRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();
        $permission = $validated['permission'] ?? 'view';
        $emails = $validated['emails'];

        $results = [];
        $errors = [];
        
        foreach ($emails as $email) {
            $result = $this->todoService->shareTodo(
                $id,
                $email,
                $request->user()->id,
                $permission
            );

            if ($result['success']) {
                $results[] = $result['share'];
            } else {
                $errors[] = [
                    'email' => $email,
                    'message' => $result['message']
                ];
            }
        }

        // If all failed, return error
        if (empty($results)) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to share with any users',
                'errors' => $errors,
            ], 400);
        }

        // If some succeeded, return success with details
        $message = count($emails) === 1 
            ? 'Todo shared successfully'
            : sprintf('Todo shared with %d out of %d users', count($results), count($emails));

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $results,
            'errors' => !empty($errors) ? $errors : null,
        ], 201);
    }

    public function accept(Request $request, int $id): JsonResponse
    {
        $result = $this->todoService->acceptSharedTodo($id, $request->user()->id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => $result['share'],
        ]);
    }
}
