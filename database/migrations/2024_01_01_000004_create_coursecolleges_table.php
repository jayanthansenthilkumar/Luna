<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('coursecolleges')) {
            Schema::create('coursecolleges', function (Blueprint $table) {
                $table->id();
                $table->foreignId('courseId')->constrained('courses')->cascadeOnDelete();
                $table->foreignId('collegeId')->constrained('colleges')->cascadeOnDelete();
                $table->foreignId('assignedBy')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('assignedAt')->useCurrent();
                $table->unique(['courseId', 'collegeId']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('coursecolleges');
    }
};
