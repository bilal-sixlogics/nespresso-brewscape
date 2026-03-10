<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminLoginController extends Controller
{
    /**
     * POST /api/admin/login
     * Accepts email + password, returns Sanctum token.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Allow only admin roles (Spatie HasRoles — role is in model_has_roles pivot)
        $roleName = $user->getRoleNames()->first() ?? '';
        if (! in_array($roleName, ['super_admin', 'manager', 'inventory_staff'])) {
            return response()->json(['message' => 'Unauthorized. Admin access only.'], 403);
        }

        $token = $user->createToken('admin-token', ['admin'])->plainTextToken;

        return response()->json([
            'user'  => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'role'   => $roleName,
                'locale' => $user->locale ?? 'fr',
            ],
            'token' => $token,
        ]);
    }

    /**
     * POST /api/admin/logout
     */
    public function destroy(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    /**
     * GET /api/admin/me
     */
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->getRoleNames()->first() ?? 'manager',
            'locale' => $user->locale ?? 'fr',
        ]);
    }
}
