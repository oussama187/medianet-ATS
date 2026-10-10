<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobListing;

class JobListingController extends Controller
{
    public function index()
    {
        return response()->json(JobListing::with('department')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'status' => 'nullable|string',
            'role' => 'nullable|string',
            'locations' => 'nullable|string',
            'remote_status' => 'nullable|string',
            'salary' => 'nullable|string',
        ]);

        $job = JobListing::create($validated);

        return response()->json($job->load('department'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(JobListing::with('department')->findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $job = JobListing::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'department_id' => 'sometimes|required|exists:departments,id',
            'status' => 'nullable|string',
            'role' => 'nullable|string',
            'locations' => 'nullable|string',
            'remote_status' => 'nullable|string',
            'salary' => 'nullable|string',
        ]);

        $job->update($validated);

        return response()->json($job->load('department'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $job = JobListing::findOrFail($id);
        $job->delete();

        return response()->json(['message' => 'Job listing deleted successfully']);
    }

    public function recommendJobs(Request $request)
    {
        $request->validate([
            'cv' => 'required|file|mimes:pdf|max:10240'
        ]);

        $file = $request->file('cv');
        
        try {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($file->getPathname());
            $text = $pdf->getText();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to parse PDF file. Ensure it is a valid PDF.'], 400);
        }

        $text = substr($text, 0, 10000); 

        $jobs = JobListing::where('status', 'open')->get(['id', 'title', 'description', 'department_id'])->toArray();
        if (empty($jobs)) {
            return response()->json([]);
        }

        $apiKey = env('GROQ_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'GROQ_API_KEY is missing.'], 500);
        }

        $jobsJson = json_encode($jobs);

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'openai/gpt-oss-120b',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert HR recruiter AI. You will receive a candidate\'s CV text and a JSON list of open job listings. Your task is to recommend the best matching jobs for the candidate based on their skills and experience. Return ONLY a JSON object with exactly one key "recommendations" which contains an array of objects. Each object must have: "job_id" (integer), "match_percentage" (integer 0-100), and "reason" (string, explaining why it is a good fit).'
                    ],
                    [
                        'role' => 'user',
                        'content' => "Open Job Listings (JSON):\n" . $jobsJson . "\n\nCandidate CV Text:\n" . $text
                    ]
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.1,
                'max_tokens' => 1024,
                'top_p' => 1,
                'frequency_penalty' => 0,
                'presence_penalty' => 0
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedText = $data['choices'][0]['message']['content'] ?? '';
                
                $cleanText = trim($generatedText);
                $parsedJson = json_decode($cleanText, true);
                
                if ($parsedJson && isset($parsedJson['recommendations'])) {
                    // Enrich recommendations with actual job data
                    $recommendations = collect($parsedJson['recommendations'])->map(function($rec) use ($jobs) {
                        $job = collect($jobs)->firstWhere('id', $rec['job_id']);
                        if ($job) {
                            $rec['job_title'] = $job['title'];
                            $rec['department_id'] = $job['department_id'];
                        }
                        return $rec;
                    })->filter(fn($rec) => isset($rec['job_title']))->values()->all();

                    return response()->json(['recommendations' => $recommendations]);
                }
                
                return response()->json(['error' => 'Failed to parse AI recommendations'], 500);
            }

            return response()->json(['error' => 'Groq API error', 'body' => $response->body()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to connect to Groq AI agent: ' . $e->getMessage()], 500);
        }
    }
}
