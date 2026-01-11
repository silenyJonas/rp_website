<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserLogin; // Opraveno na UserLogin
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

        // Používáme tvůj způsob přihlášení
        if (Auth::attempt(['user_email' => $request->email, 'password' => $request->password])) {
            $user = Auth::user();
            Log::info('Login attempt successful for: ' . $user->user_email);

            $user->update(['last_login_at' => now()]);

            // NAČTENÍ DAT (Role + Oprávnění)
            $user->load('roles.permissions');
            $userRoles = $user->roles->pluck('role_name');
            $userPermissions = $user->roles->flatMap(function ($role) {
                return $role->permissions->pluck('permission_key');
            })->unique()->values();

            // TOKENY (Tvůj osvědčený systém)
            $accessToken = $user->createToken('access-token', ['*'], now()->addMinutes(30))->plainTextToken;
            $refreshToken = Str::random(60);
            
            RefreshToken::where('user_login_id', $user->user_login_id)->delete();
            RefreshToken::create([
                'user_login_id' => $user->user_login_id,
                'token' => hash('sha256', $refreshToken),
                'expires_at' => now()->addDays(7),
            ]);
            
            return response()->json([
                'message' => 'Přihlášení úspěšné!',
                'user' => $user,
                'user_roles' => $userRoles,
                'user_permissions' => $userPermissions, // Tohle potřebuje Angular
                'token' => $accessToken,
                'refreshToken' => $refreshToken,
            ], 200);
        }

        return response()->json(['message' => 'Neplatné přihlašovací údaje.'], 401);
    }

    public function refresh(Request $request)
    {
        $refreshToken = $request->input('refreshToken');
        if (!$refreshToken) return response()->json(['message' => 'Refresh token chybí.'], 401);

        $hashedRefreshToken = hash('sha256', $refreshToken);
        $dbRefreshToken = RefreshToken::where('token', $hashedRefreshToken)
                                     ->where('expires_at', '>', now())
                                     ->first();

        if (!$dbRefreshToken || !$dbRefreshToken->user) {
            Log::warning('Invalid refresh token attempt.');
            return response()->json(['message' => 'Neplatný obnovovací token.'], 401);
        }

        $user = $dbRefreshToken->user;
        $user->tokens()->delete();
        $dbRefreshToken->delete();

        $newAccessToken = $user->createToken('access-token', ['*'], now()->addMinutes(30))->plainTextToken;
        $newRefreshToken = Str::random(60);

        RefreshToken::create([
            'user_login_id' => $user->user_login_id,
            'token' => hash('sha256', $newRefreshToken),
            'expires_at' => now()->addDays(7),
        ]);

        return response()->json([
            'token' => $newAccessToken,
            'refreshToken' => $newRefreshToken,
        ], 200);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        $refreshToken = $request->input('refreshToken');
        if ($refreshToken) {
            RefreshToken::where('token', hash('sha256', $refreshToken))->delete();
        }

        Log::info('User logged out.');
        return response()->json(['message' => 'Odhlášení úspěšné!'], 200);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Neautorizováno.'], 401);

        $user->load('roles.permissions');
        return response()->json([
            'user' => $user,
            'user_roles' => $user->roles->pluck('role_name'),
            'user_permissions' => $user->roles->flatMap(function ($role) {
                return $role->permissions->pluck('permission_key');
            })->unique()->values(),
        ]);
    }
}