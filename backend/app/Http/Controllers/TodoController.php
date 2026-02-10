<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Requests\ShareTodoRequest;
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
        $filters = $request->only(['status', 'search']);
        $todos = $this->todoService->getUserTodos($request->user()->id, $filters);

        return response()->json([
            'success' => true,
            'data' => $todos,
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
        $result = $this->todoService->shareTodo(
            $id,
            $request->validated()['email'],
            $request->user()->id,
            $request->validated()['permission'] ?? 'view'
        );

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
