<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\JobListing;
use App\Models\Candidate;
use App\Models\PipelineStep;
use App\Models\CandidateNote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JobAndDepartmentSeeder extends Seeder
{
    public function run()
    {
        // Truncate tables cleanly
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        CandidateNote::truncate();
        Candidate::truncate();
        JobListing::truncate();
        PipelineStep::truncate();
        Department::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $departments = [
            [
                'name' => 'Engineering',
                'description' => 'The core team building scalable backend and frontend systems.'
            ],
            [
                'name' => 'Design & UX',
                'description' => 'Creative minds focusing on beautiful interfaces and user journeys.'
            ],
            [
                'name' => 'Marketing',
                'description' => 'Our growth engine, connecting our products with the world.'
            ],
            [
                'name' => 'Sales & Operations',
                'description' => 'Driving revenue and ensuring seamless business execution.'
            ],
        ];

        foreach ($departments as $deptData) {
            $department = Department::create($deptData);

            // Seed Pipeline Steps
            $steps = [
                ['name' => 'Unassigned', 'order' => 0, 'color' => '#64748b'],
                ['name' => 'Screening', 'order' => 1, 'color' => '#3b82f6'],
                ['name' => 'Interview', 'order' => 2, 'color' => '#8b5cf6', 'is_interview' => true],
                ['name' => 'Offer', 'order' => 3, 'color' => '#10b981'],
            ];
            foreach ($steps as $step) {
                $department->pipelineSteps()->create($step);
            }

            // Seed jobs for the department
            if ($department->name === 'Engineering') {
                JobListing::create([
                    'department_id' => $department->id,
                    'title' => 'Senior Full Stack Engineer',
                    'description' => "We are looking for an experienced Full Stack Engineer to lead the architecture and development of our next-generation web applications. You will work extensively with React, Node.js, and PostgreSQL.\n\nRequirements:\n- 5+ years of software development experience\n- Deep knowledge of React and modern JavaScript\n- Experience with SQL databases and REST APIs\n- Strong problem-solving skills and teamwork.",
                    'salary' => '$130,000 - $160,000',
                    'role' => 'Full-time',
                    'locations' => 'San Francisco, CA',
                    'remote_status' => 'Hybrid remote',
                    'status' => 'open'
                ]);

                JobListing::create([
                    'department_id' => $department->id,
                    'title' => 'DevOps Specialist',
                    'description' => "Join our infrastructure team to build robust CI/CD pipelines, manage Kubernetes clusters, and scale our AWS environments. If you live and breathe automation, this is the role for you.\n\nRequirements:\n- 3+ years experience in DevOps or SRE\n- Proficiency with AWS, Docker, and Kubernetes\n- Terraform or Ansible knowledge\n- Passion for automation and system reliability.",
                    'salary' => '$120,000 - $150,000',
                    'role' => 'Contract',
                    'locations' => 'New York, NY',
                    'remote_status' => 'Full Remote',
                    'status' => 'open'
                ]);
            }

            if ($department->name === 'Design & UX') {
                JobListing::create([
                    'department_id' => $department->id,
                    'title' => 'Lead UI/UX Designer',
                    'description' => "We're seeking a visionary Lead Designer to redefine our product interfaces. You will collaborate closely with product managers and engineers to craft pixel-perfect, intuitive user experiences.\n\nResponsibilities:\n- Create wireframes, prototypes, and high-fidelity designs\n- Lead user research and usability testing\n- Establish and maintain our design system.",
                    'salary' => '$110,000 - $140,000',
                    'role' => 'Full-time',
                    'locations' => 'Austin, TX',
                    'remote_status' => 'On-site',
                    'status' => 'open'
                ]);
            }

            if ($department->name === 'Marketing') {
                JobListing::create([
                    'department_id' => $department->id,
                    'title' => 'Growth Marketing Manager',
                    'description' => "Drive our user acquisition efforts across paid and organic channels. The ideal candidate is data-driven, creative, and experienced in optimizing conversion funnels.\n\nResponsibilities:\n- Manage performance marketing campaigns (Google Ads, Facebook)\n- A/B testing landing pages and ad creatives\n- Collaborate with the content team for inbound strategies.",
                    'salary' => '$90,000 - $120,000',
                    'role' => 'Full-time',
                    'locations' => 'Chicago, IL',
                    'remote_status' => 'Hybrid remote',
                    'status' => 'open'
                ]);
            }

            if ($department->name === 'Sales & Operations') {
                JobListing::create([
                    'department_id' => $department->id,
                    'title' => 'Account Executive',
                    'description' => "Join our high-performing sales team to drive revenue growth. You will be responsible for the full sales cycle, from prospecting to closing deals with mid-market and enterprise clients.\n\nWhat you'll need:\n- 3+ years of B2B SaaS sales experience\n- Proven track record of exceeding quotas\n- Excellent communication and negotiation skills.",
                    'salary' => '$70,000 Base + Commission',
                    'role' => 'Full-time',
                    'locations' => 'Los Angeles, CA',
                    'remote_status' => 'Full Remote',
                    'status' => 'open'
                ]);
            }
        }
    }
}
