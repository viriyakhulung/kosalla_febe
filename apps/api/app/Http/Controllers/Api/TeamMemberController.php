<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamGroup;
use App\Models\User;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    public function index(TeamGroup $teamGroup)
    {
        // list members dalam team group
        $members = $teamGroup->users()
            ->select('users.id', 'users.name', 'users.email', 'users.master_role_id', 'users.organization_id', 'users.location_id')
            ->orderBy('users.name')
            ->get();

        return response()->json([
            'team_group' => [
                'id' => $teamGroup->id,
                'name' => $teamGroup->name,
                'code' => $teamGroup->code,
            ],
            'members' => $members,
        ]);
    }

    public function store(Request $request, TeamGroup $teamGroup)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $userId = (int) $validated['user_id'];

        // attach tanpa duplikat
        $teamGroup->users()->syncWithoutDetaching([$userId]);

        return response()->json(['message' => 'Member added']);
    }

    public function destroy(TeamGroup $teamGroup, User $user)
    {
        $teamGroup->users()->detach($user->id);

        return response()->json(['message' => 'Member removed']);
    }

    public function users()
    {
        $users = User::query()
            ->select('id', 'name', 'email', 'organization_id', 'location_id', 'master_role_id')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $users,
        ]);
    }
}
