<?php

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\Api\AuthController;
// use App\Http\Controllers\Api\RawRequestCommissionController;

// // --- Veřejné routy (nevyžadují autentizaci) ---

// // Routa pro získání CSRF cookie (pro tokeny již není striktně nutná, ale může zůstat)
// Route::get('/sanctum/csrf-cookie', function (Request $request) {
//     return response()->json([], 204);
// });

// // Routa pro přihlášení uživatele (zde se generuje přístupový a obnovovací token)
// Route::post('/login', [AuthController::class, 'login']);

// // Routa pro obnovení přístupového tokenu pomocí obnovovacího tokenu
// Route::post('/refresh', [AuthController::class, 'refresh']);

// // Povolení POST (store) pro 'raw_request_commissions' bez autentizace
// Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);


// // --- Chráněné routy (vyžadují autentizaci pomocí Bearer Tokenu) ---

// Route::middleware('auth:sanctum')->group(function () {

//     // Routa pro odhlášení uživatele (zneplatnění tokenu)
//     Route::post('/logout', [AuthController::class, 'logout']);

//     // Routa pro získání informací o aktuálně přihlášeném uživateli
//     Route::get('/user', function (Request $request) {
//         return $request->user();
//     });

//     // KĽÚČOVÁ ZMENA: NOVÁ ROUTA pre obnovenie soft-deleted záznamu.
//     // Táto routa musí byť definovaná PRED apiResource, aby nedošlo ku konfliktu.
//     Route::put('raw_request_commissions/{id}/restore', [RawRequestCommissionController::class, 'restore']);

//     // API Resource routy pro RawRequestCommissionController
//     // Nyní vyloučíme 'store' akci, protože jsme ji definovali jako veřejnou výše.
//     Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store']);

// });

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RawRequestCommissionController;

// --- Veřejné routy (nevyžadují autentizaci) ---

// Routa pro získání CSRF cookie
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});

// Routa pro přihlášení uživatele (zde se generuje přístupový a obnovovací token)
Route::post('/login', [AuthController::class, 'login']);

// Routa pro obnovení přístupového tokenu pomocí obnovovacího tokenu
Route::post('/refresh', [AuthController::class, 'refresh']);

// Routa pro uložení nového požadavku bez autentizace
Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);


// --- Chráněné routy (vyžadují autentizaci pomocí Bearer Tokenu) ---

Route::middleware('auth:sanctum')->group(function () {

    // Routa pro odhlášení uživatele (zneplatnění tokenu)
    Route::post('/logout', [AuthController::class, 'logout']);

    // Routa pro získání informací o aktuálně přihlášeném uživateli
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // KĽÚČOVÁ ZMENA: NOVÁ ROUTA pre obnovenie soft-deleted záznamu.
    // Táto routa musí byť definovaná PRED apiResource, aby nedošlo ku konfliktu.
    Route::put('raw_request_commissions/{id}/restore', [RawRequestCommissionController::class, 'restore']);

    // API Resource routy pro RawRequestCommissionController
    // Nyní vyloučíme 'store' akci, protože jsme ji definovali jako veřejnou výše.
    // Dále vyloučíme 'create' a 'edit', protože se jedná o API, ne o webové rozhraní.
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store', 'create', 'edit']);

});
