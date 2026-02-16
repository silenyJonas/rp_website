<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Log};
use App\Models\{User, RefreshToken};
use Illuminate\Support\Str;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required',
        ]);

        if (Auth::attempt(['user_email' => $request->email, 'password' => $request->password])) {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            $user->update(['last_login_at' => now()]);
            $user->load('roles.permissions');

            // Vygenerování tokenů
            $accessToken = $user->createToken('access-token', ['*'], now()->addMinutes(60))->plainTextToken;
            $refreshToken = Str::random(60);
            
            // Vyčištění starých a vytvoření nového refresh tokenu
            RefreshToken::where('user_id', $user->id)->delete();
            RefreshToken::create([
                'user_id'    => $user->id,
                'token'      => hash('sha256', $refreshToken),
                'expires_at' => now()->addDays(7),
            ]);
            
            return response()->json([
                'message'          => 'Přihlášení úspěšné!',
                'user'             => new UserResource($user),
                'user_roles'       => $user->roles->pluck('role_name'),
                'user_permissions' => method_exists($user, 'getPermissionsAttribute') ? $user->getPermissionsAttribute() : [], 
                'token'            => $accessToken,
                'refreshToken'     => $refreshToken,
            ], 200);
        }

        return response()->json(['message' => 'Neplatné přihlašovací údaje.'], 401);
    }

    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $request->input('refreshToken');
        if (!$refreshToken) {
            return response()->json(['message' => 'Refresh token chybí.'], 401);
        }

        $hashedRefreshToken = hash('sha256', $refreshToken);
        $dbRefreshToken = RefreshToken::with('user')
                                     ->where('token', $hashedRefreshToken)
                                     ->where('expires_at', '>', now())
                                     ->first();

        if (!$dbRefreshToken || !$dbRefreshToken->user) {
            return response()->json(['message' => 'Neplatný nebo expirovaný token.'], 401);
        }

        $user = $dbRefreshToken->user;

        // DŮLEŽITÉ: Smazat starý token až těsně před vytvořením nového
        $dbRefreshToken->delete();
        // Volitelně: Smazat staré Access Tokeny pro čistotu DB
        $user->tokens()->delete();

        $newAccessToken = $user->createToken('access-token', ['*'], now()->addMinutes(60))->plainTextToken;
        $newRefreshToken = Str::random(60);

        RefreshToken::create([
            'user_id'    => $user->id,
            'token'      => hash('sha256', $newRefreshToken),
            'expires_at' => now()->addDays(7),
        ]);

        return response()->json([
            'token'        => $newAccessToken,
            'refreshToken' => $newRefreshToken,
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }
        
        $refreshToken = $request->input('refreshToken');
        if ($refreshToken) {
            RefreshToken::where('token', hash('sha256', $refreshToken))->delete();
        }
        
        return response()->json(['message' => 'Odhlášení úspěšné!'], 200);
    }
}