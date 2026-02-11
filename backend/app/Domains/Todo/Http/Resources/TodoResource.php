<?php

namespace App\Domains\Todo\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TodoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'due_at' => $this->due_at,
            'completed_at' => $this->completed_at,
            'owner_id' => $this->owner_id,
            'owner' => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
                'email' => $this->owner->email,
            ],
            'is_shared' => $this->is_shared ?? false,
            'permission' => $this->permission ?? 'owner',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
