<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CandidateNote extends Model
{
    protected $fillable = ['candidate_id', 'pipeline_step_id', 'user_id', 'note'];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pipelineStep()
    {
        return $this->belongsTo(PipelineStep::class);
    }
}
