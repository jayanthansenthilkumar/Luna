<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('coursecontent')) {
            Schema::create('coursecontent', function (Blueprint $table) {
                $table->id();
                $table->foreignId('courseId')->constrained('courses')->cascadeOnDelete();
                $table->string('title', 255);
                $table->text('description')->nullable();
                $table->enum('contentType', ['video', 'pdf', 'text', 'link']);
                $table->text('contentData')->nullable();
                $table->foreignId('uploadedBy')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('collegeId')->nullable()->constrained('colleges')->nullOnDelete();
                $table->integer('sortOrder')->default(0);
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamp('createdAt')->useCurrent();
                $table->foreignId('subjectId')->nullable()->constrained('subjects')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('coursecontent');
    }
};
