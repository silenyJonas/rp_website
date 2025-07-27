<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RawRequestCommissionController;

// --- Veřejné routy (nevyžadují autentizaci) ---

// Routa pro získání CSRF cookie (pro tokeny již není striktně nutná, ale může zůstat)
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});

// Routa pro přihlášení uživatele (zde se generuje přístupový a obnovovací token)
Route::post('/login', [AuthController::class, 'login']);

// Routa pro obnovení přístupového tokenu pomocí obnovovacího tokenu
Route::post('/refresh', [AuthController::class, 'refresh']);

// NOVÁ ŘEŠENÍ: Povolení POST (store) pro 'raw_request_commissions' bez autentizace
// Tato routa musí být definována PŘED Route::middleware('auth:sanctum') blokem.
Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);


// --- Chráněné routy (vyžadují autentizaci pomocí Bearer Tokenu) ---

// Všechny routy uvnitř této skupiny budou chráněny middlewarem 'auth:sanctum'.
Route::middleware('auth:sanctum')->group(function () {

    // Routa pro odhlášení uživatele (zneplatnění tokenu)
    Route::post('/logout', [AuthController::class, 'logout']);

    // Routa pro získání informací o aktuálně přihlášeném uživateli
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // API Resource routy pro RawRequestCommissionController
    // Nyní vyloučíme 'store' akci, protože jsme ji definovali jako veřejnou výše.
    // Tím zajistíme, že ostatní akce (index, show, update, destroy) zůstanou chráněné.
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store']);

    // Pokud máte další API resource, přidejte je sem
});