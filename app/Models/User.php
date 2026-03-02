<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    public $timestamps = false;

    const CREATED_AT = 'createdAt';

    protected $fillable = [
        'name', 'email', 'username', 'password', 'role', 'collegeId',
        'department', 'year', 'rollNumber', 'azhagiiID', 'phone',
        'dob', 'gender', 'address', 'profilePhoto', 'githubUrl',
        'linkedinUrl', 'hackerrankUrl', 'leetcodeUrl', 'status',
        'isLocked', 'bio',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'isLocked' => 'boolean',
            'dob' => 'date',
        ];
    }

    public function college()
    {
        return $this->belongsTo(College::class, 'collegeId');
    }

    public function createdCourses()
    {
        return $this->hasMany(Course::class, 'createdBy');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'studentId');
    }

    public function profileRequests()
    {
        return $this->hasMany(ProfileRequest::class, 'userId');
    }

    public function hasRole($roles): bool
    {
        return in_array($this->role, (array) $roles);
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['superAdmin', 'adminAzhagii']);
    }

    public function getProfileCompletionAttribute(): int
    {
        $filled = 0;
        $total = 0;

        foreach (['name', 'email', 'username', 'role'] as $p) {
            $total++;
            if (!empty($this->$p)) $filled++;
        }

        foreach (['phone', 'address'] as $p) {
            $total++;
            if (!empty($this->$p)) $filled++;
        }

        $total++;
        if (!empty($this->bio)) $filled++;

        foreach (['dob', 'gender'] as $p) {
            $total++;
            if (!empty($this->$p)) $filled++;
        }

        if ($this->role == 'azhagiiStudents') {
            foreach (['collegeId', 'department', 'year', 'rollNumber'] as $p) {
                $total++;
                if (!empty($this->$p)) $filled++;
            }
        } else {
            if (!empty($this->collegeId)) {
                $total++;
                $filled++;
            }
        }

        $total++;
        if (!empty($this->profilePhoto)) $filled++;

        return ($total > 0) ? round(($filled / $total) * 100) : 0;
    }

    public function getDashboardRouteAttribute(): string
    {
        $map = [
            'superAdmin'         => 'dashboard.superadmin',
            'adminAzhagii'       => 'dashboard.admin',
            'azhagiiCoordinator' => 'dashboard.coordinator',
            'azhagiiStudents'    => 'dashboard.student',
        ];
        return $map[$this->role] ?? 'dashboard';
    }

    public function getAvatarInitialAttribute(): string
    {
        return strtoupper(substr($this->name, 0, 1));
    }

    public function getGithubAttribute()
    {
        return $this->attributes['githubUrl'] ?? null;
    }

    public function getLinkedinAttribute()
    {
        return $this->attributes['linkedinUrl'] ?? null;
    }

    public function getHackerrankAttribute()
    {
        return $this->attributes['hackerrankUrl'] ?? null;
    }

    public function getLeetcodeAttribute()
    {
        return $this->attributes['leetcodeUrl'] ?? null;
    }
}

