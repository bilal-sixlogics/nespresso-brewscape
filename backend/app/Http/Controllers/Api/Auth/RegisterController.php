<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class RegisterController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     tags={"Auth"},
     *     summary="Register a new customer account",
     *     @OA\RequestBody(@OA\JsonContent(
     *         required={"name","email","password","password_confirmation"},
     *         @OA\Property(property="name", type="string"),
     *         @OA\Property(property="email", type="string", format="email"),
     *         @OA\Property(property="password", type="string", minLength=8),
     *         @OA\Property(property="password_confirmation", type="string"),
     *         @OA\Property(property="locale", type="string", enum={"fr","en","de","ru","nl"})
     *     )),
     *     @OA\Response(response=201, description="Account created")
     * )
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:100',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'locale'                => 'nullable|in:fr,en,de,ru,nl',
            'phone'                 => 'nullable|string|max:20',
        ]);

        $locale = $data['locale'] ?? substr($request->header('Accept-Language', 'fr'), 0, 2);
        if (!in_array($locale, ['fr', 'en', 'de', 'ru', 'nl'])) {
            $locale = 'fr';
        }

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'locale'   => $locale,
            'phone'    => $data['phone'] ?? null,
        ]);

        // Send welcome email (queued)
        Mail::to($user->email)->queue(new WelcomeMail($user));

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'locale' => $user->locale,
            ],
        ], 201);
    }
}
