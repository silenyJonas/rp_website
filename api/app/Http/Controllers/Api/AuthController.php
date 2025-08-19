<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\RefreshToken;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Zpracuje příchozí požadavek na autentizaci.
     * Generuje přístupový token a obnovovací token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt(['user_email' => $request->email, 'password' => $request->password])) {
            $user = Auth::user();

            Log::info('Login attempt successful. User object acquired.');

            // AKTUALIZACE: Nastavení času posledního přihlášení
            $user->update(['last_login_at' => now()]);

            try {
                // Načtení rolí pro autentizovaného uživatele.
                $user->load('roles');

                // Získáme pole názvů rolí
                $userRoles = $user->roles->pluck('role_name');
            } catch (\Exception $e) {
                Log::error('Chyba při načítání rolí: ' . $e->getMessage());
                // Vrátíme konkrétní chybovou zprávu, která pomůže s laděním
                return response()->json([
                    'message' => 'Nastala chyba na serveru. Nelze načíst role uživatele.',
                    'error_details' => $e->getMessage()
                ], 500);
            }
            
            // 1. Generování přístupového tokenu (Access Token)
            // Nastavíme životnost na 30 minut
            $accessToken = $user->createToken('access-token', ['*'], now()->addMinutes(30))->plainTextToken;

            // 2. Generování obnovovacího tokenu (Refresh Token)
            $refreshToken = Str::random(60); // Generujeme náhodný řetězec (NEHASHUJE SE)
            $hashedRefreshToken = hash('sha256', $refreshToken); // Hashujeme pro uložení v DB

            // Uložení HASHovaného obnovovacího tokenu do databáze
            // Smažeme staré obnovovací tokeny pro uživatele, aby měl vždy jen jeden aktivní
            RefreshToken::where('user_login_id', $user->user_login_id)->delete();
            RefreshToken::create([
                'user_login_id' => $user->user_login_id,
                'token' => $hashedRefreshToken, // Ukládáme HASH
                'expires_at' => now()->addDays(7), // Obnovovací token platí déle (např. 7 dní)
            ]);
            
            // Vrátíme oba tokeny v těle JSON odpovědi a přidáme pole s názvy rolí
            return response()->json([
                'message' => 'Přihlášení úspěšné!',
                'user' => $user,
                'user_roles' => $userRoles, // Vrací pole s názvy rolí
                'token' => $accessToken,
                'refreshToken' => $refreshToken, // Vrátíme NEHASHUJE obnovovací token klientovi
            ], 200);
        }

        return response()->json([
            'message' => 'Neplatné přihlašovací údaje.'
        ], 401);
    }

    /**
     * Obnoví přístupový token pomocí obnovovacího tokenu z těla požadavku.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(Request $request)
    {
        $refreshToken = $request->input('refreshToken');

        if (!$refreshToken) {
            Log::warning('Refresh token not found in request body.');
            return response()->json(['message' => 'Refresh token chybí.'], 401);
        }

        $hashedRefreshToken = hash('sha256', $refreshToken);
        $dbRefreshToken = RefreshToken::where('token', $hashedRefreshToken)
                                     ->where('expires_at', '>', now())
                                     ->first();

        if (!$dbRefreshToken || !$dbRefreshToken->user) {
            Log::warning('Invalid or expired refresh token.');
            return response()->json(['message' => 'Neplatný nebo vypršelý obnovovací token.'], 401);
        }

        $user = $dbRefreshToken->user;

        // Před vydáním nových tokenů smažeme staré
        $user->tokens()->delete();
        $dbRefreshToken->delete();

        $newAccessToken = $user->createToken('access-token', ['*'], now()->addMinutes(30))->plainTextToken;
        $newRefreshToken = Str::random(60);
        $hashedNewRefreshToken = hash('sha256', $newRefreshToken);

        RefreshToken::create([
            'user_login_id' => $user->user_login_id,
            'token' => $hashedNewRefreshToken,
            'expires_at' => now()->addDays(7),
        ]);

        Log::info('Tokens refreshed successfully for user: ' . $user->user_email);

        return response()->json([
            'message' => 'Tokeny úspěšně obnoveny.',
            'token' => $newAccessToken,
            'refreshToken' => $newRefreshToken,
        ], 200);
    }

    /**
     * Odhlásí uživatele z aplikace.
     * Zneplatní všechny přístupové i obnovovací tokeny.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        $refreshToken = $request->input('refreshToken') ?: $request->bearerToken();

        if ($refreshToken) {
            $hashedRefreshToken = hash('sha256', $refreshToken);
            RefreshToken::where('token', $hashedRefreshToken)->delete();
        }

        Log::info('User logged out. Tokens revoked.');

        return response()->json([
            'message' => 'Odhlášení úspěšné!'
        ], 200);
    }

    /**
     * Získá autentizovaného uživatele.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Uživatel není autentizovaný.'], 401);
        }

        try {
            // Načtení rolí pro autentizovaného uživatele
            $user->load('roles');
            // Získáme pole názvů rolí
            $userRoles = $user->roles->pluck('role_name');

            return response()->json([
                'user' => $user,
                'user_roles' => $userRoles,
            ]);
        } catch (\Exception $e) {
            Log::error('Chyba při načítání rolí: ' . $e->getMessage());
            // Vrátíme konkrétní chybovou zprávu, která pomůže s laděním
            return response()->json([
                'message' => 'Nastala chyba na serveru. Nelze načíst data uživatele.',
                'error_details' => $e->getMessage()
            ], 500);
        }
    }
}
