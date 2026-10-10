<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    $req = new Illuminate\Http\Request(['status' => 'accepted']);
    app()->call('App\Http\Controllers\CandidateController@updateStatus', ['request' => $req, 'id' => 3]);
    echo "Employee Count: " . App\Models\Employee::count() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
