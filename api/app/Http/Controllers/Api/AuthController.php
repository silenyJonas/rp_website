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

            // 1. Generování přístupového tokenu (Access Token)
            // Nastavíme mu krátkou životnost (např. 15 minut)
            // ZMĚNA ZDE: Pro účely testování nastavíme expiraci na 10 sekund
            $accessToken = $user->createToken('access-token', ['*'], now()->addSeconds(10))->plainTextToken;

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

            // Vrátíme oba tokeny v těle JSON odpovědi
            return response()->json([
                'message' => 'Přihlášení úspěšné!',
                'user' => $user,
                'token' => $accessToken,
                'refreshToken' => $refreshToken, // Vrátíme NEHASHUJE obnovovací token klientovi
            ], 200); // Již nenasazujeme cookie

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
        // Očekáváme NEHASHUJE refresh token v těle požadavku
        $refreshToken = $request->input('refreshToken');

        if (!$refreshToken) {
            Log::warning('Refresh token not found in request body.');
            return response()->json(['message' => 'Refresh token chybí.'], 401);
        }

        $hashedRefreshToken = hash('sha256', $refreshToken); // Hashujeme přijatý token pro porovnání
        $dbRefreshToken = RefreshToken::where('token', $hashedRefreshToken) // Hledáme podle HASHe
                                    ->where('expires_at', '>', now())
                                    ->first();

        if (!$dbRefreshToken || !$dbRefreshToken->user) {
            Log::warning('Invalid or expired refresh token.');
            return response()->json(['message' => 'Neplatný nebo vypršelý obnovovací token.'], 401);
        }

        $user = $dbRefreshToken->user;

        // Zneplatníme staré přístupové tokeny uživatele
        $user->tokens()->delete();

        // Zneplatníme starý obnovovací token z databáze
        $dbRefreshToken->delete();

        // Vygenerujeme nový přístupový token
        // ZMĚNA ZDE: Pro účely testování nastavíme expiraci na 10 sekund
        // $newAccessToken = $user->createToken('access-token', ['*'], now()->addMinutes(30))->plainTextToken;
        $newAccessToken = $user->createToken('access-token', ['*'], now()->addSecond(10))->plainTextToken;

        // Vygenerujeme nový obnovovací token (NEHASHUJE SE)
        $newRefreshToken = Str::random(60);
        $hashedNewRefreshToken = hash('sha256', $newRefreshToken); // Hashujeme pro uložení v DB

        RefreshToken::create([
            'user_login_id' => $user->user_login_id,
            'token' => $hashedNewRefreshToken, // Ukládáme HASH
            'expires_at' => now()->addDays(7),
        ]);

        Log::info('Tokens refreshed successfully for user: ' . $user->user_email);

        return response()->json([
            'message' => 'Tokeny úspěšně obnoveny.',
            'token' => $newAccessToken,
            'refreshToken' => $newRefreshToken, // Vrátíme NEHASHUJE nový obnovovací token klientovi
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
            // Zneplatní všechny přístupové tokeny aktuálního uživatele
            $request->user()->tokens()->delete();
        }

        // Očekáváme NEHASHUJE refresh token z frontendu
        $refreshToken = $request->input('refreshToken') ?: $request->bearerToken(); // Zkusí z těla nebo z Bearer tokenu

        if ($refreshToken) {
            $hashedRefreshToken = hash('sha256', $refreshToken); // Hashujeme přijatý token pro porovnání
            RefreshToken::where('token', $hashedRefreshToken)->delete(); // Smažeme podle HASHe
        }

        Log::info('User logged out. Tokens revoked.');

        // Žádné cookie k mazání
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
        return response()->json($request->user());
    }
}
