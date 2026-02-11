<?php

namespace App\Domains\Todo\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTodoRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_at' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:open,completed'],
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
            'status.in' => 'The status must be either open or completed.',
        ];
    }
}
