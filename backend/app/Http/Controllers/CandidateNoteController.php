<?php

namespace App\Http\Controllers;

use App\Models\CandidateNote;
use Illuminate\Http\Request;

class CandidateNoteController extends Controller
{
    public function index($candidateId)
    {
        $notes = CandidateNote::with(['user', 'pipelineStep'])
            ->where('candidate_id', $candidateId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($notes);
    }

    public function store(Request $request, $candidateId)
    {
        $request->validate([
            'note' => 'required|string',
            'pipeline_step_id' => 'nullable|exists:pipeline_steps,id',
        ]);

        $note = new CandidateNote();
        $note->candidate_id = $candidateId;
        $note->pipeline_step_id = $request->pipeline_step_id;
        $note->note = $request->note;
        
        if (auth()->check()) {
            $note->user_id = auth()->id();
        }
        
        $note->save();

        return response()->json($note->load(['user', 'pipelineStep']), 201);
    }
}
