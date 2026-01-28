<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RawRequestCommissionController;
use App\Http\Controllers\Api\UserLoginController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\BusinessLogController;
use App\Http\Controllers\Api\TranslationController;
use App\Http\Controllers\Api\SalesLeadController;
use App\Http\Controllers\Api\NewsController;

Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});

// --- VEŘEJNÉ ROUTY ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);


    Route::prefix('news')->group(function () {
        Route::get('/{news}/details', [NewsController::class, 'showDetails']);
        Route::post('/{news}/restore', [NewsController::class, 'restore']);
        Route::delete('/force-delete-all', [NewsController::class, 'forceDeleteAllTrashed']);
    });
    // Zahrnuje index, show, store, update, destroy
    Route::apiResource('news', NewsController::class);
// ------------------------------------------------------

// --- ROUTY VYŽADUJÍCÍ AUTENTIZACI ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/save-translations', [TranslationController::class, 'save']);

    // Skupina rout pro BusinessLogs
    Route::prefix('business_logs')->group(function () {
        Route::get('/', [BusinessLogController::class, 'index']);
        Route::get('/{businessLog}/details', [BusinessLogController::class, 'showDetails']);
    });
    
    // Skupina rout pro RawRequestCommission
    Route::prefix('raw_request_commissions')->group(function () {
        Route::get('/{rawRequestCommission}/details', [RawRequestCommissionController::class, 'showDetails']);
        Route::post('/{rawRequestCommission}/restore', [RawRequestCommissionController::class, 'restore']);
        Route::delete('/force-delete-all', [RawRequestCommissionController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store', 'create', 'edit']);

    // --- NEWS - KOMPLETNĚ ZA AUTHENTIZACÍ ---
    // Route::prefix('news')->group(function () {
    //     Route::get('/{news}/details', [NewsController::class, 'showDetails']);
    //     Route::post('/{news}/restore', [NewsController::class, 'restore']);
    //     Route::delete('/force-delete-all', [NewsController::class, 'forceDeleteAllTrashed']);
    // });
    // // Zahrnuje index, show, store, update, destroy
    // Route::apiResource('news', NewsController::class);

    // Skupina rout pro UserLogin
    Route::prefix('user_login')->group(function () {
        Route::post('/', [UserLoginController::class, 'store']);
        Route::get('/{userLogin}/details', [UserLoginController::class, 'showDetails']);
        Route::post('/{userLogin}/restore', [UserLoginController::class, 'restore']);
        Route::delete('/force-delete-all', [UserLoginController::class, 'forceDeleteAllTrashed']);
        Route::post('/{userLogin}/change-password', [UserLoginController::class, 'changePassword']);
    });
    Route::apiResource('user_login', UserLoginController::class)->except(['store', 'create', 'edit']);

    // Skupina rout pro Roles
    Route::prefix('roles')->group(function () {
        Route::post('/', [RoleController::class, 'store']);
        Route::post('/{role}/restore', [RoleController::class, 'restore']);
        Route::delete('/force-delete-all', [RoleController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('roles', RoleController::class)->except(['store', 'create', 'edit']);

    // Skupina rout pro SalesLeads
    Route::prefix('sales_leads')->group(function () {
        Route::get('/{salesLead}/details', [SalesLeadController::class, 'showDetails']);
        Route::post('/{salesLead}/restore', [SalesLeadController::class, 'restore']);
        Route::delete('/force-delete-all', [SalesLeadController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('sales_leads', SalesLeadController::class);
});