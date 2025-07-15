<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\RefreshToken;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt(['user_email' => $request->email, 'password' => $request->password])) {
            $user = Auth::user();

            Log::info('Login attempt successful. User object acquired.');
            Log::info('User class: ' . get_class($user));
            Log::info('User instance of Authenticatable: ' . (is_a($user, \Illuminate\Contracts\Auth\Authenticatable::class) ? 'true' : 'false'));
            Log::info('User instance of App\Models\User: ' . (is_a($user, User::class) ? 'true' : 'false'));
            Log::info('User has HasApiTokens trait: ' . (method_exists($user, 'createToken') ? 'true' : 'false'));

            $accessToken = $user->createToken('access-token', ['*'], now()->addMinutes(15))->plainTextToken;

            $refreshToken = Str::random(60);
            $hashedRefreshToken = hash('sha256', $refreshToken);

            RefreshToken::where('user_login_id', $user->user_login_id)->delete();
            RefreshToken::create([
                'user_login_id' => $user->user_login_id,
                'token' => $hashedRefreshToken,
                'expires_at' => now()->addDays(7),
            ]);

            // ZMĚNA ZDE: Explicitně přetypujeme na int
            $cookieExpirationMinutes = (int) now()->addDays(7)->diffInMinutes(now());

            return response()->json([
                'message' => 'Přihlášení úspěšné!',
                'user' => $user,
                'token' => $accessToken,
            ], 200)->withCookie(cookie('refreshToken', $refreshToken, $cookieExpirationMinutes, '/', null, true, true, false, 'lax'));
        }

        return response()->json([
            'message' => 'Neplatné přihlašovací údaje.'
        ], 401);
    }

    public function refresh(Request $request)
    {
        $refreshToken = $request->cookie('refreshToken');

        if (!$refreshToken) {
            Log::warning('Refresh token not found in cookie.');
            return response()->json(['message' => 'Refresh token chybí.'], 401);
        }

        $hashedRefreshToken = hash('sha256', $refreshToken);
        $dbRefreshToken = RefreshToken::where('token', $hashedRefreshToken)
                                    ->where('expires_at', '>', now())
                                    ->first();

        if (!$dbRefreshToken || !$dbRefreshToken->user) {
            Log::warning('Invalid or expired refresh token.');
            return response()->json(['message' => 'Neplatný nebo vypršelý obnovovací token.'], 401)
                            ->withCookie(cookie()->forget('refreshToken'));
        }

        $user = $dbRefreshToken->user;

        $user->tokens()->delete();
        $dbRefreshToken->delete();

        $newAccessToken = $user->createToken('access-token', ['*'], now()->addMinutes(15))->plainTextToken;

        $newRefreshToken = Str::random(60);
        $hashedNewRefreshToken = hash('sha256', $newRefreshToken);

        RefreshToken::create([
            'user_login_id' => $user->user_login_id,
            'token' => $hashedNewRefreshToken,
            'expires_at' => now()->addDays(7),
        ]);

        Log::info('Tokens refreshed successfully for user: ' . $user->user_email);

        // ZMĚNA ZDE: Explicitně přetypujeme na int
        $cookieExpirationMinutes = (int) now()->addDays(7)->diffInMinutes(now());

        return response()->json([
            'message' => 'Tokeny úspěšně obnoveny.',
            'token' => $newAccessToken,
        ], 200)->withCookie(cookie('refreshToken', $newRefreshToken, $cookieExpirationMinutes, '/', null, true, true, false, 'lax'));
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        $hashedRefreshToken = hash('sha256', $request->cookie('refreshToken'));
        RefreshToken::where('token', $hashedRefreshToken)->delete();

        Log::info('User logged out. Tokens revoked.');

        return response()->json([
            'message' => 'Odhlášení úspěšné!'
        ], 200)->withCookie(cookie()->forget('refreshToken'));
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
