<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'job_title',
        'department_id',
        'hired_date',
        'salary',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
