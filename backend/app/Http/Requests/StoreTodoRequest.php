<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTodoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_at' => ['nullable', 'date', 'after_or_equal:today'],
            'status' => ['nullable', 'in:open,completed'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The todo title is required.',
            'title.max' => 'The todo title must not exceed 255 characters.',
            'due_at.date' => 'The due date must be a valid date.',
            'due_at.after_or_equal' => 'The due date must be today or a future date.',
            'status.in' => 'The status must be either open or completed.',
        ];
    }
}
