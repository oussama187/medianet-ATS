<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Candidate;

class CandidateRejectedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $candidate;

    public function __construct(Candidate $candidate)
    {
        $this->candidate = $candidate;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Update on Your Application',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.candidate_rejected',
        );
    }
}
