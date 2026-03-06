<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Tag(name="Auth", description="Authentication")
 */
class LoginController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     tags={"Auth"},
     *     summary="Login and get API token",
     *     @OA\RequestBody(@OA\JsonContent(
     *         required={"email","password"},
     *         @OA\Property(property="email", type="string", format="email"),
     *         @OA\Property(property="password", type="string"),
     *         @OA\Property(property="device_name", type="string")
     *     )),
     *     @OA\Response(response=200, description="Token issued"),
     *     @OA\Response(response=422, description="Invalid credentials")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'email'       => 'required|email',
            'password'    => 'required|string',
            'device_name' => 'nullable|string|max:100',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => [__('auth.deactivated')],
            ]);
        }

        // Update user locale from Accept-Language if not yet set
        if ($request->hasHeader('Accept-Language')) {
            $lang = substr($request->header('Accept-Language'), 0, 2);
            if (in_array($lang, ['fr', 'en', 'de', 'ru', 'nl']) && $user->locale !== $lang) {
                $user->update(['locale' => $lang]);
            }
        }

        $deviceName = $data['device_name'] ?? ($request->userAgent() ?? 'api');
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'locale' => $user->locale,
                'avatar' => $user->avatar_path,
            ],
        ]);
    }

    /**
     * @OA\Post(path="/api/v1/auth/logout", tags={"Auth"}, summary="Revoke current token", security={{"sanctum":{}}})
     */
    public function destroy(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => __('auth.logged_out')]);
    }
}
