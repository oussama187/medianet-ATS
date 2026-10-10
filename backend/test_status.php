<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

try {
    $candidate = App\Models\Candidate::first();
    if (!$candidate) {
        echo "No candidate found\n";
        exit;
    }
    echo "Candidate ID: " . $candidate->id . "\n";
    $req = new Illuminate\Http\Request(['status' => 'accepted']);
    app()->call('App\Http\Controllers\CandidateController@updateStatus', ['request' => $req, 'id' => $candidate->id]);
    echo "Success\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
