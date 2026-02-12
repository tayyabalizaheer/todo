<?php

namespace App\Domains\Blog\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'featured_image' => 'nullable|file|max:300|mimes:jpeg,jpg,png,gif,webp,svg',
            'status' => 'nullable|in:draft,published,archived',
            'published_at' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'The blog title is required.',
            'title.max' => 'The blog title cannot exceed 255 characters.',
            'content.required' => 'The blog content is required.',
            'slug.unique' => 'This slug is already taken.',
            'status.in' => 'The status must be either draft, published, or archived.',
            'published_at.date' => 'The published date must be a valid date.',
        ];
    }
}
