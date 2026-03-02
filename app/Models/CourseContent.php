<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseContent extends Model
{
    public $timestamps = false;
    protected $table = 'coursecontent';

    protected $fillable = [
        'courseId', 'title', 'description', 'contentType', 'contentData',
        'uploadedBy', 'collegeId', 'sortOrder', 'status', 'subjectId',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'courseId');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploadedBy');
    }

    public function college()
    {
        return $this->belongsTo(College::class, 'collegeId');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subjectId');
    }
}
