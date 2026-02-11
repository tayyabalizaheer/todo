<?php

use App\Domains\Todo\Http\Controllers\TodoController;
use Illuminate\Support\Facades\Route;

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Todo CRUD routes
    Route::apiResource('todos', TodoController::class);
    // Additional routes for marking as completed and reopening
    Route::post('/todos/{id}/complete', [TodoController::class, 'complete']);
    Route::post('/todos/{id}/reopen', [TodoController::class, 'reopen']);
    Route::post('/todos/{id}/share', [TodoController::class, 'share']);
    Route::post('/todos/{id}/accept', [TodoController::class, 'accept']);
});
