<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RawRequestCommissionController;
use App\Http\Controllers\Api\UserLoginController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\BusinessLogController; // Import nového controlleru

Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});

// Veřejné routy
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);
Route::get('/business_logs', [BusinessLogController::class, 'index']);

// Routy vyžadující autentizaci
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Nová routa pro BusinessLogs
    // Route::get('/business_logs', [BusinessLogController::class, 'index']);

    // Skupina rout pro RawRequestCommission
    Route::prefix('raw_request_commissions')->group(function () {
        Route::get('/{rawRequestCommission}/details', [RawRequestCommissionController::class, 'showDetails']);
        Route::post('/{rawRequestCommission}/restore', [RawRequestCommissionController::class, 'restore']);
        Route::delete('/force-delete-all', [RawRequestCommissionController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store', 'create', 'edit']);

    // Skupina rout pro UserLogin
    Route::prefix('user_login')->group(function () {
        Route::post('/', [UserLoginController::class, 'store']);
        Route::get('/{userLogin}/details', [UserLoginController::class, 'showDetails']);
        Route::post('/{userLogin}/restore', [UserLoginController::class, 'restore']);
        Route::delete('/force-delete-all', [UserLoginController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('user_login', UserLoginController::class)->except(['store', 'create', 'edit']);


    // Skupina rout pro Roles
    Route::prefix('roles')->group(function () {
        Route::post('/', [RoleController::class, 'store']);
        Route::post('/{role}/restore', [RoleController::class, 'restore']);
        Route::delete('/force-delete-all', [RoleController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('roles', RoleController::class)->except(['store', 'create', 'edit']);
});
