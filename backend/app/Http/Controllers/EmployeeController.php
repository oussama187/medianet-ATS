<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Employee::with('department')->get());
    }

    public function update(Request $request, $id)
    {
        $employee = \App\Models\Employee::findOrFail($id);
        $request->validate([
            'salary' => 'nullable|string|max:255'
        ]);

        $employee->salary = $request->salary;
        $employee->save();

        return response()->json($employee->load('department'));
    }
}
