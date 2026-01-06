<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    // Login Function: Authenticates the user and returns a token
    public function login(LoginRequest $request)
    {
        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password matches
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        // Generate token for the user
        $token = $user->createToken($request->device_name ?? 'api')->plainTextToken;

        // Return token and user data
        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user), // Return user data
        ]);
    }

    // Logout Function: Logs the user out by deleting their token
    public function logout(Request $request)
    {
        // Delete the current access token
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    // Me Function: Returns the authenticated user's data
    public function me(Request $request)
    {
        // Log untuk debugging (opsional)
        \Log::info('[AUTH ME]', [
            'user_id' => optional($request->user())->id,
        ]);

        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'user' => $this->userPayload($request->user()),
        ]);
    }

    // Helper Function: Returns detailed user data including roles, permissions, etc.
    private function userPayload(User $user): array
    {
        // Pastikan relasi diload
        $user->load(['organization', 'location', 'teamGroups', 'masterRole']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,

            // ✅ master role (ini yang dipakai FE)
            'master_role_id' => $user->master_role_id,
            'master_role' => $user->masterRole?->name, 

            // optional (kalau nanti pakai spatie lagi)
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),

            'organization' => $user->organization,
            'location' => $user->location,
            
            // 👇 BAGIAN INI SUDAH DIPERBARUI (Mapping Pivot)
            'team_groups' => $user->teamGroups->map(function ($tg) {
                return [
                    'id' => $tg->id,
                    'name' => $tg->name,
                    'code' => $tg->code,
                    'is_active' => $tg->is_active,
                    // Ambil data jabatan & status dari tabel pivot
                    'role' => $tg->pivot->role ?? null,
                    'member_active' => $tg->pivot->is_active ?? null,
                ];
            }),
            // 👆 SELESAI UPDATE
        ];
    }
}