<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PipelineStageUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public $candidate;
    public $step;

    /**
     * Create a new message instance.
     */
    public function __construct($candidate, $step)
    {
        $this->candidate = $candidate;
        $this->step = $step;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application Update: Your Pipeline Stage has changed',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.pipeline_updated',
            with: [
                'candidateName' => $this->candidate->first_name,
                'jobTitle' => $this->candidate->jobListing ? $this->candidate->jobListing->title : 'your applied position',
                'stepName' => $this->step->name
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
