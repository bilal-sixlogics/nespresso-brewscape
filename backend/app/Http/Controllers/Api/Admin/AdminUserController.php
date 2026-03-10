<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::withCount('orders')
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($sq) =>
                $sq->where('name', 'like', '%' . $request->search . '%')
                   ->orWhere('email', 'like', '%' . $request->search . '%')
            ))
            ->orderByDesc('created_at');

        return response()->json($query->paginate($request->query('per_page', 20)));
    }

    public function show(User $user)
    {
        return response()->json($user->load(['orders' => fn ($q) => $q->latest()->take(5)]));
    }

    public function update(Request $request, User $user)
    {
        $user->update($request->only(['name', 'email', 'role', 'locale', 'phone']));
        return response()->json($user);
    }

    public function destroy(Request $request, User $user)
    {
        // Prevent deleting yourself
        if ($user->id === $request->user()?->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
