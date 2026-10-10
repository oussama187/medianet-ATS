<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$candidates = App\Models\Candidate::whereNull('match_score')->get();
foreach($candidates as $c) {
    $c->match_score = rand(30, 95);
    $c->save();
}
echo "Done\n";
