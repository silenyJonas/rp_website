<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RawRequestCommissionController;

// --- Veřejné routy (nevyžadují autentizaci) ---

// Routa pro získání CSRF cookie (pro tokeny již není striktně nutná, ale může zůstat)
// Toto volání je primárně pro session-based Sanctum, ale neškodí ho ponechat.
// Pro tokeny se nebude používat pro autentizaci.
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});

// Routa pro přihlášení uživatele.
// Zde se po úspěšném ověření credentials vygeneruje a vrátí API token (Bearer token).
Route::post('/login', [AuthController::class, 'login']);


// --- Chráněné routy (vyžadují autentizaci pomocí Bearer Tokenu) ---

// Všechny routy uvnitř této skupiny budou chráněny middlewarem 'auth:sanctum'.
// JAK JSME DISKUTOVALI: Laravel Sanctum je balíček, který podporuje jak session, tak API tokeny.
// Když klient pošle Bearer token v hlavičce 'Authorization', 'auth:sanctum' middleware
// automaticky ověří tento token proti tabulce 'personal_access_tokens'.
// Tedy, validace pro tyto routy BUDE probíhat přes tokeny, ne přes session.
Route::middleware('auth:sanctum')->group(function () {

    // Routa pro odhlášení uživatele.
    // Zde se token uživatele zneplatní na straně serveru.
    Route::post('/logout', [AuthController::class, 'logout']);

    // Routa pro získání informací o aktuálně přihlášeném uživateli.
    // Uživatel je identifikován na základě Bearer tokenu.
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // API Resource routy pro RawRequestCommissionController.
    // Přístup k těmto routám bude povolen pouze s platným Bearer tokenem.
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class);

    // Pokud máte další API resource, přidejte je sem
});
