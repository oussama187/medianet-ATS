<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\JobListingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\CandidateController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Route required by Laravel Password Broker (Redirects implicitly)
Route::get('/reset-password/{token}', function (string $token) {
    return response()->json(['message' => 'Reset Password via Frontend URL', 'token' => $token], 200);
})->name('password.reset');

Route::get('/job-listings', [JobListingController::class, 'index']);
Route::get('/job-listings/{id}', [JobListingController::class, 'show']);
Route::post('/recommend-jobs', [JobListingController::class, 'recommendJobs']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/user/resume', [AuthController::class, 'uploadResume']);
    
    Route::get('/user/notifications', function (Request $request) {
        return response()->json($request->user()->notifications);
    });
    Route::post('/user/notifications/mark-read', function (Request $request) {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    });
    Route::post('/user/resume', [AuthController::class, 'uploadResume']);
    
    // Protect API resources
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('job-listings', JobListingController::class)->except(['index', 'show']);
    
    // Permission Management Routes
    Route::get('/recruiters', [PermissionController::class, 'listRecruiters']);
    Route::put('/recruiters/{id}/permissions', [PermissionController::class, 'updatePermissions']);
    
    // Candidate Management
    Route::post('/apply', [CandidateController::class, 'store']);
    Route::get('/candidates', [CandidateController::class, 'index']);
    Route::get('/my-applications', [CandidateController::class, 'myApplications']);
    Route::put('/candidates/{id}/step', [CandidateController::class, 'updateStep']);
    Route::put('/candidates/{id}/interview', [CandidateController::class, 'updateInterview']);
    Route::put('/candidates/{id}/status', [CandidateController::class, 'updateStatus']);
    Route::get('/candidates/{id}/parse-cv', [CandidateController::class, 'parseCv']);
    Route::post('/candidates/{id}/email', [CandidateController::class, 'sendEmail']);
    
    Route::get('/candidates/{candidateId}/notes', [\App\Http\Controllers\CandidateNoteController::class, 'index']);
    Route::post('/candidates/{candidateId}/notes', [\App\Http\Controllers\CandidateNoteController::class, 'store']);
    Route::get('/employees', [\App\Http\Controllers\EmployeeController::class, 'index']);
    Route::put('/employees/{id}', [\App\Http\Controllers\EmployeeController::class, 'update']);
    
    // Pipeline Steps
    Route::apiResource('pipeline-steps', \App\Http\Controllers\PipelineStepController::class);
});
