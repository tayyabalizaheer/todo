<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Domains\Auth\Http\Resources\UserSearchResource;
use App\Domains\Auth\Services\UserService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|min:2|max:255',
            'limit' => 'sometimes|integer|min:1|max:100',
        ]);

        $users = $this->userService->searchUsers(
            $request->query('email'),
            $request->query('limit', 10),
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'data' => UserSearchResource::collection(collect($users)),
        ]);
    }
}
