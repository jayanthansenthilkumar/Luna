<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('profilerequests')) {
            Schema::create('profilerequests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('userId')->constrained('users')->cascadeOnDelete();
                $table->text('requestReason')->nullable();
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('resolvedAt')->nullable();
                $table->foreignId('resolvedBy')->nullable()->constrained('users')->nullOnDelete();
            });
        }

        if (!Schema::hasTable('events')) {
            Schema::create('events', function (Blueprint $table) {
                $table->id();
                $table->string('title', 255);
                $table->text('description')->nullable();
                $table->date('eventDate');
                $table->time('eventTime')->nullable();
                $table->string('location', 255);
                $table->string('organizer', 100);
                $table->string('category', 50)->nullable();
                $table->decimal('price', 10, 2)->default(0);
                $table->integer('capacity')->default(100);
                $table->string('imageUrl', 255)->nullable();
                $table->enum('status', ['upcoming', 'completed', 'cancelled'])->default('upcoming');
                $table->timestamp('createdAt')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
        Schema::dropIfExists('profilerequests');
    }
};
