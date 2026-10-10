<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\Candidate;
use App\Models\PipelineStep;

class PipelineStageUpdatedNotification extends Notification
{
    use Queueable;

    public $candidate;
    public $newStep;

    public function __construct(Candidate $candidate, PipelineStep $newStep)
    {
        $this->candidate = $candidate;
        $this->newStep = $newStep;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $jobTitle = $this->candidate->jobListing->title ?? 'a position';
        return [
            'candidate_id' => $this->candidate->id,
            'job_title' => $jobTitle,
            'new_step_name' => $this->newStep->name,
            'message' => 'Your application for ' . $jobTitle . ' has been moved to ' . $this->newStep->name . '.',
        ];
    }
}
