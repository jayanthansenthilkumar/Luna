<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    public $timestamps = false;

    protected $fillable = ['subjectId', 'title', 'description', 'createdBy', 'status'];

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subjectId');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }
}
