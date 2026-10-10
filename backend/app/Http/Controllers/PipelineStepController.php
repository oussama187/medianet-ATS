<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PipelineStepController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\PipelineStep::orderBy('order');
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'nullable|integer',
            'color' => 'nullable|string|max:7',
            'department_id' => 'nullable|exists:departments,id',
            'is_interview' => 'boolean',
        ]);

        return \App\Models\PipelineStep::create($validated);
    }

    public function show(string $id)
    {
        return \App\Models\PipelineStep::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $step = \App\Models\PipelineStep::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'order' => 'sometimes|nullable|integer',
            'color' => 'sometimes|nullable|string|max:7',
            'department_id' => 'sometimes|nullable|exists:departments,id',
            'is_interview' => 'sometimes|boolean',
        ]);

        $step->update($validated);
        return $step;
    }

    public function destroy(string $id)
    {
        $step = \App\Models\PipelineStep::findOrFail($id);
        $step->delete();
        return response()->noContent();
    }
}
