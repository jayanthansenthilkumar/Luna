<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('topics')) {
            Schema::create('topics', function (Blueprint $table) {
                $table->id();
                $table->foreignId('subjectId')->constrained('subjects')->cascadeOnDelete();
                $table->string('title', 255);
                $table->text('description')->nullable();
                $table->foreignId('createdBy')->nullable()->constrained('users')->nullOnDelete();
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamp('createdAt')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('topics');
    }
};
