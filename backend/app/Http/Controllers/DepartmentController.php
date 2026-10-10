<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Department::withCount(['jobListings' => function ($query) {
            $query->where('status', '!=', 'template');
        }])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $department = Department::create($validated);

        // Create default pipeline steps for each department
        $steps = [
            ['name' => 'Unassigned', 'order' => 0, 'color' => '#64748b'],
            ['name' => 'Screening', 'order' => 1, 'color' => '#3b82f6'],
            ['name' => 'Interview', 'order' => 2, 'color' => '#8b5cf6'],
            ['name' => 'Offer', 'order' => 3, 'color' => '#10b981'],
        ];

        foreach ($steps as $step) {
            $department->pipelineSteps()->create($step);
        }

        return response()->json($department, 212);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(Department::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $department->update($validated);

        return response()->json($department);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $department = Department::findOrFail($id);
        $department->delete();

        return response()->json(['message' => 'Department deleted successfully']);
    }
}
