<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('subjects')) {
            Schema::create('subjects', function (Blueprint $table) {
                $table->id();
                $table->foreignId('courseId')->constrained('courses')->cascadeOnDelete();
                $table->string('title', 255);
                $table->string('code', 50)->nullable();
                $table->text('description')->nullable();
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamp('createdAt')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
