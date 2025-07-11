<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// Důležité: Importujte AuthController z jeho správného namespace
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RawRequestCommissionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// --- Veřejné routy (nevyžadují autentizaci) ---

// Routa pro získání CSRF cookie (vyžadováno Laravel Sanctum pro SPA autentizaci)
// Angular frontend by měl volat tuto routu před prvním POST požadavkem (např. login).
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    // <<<<<<<<<<<< ZMĚNA ZDE! Vracíme prázdný JSON s 204 No Content
    return response()->json([], 204);
});

// Routa pro přihlášení uživatele
// Tato routa přijímá přihlašovací údaje (email, password) a ověřuje je.
Route::post('/login', [AuthController::class, 'login']);


// --- Chráněné routy (vyžadují autentizaci pomocí Sanctum) ---

// Všechny routy uvnitř této této skupiny budou chráněny middlewarem 'auth:sanctum'.
// To znamená, že uživatel musí být přihlášen, aby k nim měl přístup.
Route::middleware('auth:sanctum')->group(function () {

    // Routa pro odhlášení uživatele
    Route::post('/logout', [AuthController::class, 'logout']);

    // Routa pro získání informací o aktuálně přihlášeném uživateli
    // (používá se pro kontrolu stavu přihlášení z Angularu)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    // Alternativně můžete použít metodu v AuthControlleru:
    // Route::get('/user', [AuthController::class, 'user']);


    // API Resource routy pro RawRequestCommissionController
    // TOTO JE JEDINÉ MÍSTO, KDE BY MĚLA BÝT TATO ROUTA DEFINOVÁNA.
    // 'raw_request_commissions' je správné, protože je to množné číslo.
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class);

    // Pokud máte další API resource, přidejte je sem, např.:
    // Route::apiResource('some_other_resource', SomeOtherController::class);
});

// --- DŮLEŽITÉ: Odstraněné duplicitní nebo nesprávně umístěné routy ---
// Tyto routy jsou zakomentované, protože jsou duplicitní nebo by neměly být mimo 'auth:sanctum' skupinu.
// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });
// Route::apiResource('raw_request_commissions', RawRequestCommissionController::class);
