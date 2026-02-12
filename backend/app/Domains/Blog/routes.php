<?php

use App\Domains\Blog\Http\Controllers\BlogController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/posts', [BlogController::class, 'posts']);
Route::get('/post/{slug}', [BlogController::class, 'post']);

// Protected routes (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Blog API Resource routes
    Route::apiResource('blogs', BlogController::class);

    // Additional blog management routes
    Route::post('/blogs/{id}/publish', [BlogController::class, 'publish']);
    Route::post('/blogs/{id}/unpublish', [BlogController::class, 'unpublish']);
    Route::post('/blogs/{id}/archive', [BlogController::class, 'archive']);
});
