<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('courses')) {
            Schema::create('courses', function (Blueprint $table) {
                $table->id();
                $table->string('title', 255);
                $table->string('courseCode', 50)->unique()->nullable();
                $table->text('description')->nullable();
                $table->string('category', 100)->nullable();
                $table->string('courseType', 50)->nullable();
                $table->string('thumbnail', 500)->nullable();
                $table->string('syllabus', 500)->nullable();
                $table->string('semester', 20)->nullable();
                $table->string('regulation', 50)->nullable();
                $table->string('academicYear', 20)->nullable();
                $table->foreignId('createdBy')->nullable()->constrained('users')->nullOnDelete();
                $table->enum('status', ['draft', 'pending', 'active', 'rejected', 'archived'])->default('draft');
                $table->foreignId('approvedBy')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approvedAt')->nullable();
                $table->text('rejectionReason')->nullable();
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
