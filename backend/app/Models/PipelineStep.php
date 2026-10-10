<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PipelineStep extends Model
{
    protected $fillable = ['name', 'order', 'color', 'department_id', 'is_interview'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }
}
