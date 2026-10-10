<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Department;

$depts = Department::all();
if ($depts->count() >= 1) {
    echo "Updating " . $depts[0]->name . "\n";
    $depts[0]->pipelineSteps()->firstOrCreate(['name' => 'Tech Interview'], ['order' => 10, 'color' => '#3b82f6']);
}

$marketing = Department::firstOrCreate(['name' => 'Marketing'], ['description' => 'Marketing team']);
echo "Updating Marketing\n";
$marketing->pipelineSteps()->firstOrCreate(['name' => 'Portfolio Review'], ['order' => 10, 'color' => '#10b981']);

echo "Test data setup successful.";
