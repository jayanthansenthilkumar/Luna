<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('enrollments')) {
            Schema::create('enrollments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('studentId')->constrained('users')->cascadeOnDelete();
                $table->foreignId('courseId')->constrained('courses')->cascadeOnDelete();
                $table->integer('progress')->default(0);
                $table->enum('status', ['active', 'completed', 'dropped', 'enrolled'])->default('active');
                $table->json('completed_topics')->nullable();
                $table->timestamp('enrolledAt')->useCurrent();
                $table->timestamp('completedAt')->nullable();
                $table->unique(['studentId', 'courseId']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
