<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use App\Models\JobListing;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed default user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // 1. Seed Departments
        $engineering = Department::create(['name' => 'Engineering', 'description' => 'Software and Hardware engineering teams.']);
        $marketing = Department::create(['name' => 'Marketing', 'description' => 'Brand, content, and growth marketing.']);
        $sales = Department::create(['name' => 'Sales', 'description' => 'B2B and B2C sales teams.']);

        // 2. Seed Job Templates
        $softwareEngTemplate = JobListing::create([
            'title' => 'Software Engineer (Template)',
            'description' => '### About the role\nWe are looking for a skilled Software Engineer to join our team.\n\n### Requirements\n- 3+ years of experience\n- Proficiency in React and Node.js',
            'department_id' => $engineering->id,
            'status' => 'template',
            'role' => 'Full-time',
            'locations' => 'San Francisco, CA',
            'remote_status' => 'Hybrid',
            'salary' => '$120,000 - $160,000'
        ]);

        $marketingMgrTemplate = JobListing::create([
            'title' => 'Marketing Manager (Template)',
            'description' => '### About the role\nLead our marketing initiatives and drive growth.\n\n### Requirements\n- 5+ years in digital marketing\n- Experience with SEO and SEM',
            'department_id' => $marketing->id,
            'status' => 'template',
            'role' => 'Full-time',
            'locations' => 'New York, NY',
            'remote_status' => 'On-site',
            'salary' => '$90,000 - $120,000'
        ]);

        // 3. Seed Open Jobs
        JobListing::create([
            'title' => 'Senior Frontend Developer',
            'description' => '### About the role\nWe need a Senior Frontend Developer to build our next-generation web applications.\n\n### Requirements\n- 5+ years of experience in React\n- Strong CSS skills',
            'department_id' => $engineering->id,
            'status' => 'open',
            'role' => 'Full-time',
            'locations' => 'Austin, TX',
            'remote_status' => 'Remote',
            'salary' => '$140,000 - $180,000'
        ]);

        JobListing::create([
            'title' => 'Account Executive',
            'description' => '### About the role\nDrive sales and manage key accounts.\n\n### Requirements\n- 2+ years of B2B sales experience\n- Strong communication skills',
            'department_id' => $sales->id,
            'status' => 'open',
            'role' => 'Full-time',
            'locations' => 'Chicago, IL',
            'remote_status' => 'Hybrid',
            'salary' => '$70,000 + Commission'
        ]);
        
        JobListing::create([
            'title' => 'DevOps Engineer',
            'description' => '### About the role\nHelp us scale our infrastructure and improve our deployment pipelines.\n\n### Requirements\n- Experience with AWS and Kubernetes\n- Strong scripting skills',
            'department_id' => $engineering->id,
            'status' => 'open',
            'role' => 'Full-time',
            'locations' => 'Seattle, WA',
            'remote_status' => 'Remote',
            'salary' => '$130,000 - $170,000'
        ]);
    }
}
