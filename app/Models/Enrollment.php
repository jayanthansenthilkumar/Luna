<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'studentId', 'courseId', 'progress', 'status',
        'completed_topics', 'completedAt',
    ];

    protected function casts(): array
    {
        return [
            'completed_topics' => 'array',
            'enrolledAt' => 'datetime',
            'completedAt' => 'datetime',
        ];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'studentId');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'courseId');
    }
}
