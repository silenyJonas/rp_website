<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User; // Import vašeho User modelu
use Illuminate\Support\Facades\Log; // Pro diagnostiku

class AuthController extends Controller
{
    /**
     * Zpracuje příchozí požadavek na autentizaci.
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

            // --- DIAGNOSTIKA ZAČÁTEK ---
            Log::info('Login attempt successful. User object acquired.');
            Log::info('User class: ' . get_class($user));
            Log::info('User instance of Authenticatable: ' . (is_a($user, \Illuminate\Contracts\Auth\Authenticatable::class) ? 'true' : 'false'));
            Log::info('User instance of App\Models\User: ' . (is_a($user, User::class) ? 'true' : 'false'));
            Log::info('User has HasApiTokens trait: ' . (method_exists($user, 'createToken') ? 'true' : 'false'));
            // --- DIAGNOSTIKA KONEC ---

            // Generujeme nový API token pro uživatele.
            $token = $user->createToken('erp-system-token')->plainTextToken;

            return response()->json([
                'message' => 'Přihlášení úspěšné!',
                'user' => $user,
                'token' => $token,
            ], 200);
        }

        return response()->json([
            'message' => 'Neplatné přihlašovací údaje.'
        ], 401);
    }

    /**
     * Odhlásí uživatele z aplikace.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            // Zneplatní všechny tokeny aktuálního uživatele.
            $request->user()->tokens()->delete();
        }

        // Tyto řádky jsou pro session-based autentizaci.
        // Pro čistě tokenovou autentizaci je můžete zakomentovat,
        // aby se předešlo chybě "Session store not set on request".
        // Auth::guard('web')->logout();
        // $request->session()->invalidate();
        // $request->session()->regenerateToken();

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
