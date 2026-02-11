<?php

namespace App\Domains\Todo\Models;

use App\Domains\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TodoShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'todo_id',
        'shared_with_user_id',
        'shared_by_user_id',
        'permission',
        'accepted_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function todo()
    {
        return $this->belongsTo(Todo::class);
    }

    public function sharedWithUser()
    {
        return $this->belongsTo(User::class, 'shared_with_user_id');
    }

    public function sharedByUser()
    {
        return $this->belongsTo(User::class, 'shared_by_user_id');
    }
}
