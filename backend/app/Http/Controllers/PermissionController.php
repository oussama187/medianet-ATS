<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PermissionController extends Controller
{
    /**
     * List all users with the 'admin' (recruiter) role.
     */
    public function listRecruiters(Request $request)
    {
        if ($request->user()->role !== 'super-admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $recruiters = User::where('role', 'admin')->get();
        return response()->json($recruiters);
    }

    /**
     * Update permissions for a specific recruiter.
     */
    public function updatePermissions(Request $request, $id)
    {
        if ($request->user()->role !== 'super-admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'permissions' => 'present|array',
        ]);

        $user = User::findOrFail($id);
        
        if ($user->role !== 'admin') {
             return response()->json(['message' => 'Only recruiters permissions can be managed'], 400);
        }

        $user->permissions = $request->permissions;
        $user->save();

        return response()->json([
            'message' => 'Permissions updated successfully',
            'user' => $user
        ]);
    }
}
