<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    public $timestamps = false;

    protected $fillable = ['courseId', 'title', 'code', 'description', 'status'];

    public function course()
    {
        return $this->belongsTo(Course::class, 'courseId');
    }

    public function topics()
    {
        return $this->hasMany(Topic::class, 'subjectId');
    }

    public function contents()
    {
        return $this->hasMany(CourseContent::class, 'subjectId');
    }
}
