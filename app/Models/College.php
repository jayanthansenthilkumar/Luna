<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class College extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name', 'code', 'address', 'city', 'status',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'collegeId');
    }

    public function courseAssignments()
    {
        return $this->hasMany(CourseCollege::class, 'collegeId');
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'coursecolleges', 'collegeId', 'courseId');
    }
}
