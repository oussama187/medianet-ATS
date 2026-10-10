<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'description'];

    public function jobListings()
    {
        return $this->hasMany(JobListing::class);
    }

    public function pipelineSteps()
    {
        return $this->hasMany(PipelineStep::class);
    }
}
