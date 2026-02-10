<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Todo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'title',
        'description',
        'due_at',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function shares()
    {
        return $this->hasMany(TodoShare::class);
    }

    public function sharedWith()
    {
        return $this->belongsToMany(User::class, 'todo_shares', 'todo_id', 'shared_with_user_id')
            ->withPivot('permission', 'accepted_at', 'shared_by_user_id')
            ->withTimestamps();
    }
}
