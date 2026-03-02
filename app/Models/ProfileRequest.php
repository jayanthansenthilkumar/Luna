<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileRequest extends Model
{
    public $timestamps = false;
    protected $table = 'profilerequests';

    protected $fillable = ['userId', 'requestReason', 'status', 'resolvedAt', 'resolvedBy'];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolvedBy');
    }
}
