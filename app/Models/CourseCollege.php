<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseCollege extends Model
{
    public $timestamps = false;
    protected $table = 'coursecolleges';

    protected $fillable = ['courseId', 'collegeId', 'assignedBy'];

    public function course()
    {
        return $this->belongsTo(Course::class, 'courseId');
    }

    public function college()
    {
        return $this->belongsTo(College::class, 'collegeId');
    }

    public function assignedByUser()
    {
        return $this->belongsTo(User::class, 'assignedBy');
    }
}
