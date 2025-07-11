<?php

namespace App\Http\Controllers\Api; // <-- Důležité: tento namespace už tam je, ověřte si ho

use App\Http\Controllers\Controller; // <-- Toto už tam je
use Illuminate\Http\Request; // <-- Toto už tam je
use Illuminate\Support\Facades\Auth; // <-- PŘIDAT TENTO IMPORT
use Illuminate\Support\Facades\Hash; // <-- PŘIDAT TENTO IMPORT (pokud budete hashovat hesla)
use App\Models\User; // <-- PŘIDAT TENTO IMPORT, odkazuje na váš upravený User model

class AuthController extends Controller
{
    /**
     * Handle an incoming authentication request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email', // V Angularu posíláme 'email'
            'password' => 'required',
        ]);

        // Pokus o přihlášení.
        // Auth::attempt automaticky použije metodu getAuthPassword() z vašeho modelu User
        // a porovná hashované heslo z databáze s poskytnutým heslem.
        if (Auth::attempt(['user_email' => $request->email, 'password' => $request->password])) { // <-- DŮLEŽITÉ: ZDE POUŽIJTE 'user_email' pro vaši tabulku
            $user = Auth::user();
            // Po úspěšném přihlášení Sanctum automaticky nastaví session cookie.
            return response()->json([
                'message' => 'Přihlášení úspěšné!',
                'user' => $user, // Můžete vrátit data o uživateli
            ], 200);
        }

        return response()->json([
            'message' => 'Neplatné přihlašovací údaje.'
        ], 401);
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout(); // Odhlásí aktuálního uživatele

        // Zruší session a regeneruje CSRF token. Klíčové pro bezpečné odhlášení.
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Odhlášení úspěšné!'
        ], 200);
    }

    /**
     * Get the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        // Vrací aktuálně přihlášeného uživatele.
        // Sanctum ověří uživatele na základě session cookie.
        return response()->json($request->user());
    }
}