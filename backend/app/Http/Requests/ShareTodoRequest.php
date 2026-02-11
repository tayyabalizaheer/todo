<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShareTodoRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'emails' => 'required|array|min:1',
            'emails.*' => 'email|exists:users,email',
            'permission' => 'nullable|in:view,edit,owner',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'emails.required' => 'At least one email is required',
            'emails.array' => 'Emails must be an array',
            'emails.min' => 'At least one email is required',
            'emails.*.email' => 'All emails must be valid email addresses',
            'emails.*.exists' => 'One or more users with these emails do not exist',
            'permission.in' => 'Permission must be either view, edit, or owner',
        ];
    }
}
