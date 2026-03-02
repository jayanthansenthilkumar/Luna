<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name', 255);
                $table->string('email', 255)->unique();
                $table->string('username', 100)->unique()->nullable();
                $table->string('password', 255);
                $table->enum('role', ['superAdmin', 'adminAzhagii', 'azhagiiCoordinator', 'azhagiiStudents']);
                $table->foreignId('collegeId')->nullable()->constrained('colleges')->nullOnDelete();
                $table->string('department', 50)->nullable();
                $table->string('year', 20)->nullable();
                $table->string('rollNumber', 20)->unique()->nullable();
                $table->string('azhagiiID', 20)->unique()->nullable();
                $table->string('phone', 20)->nullable();
                $table->date('dob')->nullable();
                $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
                $table->text('address')->nullable();
                $table->string('profilePhoto', 255)->nullable();
                $table->string('githubUrl', 255)->nullable();
                $table->string('linkedinUrl', 255)->nullable();
                $table->string('hackerrankUrl', 255)->nullable();
                $table->string('leetcodeUrl', 255)->nullable();
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->boolean('isLocked')->default(false);
                $table->text('bio')->nullable();
                $table->timestamp('createdAt')->useCurrent();
                $table->rememberToken();
            });
        }

        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('users');
    }
};
