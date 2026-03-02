<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    public $timestamps = false;

    protected $appends = ['syllabusUrl', 'thumbnailUrl'];

    protected $fillable = [
        'title', 'courseCode', 'description', 'category', 'courseType',
        'thumbnail', 'syllabus', 'semester', 'regulation', 'academicYear',
        'createdBy', 'status', 'approvedBy', 'approvedAt', 'rejectionReason',
    ];

    protected function casts(): array
    {
        return [
            'approvedAt' => 'datetime',
            'createdAt' => 'datetime',
            'updatedAt' => 'datetime',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approvedBy');
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class, 'courseId');
    }

    public function contents()
    {
        return $this->hasMany(CourseContent::class, 'courseId');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'courseId');
    }

    public function collegeAssignments()
    {
        return $this->hasMany(CourseCollege::class, 'courseId');
    }

    public function colleges()
    {
        return $this->belongsToMany(College::class, 'coursecolleges', 'courseId', 'collegeId');
    }

    // Accessors for URL-friendly column names
    public function getSyllabusUrlAttribute()
    {
        return $this->attributes['syllabus'] ?? null;
    }

    public function getThumbnailUrlAttribute()
    {
        return $this->attributes['thumbnail'] ?? null;
    }
}
