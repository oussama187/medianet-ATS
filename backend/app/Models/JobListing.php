<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobListing extends Model
{
    protected $table = 'job_listings';
    protected $fillable = ['title', 'description', 'department_id', 'status', 'role', 'locations', 'remote_status', 'salary'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }
}
