<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\JobListing;
use App\Models\PipelineStep;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class CandidateSeeder extends Seeder
{
    public function run()
    {
        $jobs = JobListing::all();
        if ($jobs->isEmpty()) {
            return;
        }

        $candidatesData = [
            ['first_name' => 'John', 'last_name' => 'Doe', 'email' => 'john.doe@example.com', 'note' => 'Very interested in this role.'],
            ['first_name' => 'Jane', 'last_name' => 'Smith', 'email' => 'jane.smith@example.com', 'note' => 'I have 5 years of experience.'],
            ['first_name' => 'Alice', 'last_name' => 'Johnson', 'email' => 'alice.j@example.com', 'note' => 'Looking forward to hearing from you.'],
            ['first_name' => 'Bob', 'last_name' => 'Williams', 'email' => 'bob.w@example.com', 'note' => 'Great fit for the team.'],
        ];

        // Create a dummy PDF file
        Storage::disk('public')->put('cvs/dummy.pdf', 'Dummy CV content');

        foreach ($candidatesData as $index => $data) {
            $job = $jobs->random();
            
            $unassignedStep = PipelineStep::where('name', 'Unassigned')
                ->where('department_id', $job->department_id)
                ->first() 
                ?? PipelineStep::where('department_id', $job->department_id)
                ->orderBy('order')
                ->first();

            Candidate::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'job_listing_id' => $job->id,
                'pipeline_step_id' => $unassignedStep ? $unassignedStep->id : null,
                'status' => 'applied',
                'note' => $data['note'],
                'resume_url' => 'cvs/dummy.pdf',
            ]);
        }
    }
}
