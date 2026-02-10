<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('todo_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('todo_id')->constrained('todos')->onDelete('cascade');
            $table->foreignId('shared_with_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('shared_by_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('permission', ['view', 'edit', 'owner'])->default('view');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->unique(['todo_id', 'shared_with_user_id']);
            $table->index('shared_with_user_id');
            $table->index('shared_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('todo_shares');
    }
};
