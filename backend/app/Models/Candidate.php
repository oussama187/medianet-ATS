<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    protected $fillable = ['first_name', 'last_name', 'email', 'job_listing_id', 'status', 'resume_url', 'note', 'user_id', 'interview_date', 'parsed_cv', 'match_score'];

    public function jobListing()
    {
        return $this->belongsTo(JobListing::class);
    }

    public function pipelineStep()
    {
        return $this->belongsTo(PipelineStep::class);
    }

    public function candidateNotes()
    {
        return $this->hasMany(CandidateNote::class)->orderBy('created_at', 'desc');
    }
}
