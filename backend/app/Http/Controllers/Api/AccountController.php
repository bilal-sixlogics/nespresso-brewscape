<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    public function show()
    {
        $user = Auth::user()->load('addresses');
        return response()->json([
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'phone'  => $user->phone,
            'locale' => $user->locale,
            'avatar' => $user->avatar_path,
            'addresses' => $user->addresses->map(fn ($a) => [
                'id'          => $a->id,
                'label'       => $a->label,
                'first_name'  => $a->first_name,
                'last_name'   => $a->last_name,
                'address'     => $a->address,
                'city'        => $a->city,
                'postal_code' => $a->postal_code,
                'country'     => $a->country,
                'phone'       => $a->phone,
                'is_default'  => (bool) $a->is_default,
            ]),
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'name'         => 'sometimes|string|max:100',
            'phone'        => 'sometimes|nullable|string|max:20',
            'locale'       => 'sometimes|in:fr,en,de,ru,nl',
            'password'     => 'sometimes|string|min:8|confirmed',
            'current_password' => 'required_with:password|string',
        ]);

        if (isset($data['password'])) {
            if (!Hash::check($data['current_password'], $user->password)) {
                return response()->json(['errors' => ['current_password' => [__('auth.password')]]], 422);
            }
            $data['password'] = Hash::make($data['password']);
        }

        unset($data['current_password']);
        $user->update($data);

        return response()->json(['message' => __('messages.profile_updated'), 'user' => $user->fresh()]);
    }
}
