<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCandidateApplication extends Notification
{
    use Queueable;

    public $candidate;
    public $job;

    /**
     * Create a new notification instance.
     */
    public function __construct($candidate, $job)
    {
        $this->candidate = $candidate;
        $this->job = $job;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->line('A new candidate has applied.')
                    ->line('Candidate: ' . $this->candidate->first_name . ' ' . $this->candidate->last_name)
                    ->line('Job: ' . $this->job->title)
                    ->action('View Candidates', url('/'))
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_application',
            'candidate_id' => $this->candidate->id,
            'candidate_name' => $this->candidate->first_name . ' ' . $this->candidate->last_name,
            'job_id' => $this->job->id,
            'job_title' => $this->job->title,
            'message' => $this->candidate->first_name . ' ' . $this->candidate->last_name . ' applied for ' . $this->job->title
        ];
    }
}
