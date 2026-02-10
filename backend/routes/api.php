<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // User search route while sharing todos
    Route::get('/users/search', [UserController::class, 'search']);
    
    // Todo CRUD routes
    Route::apiResource('todos', TodoController::class);
    // Additional routes for marking as completed and reopening
    Route::post('/todos/{id}/complete', [TodoController::class, 'complete']);
    Route::post('/todos/{id}/reopen', [TodoController::class, 'reopen']);
    Route::post('/todos/{id}/share', [TodoController::class, 'share']);
});
