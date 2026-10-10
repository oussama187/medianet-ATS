<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Candidate;
use Illuminate\Support\Facades\Storage;

class CandidateController extends Controller
{
    public function index()
    {
        // For recruiters, list all candidates with their applied job
        return Candidate::with('jobListing')->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'job_listing_id' => 'required|exists:job_listings,id',
            'note' => 'nullable|string',
            'cv' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB max
        ]);

        $candidate = new Candidate();
        $candidate->first_name = $request->first_name;
        $candidate->last_name = $request->last_name;
        $candidate->email = $request->email;
        $candidate->job_listing_id = $request->job_listing_id;
        $candidate->note = $request->note;
        $candidate->status = 'applied';

        if (auth()->check()) {
            $candidate->user_id = auth()->id();
        }

        // Find the job to get its department
        $job = \App\Models\JobListing::findOrFail($request->job_listing_id);
        
        // Assign to Unassigned phase of the specific department by default
        $unassignedStep = \App\Models\PipelineStep::where('name', 'Unassigned')
            ->where('department_id', $job->department_id)
            ->first() 
            ?? \App\Models\PipelineStep::where('department_id', $job->department_id)
            ->orderBy('order')
            ->first();
            
        if ($unassignedStep) {
            $candidate->pipeline_step_id = $unassignedStep->id;
        }

        if ($request->hasFile('cv')) {
            $path = $request->file('cv')->store('resumes', 'public');
            $candidate->resume_url = Storage::url($path);
            
            try {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile($request->file('cv')->getPathname());
                $text = substr($pdf->getText(), 0, 8000);
                $apiKey = env('GROQ_API_KEY');
                if ($apiKey) {
                    $response = \Illuminate\Support\Facades\Http::withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Content-Type' => 'application/json'
                    ])->post('https://api.groq.com/openai/v1/chat/completions', [
                        'model' => 'openai/gpt-oss-120b',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'You are an AI assistant evaluating a candidate\'s CV against a job description. Return a JSON object with one key "match_score" (an integer from 0 to 100) representing how well the CV matches the job.'
                            ],
                            [
                                'role' => 'user',
                                'content' => "Job Title: " . $job->title . "\nJob Description: " . ($job->description ?? '') . "\nJob Requirements: " . ($job->requirements ?? '') . "\n\nCandidate CV:\n" . $text
                            ]
                        ],
                        'response_format' => ['type' => 'json_object'],
                        'temperature' => 0.1
                    ]);
                    
                    if ($response->successful()) {
                        $data = $response->json();
                        $generatedText = $data['choices'][0]['message']['content'] ?? '';
                        $parsed = json_decode(trim($generatedText), true);
                        if (isset($parsed['match_score'])) {
                            $candidate->match_score = (int) $parsed['match_score'];
                        }
                    } else {
                        \Illuminate\Support\Facades\Log::error('AI Match Error: ' . $response->body());
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Match score generation failed: ' . $e->getMessage());
            }
        }

        $candidate->save();

        // Notify all admins/recruiters about the new application
        $recruiters = \App\Models\User::where('role', 'admin')->get();
        \Illuminate\Support\Facades\Notification::send($recruiters, new \App\Notifications\NewCandidateApplication($candidate, $job));

        return response()->json([
            'message' => 'Application submitted successfully',
            'candidate' => $candidate
        ], 201);
    }

    public function myApplications()
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return Candidate::where('user_id', auth()->id())
            ->with(['jobListing', 'pipelineStep'])
            ->latest()
            ->get();
    }

    public function updateStep(Request $request, $id)
    {
        $candidate = Candidate::findOrFail($id);
        $request->validate([
            'pipeline_step_id' => 'required|exists:pipeline_steps,id'
        ]);

        $oldStepId = $candidate->pipeline_step_id;
        $candidate->pipeline_step_id = $request->pipeline_step_id;
        $candidate->save();

        if ($oldStepId != $request->pipeline_step_id) {
            $newStep = \App\Models\PipelineStep::find($request->pipeline_step_id);
            if ($newStep && $candidate->email) {
                try {
                    $n8nWebhook = env('N8N_WEBHOOK_URL');
                    if ($n8nWebhook) {
                        \Illuminate\Support\Facades\Http::post($n8nWebhook, [
                            'event' => 'pipeline_stage_updated',
                            'candidate' => [
                                'first_name' => $candidate->first_name,
                                'last_name' => $candidate->last_name,
                                'email' => $candidate->email,
                            ],
                            'new_step' => $newStep->name,
                            'is_interview_stage' => (bool) $newStep->is_interview,
                            'interview_date' => $candidate->interview_date,
                            'job_title' => $candidate->jobListing->title ?? 'the position',
                        ]);
                    } else {
                        \Illuminate\Support\Facades\Mail::to($candidate->email)->send(new \App\Mail\PipelineStageUpdated($candidate, $newStep));
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send pipeline update via n8n or email: ' . $e->getMessage());
                }
                
                // Add Notification
                if ($candidate->user_id) {
                    $user = \App\Models\User::find($candidate->user_id);
                    if ($user) {
                        $user->notify(new \App\Notifications\PipelineStageUpdatedNotification($candidate, $newStep));
                    }
                }
            }
        }

        return $candidate;
    }

    public function updateInterview(Request $request, $id)
    {
        $candidate = Candidate::findOrFail($id);
        $request->validate([
            'interview_date' => 'nullable|date'
        ]);

        $candidate->interview_date = $request->interview_date;
        $candidate->save();

        if ($candidate->pipeline_step_id) {
            $currentStep = \App\Models\PipelineStep::find($candidate->pipeline_step_id);
            if ($currentStep && $currentStep->is_interview) {
                try {
                    $n8nWebhook = env('N8N_WEBHOOK_URL');
                    if ($n8nWebhook) {
                        \Illuminate\Support\Facades\Http::post($n8nWebhook, [
                            'event' => 'interview_scheduled',
                            'candidate' => [
                                'first_name' => $candidate->first_name,
                                'last_name' => $candidate->last_name,
                                'email' => $candidate->email,
                            ],
                            'new_step' => $currentStep->name,
                            'is_interview_stage' => (bool) $currentStep->is_interview,
                            'interview_date' => $candidate->interview_date,
                            'job_title' => $candidate->jobListing->title ?? 'the position',
                        ]);
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send interview update via n8n: ' . $e->getMessage());
                }
            }
        }

        return $candidate;
    }

    public function updateStatus(Request $request, $id)
    {
        $candidate = Candidate::findOrFail($id);
        $request->validate([
            'status' => 'required|in:applied,accepted,rejected'
        ]);

        $candidate->status = $request->status;
        $candidate->save();

        if ($request->status === 'accepted') {
            $candidate->load('jobListing');
            \App\Models\Employee::firstOrCreate(
                ['email' => $candidate->email],
                [
                    'first_name' => $candidate->first_name,
                    'last_name' => $candidate->last_name,
                    'job_title' => $candidate->jobListing->title ?? 'Employee',
                    'department_id' => $candidate->jobListing->department_id ?? null,
                    'hired_date' => now(),
                    'salary' => $candidate->jobListing->salary ?? null,
                ]
            );

            try {
                \Illuminate\Support\Facades\Mail::to($candidate->email)->send(new \App\Mail\CandidateApprovedEmail($candidate));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Approval email failed: ' . $e->getMessage());
            }
        } elseif ($request->status === 'rejected') {
            try {
                \Illuminate\Support\Facades\Mail::to($candidate->email)->send(new \App\Mail\CandidateRejectedEmail($candidate));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Rejected email failed: ' . $e->getMessage());
            }
        }

        return $candidate;
    }

    public function parseCv($id)
    {
        $candidate = Candidate::findOrFail($id);
        
        if ($candidate->parsed_cv) {
            $parsedJson = json_decode($candidate->parsed_cv, true);
            if ($parsedJson && json_last_error() === JSON_ERROR_NONE) {
                return response()->json($parsedJson);
            }
        }

        if (!$candidate->resume_url) {
            return response()->json(['error' => 'No CV found for this candidate'], 404);
        }

        $path = public_path($candidate->resume_url);
        
        if (!file_exists($path)) {
            return response()->json(['error' => 'CV file not found on disk'], 404);
        }

        try {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($path);
            $text = $pdf->getText();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to parse PDF file. Ensure it is a valid PDF.'], 500);
        }

        $text = substr($text, 0, 10000); 

        $apiKey = env('GROQ_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'GROQ_API_KEY is missing from environment variables'], 500);
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'openai/gpt-oss-120b',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert HR recruiter AI. Extract the following information from the provided CV text: name (string), age (string or "Not Found"), contact (string like email/phone), location (string), languages (array of strings), skills (array of strings), and experience (array of objects with "role", "company", "duration", "description"). Return ONLY a valid JSON object matching this structure.'
                    ],
                    [
                        'role' => 'user',
                        'content' => "Candidate CV Text:\n" . $text
                    ]
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.1,
                'max_tokens' => 1024
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedText = $data['choices'][0]['message']['content'] ?? '';
                
                $cleanText = trim($generatedText);
                $parsedJson = json_decode($cleanText, true);
                
                if ($parsedJson) {
                    $candidate->parsed_cv = json_encode($parsedJson);
                    $candidate->save();
                    return response()->json($parsedJson);
                }
                
                return response()->json(['error' => 'Failed to parse AI response into JSON'], 500);
            }
            
            return response()->json([
                'error' => 'Groq API returned an error',
                'status' => $response->status(),
                'body' => $response->body()
            ], 500);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to connect to Groq AI agent: ' . $e->getMessage()], 500);
        }
    }

    public function sendEmail(Request $request, $id)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        $candidate = Candidate::findOrFail($id);

        \Illuminate\Support\Facades\Mail::to($candidate->email)->send(
            new \App\Mail\CandidateCustomEmail($request->subject, $request->message)
        );

        return response()->json(['message' => 'Email sent successfully.']);
    }
}
