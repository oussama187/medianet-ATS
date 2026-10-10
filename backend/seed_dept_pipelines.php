<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Department;

Department::all()->each(function($d) {
    if($d->pipelineSteps()->count() == 0) {
        $steps = [
            ['name' => 'Unassigned', 'order' => 0, 'color' => '#64748b'],
            ['name' => 'Screening', 'order' => 1, 'color' => '#3b82f6'],
            ['name' => 'Interview', 'order' => 2, 'color' => '#8b5cf6'],
            ['name' => 'Offer', 'order' => 3, 'color' => '#10b981']
        ];
        foreach ($steps as $step) {
            $d->pipelineSteps()->create($step);
        }
    }
});
echo "Pipeline steps seeded successfully for existing departments.";
