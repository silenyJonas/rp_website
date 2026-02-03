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
use App\Http\Controllers\Api\SalesOrderController;
use App\Http\Controllers\Api\SupportTicketController; // Import nového controlleru

Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});

// --- VEŘEJNÉ ROUTY (Public) ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// Veřejné odesílání formulářů (nepotřebuje token)
Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);
Route::post('sales_orders', [SalesOrderController::class, 'store']);


// --- ROUTY VYŽADUJÍCÍ AUTENTIZACI (Protected) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/save-translations', [TranslationController::class, 'save']);

    // BusinessLogs
    Route::prefix('business_logs')->group(function () {
        Route::get('/', [BusinessLogController::class, 'index']);
        Route::get('/{businessLog}/details', [BusinessLogController::class, 'showDetails']);
    });
    
    // Support Tickets (NOVÉ)
    Route::prefix('support_tickets')->group(function () {
        Route::get('/{supportTicket}/details', [SupportTicketController::class, 'show']); 
        Route::post('/{id}/restore', [SupportTicketController::class, 'restore']);
        Route::delete('/force-delete-all', [SupportTicketController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('support_tickets', SupportTicketController::class);

    // RawRequestCommission
    Route::prefix('raw_request_commissions')->group(function () {
        Route::get('/{rawRequestCommission}/details', [RawRequestCommissionController::class, 'showDetails']);
        Route::post('/{rawRequestCommission}/restore', [RawRequestCommissionController::class, 'restore']);
        Route::delete('/force-delete-all', [RawRequestCommissionController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store', 'create', 'edit']);

    // SalesOrder (Administrace)
    Route::prefix('sales_orders')->group(function () {
        Route::get('/{salesOrder}/details', [SalesOrderController::class, 'show']); 
        Route::post('/{id}/restore', [SalesOrderController::class, 'restore']);
        Route::delete('/force-delete-all', [SalesOrderController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('sales_orders', SalesOrderController::class)->except(['store', 'create', 'edit']);

    // News
    Route::prefix('news')->group(function () {
        Route::get('/{news}/details', [NewsController::class, 'showDetails']);
        Route::post('/{news}/restore', [NewsController::class, 'restore']);
        Route::delete('/force-delete-all', [NewsController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('news', NewsController::class);

    // UserLogin
    Route::prefix('user_login')->group(function () {
        Route::post('/', [UserLoginController::class, 'store']);
        Route::get('/{userLogin}/details', [UserLoginController::class, 'showDetails']);
        Route::post('/{userLogin}/restore', [UserLoginController::class, 'restore']);
        Route::delete('/force-delete-all', [UserLoginController::class, 'forceDeleteAllTrashed']);
        Route::post('/{userLogin}/change-password', [UserLoginController::class, 'changePassword']);
    });
    Route::apiResource('user_login', UserLoginController::class)->except(['store', 'create', 'edit']);

    // Roles
    Route::prefix('roles')->group(function () {
        Route::post('/', [RoleController::class, 'store']);
        Route::post('/{role}/restore', [RoleController::class, 'restore']);
        Route::delete('/force-delete-all', [RoleController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('roles', RoleController::class)->except(['store', 'create', 'edit']);

    // SalesLeads
    Route::prefix('sales_leads')->group(function () {
        Route::get('/{salesLead}/details', [SalesLeadController::class, 'showDetails']);
        Route::post('/{salesLead}/restore', [SalesLeadController::class, 'restore']);
        Route::delete('/force-delete-all', [SalesLeadController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('sales_leads', SalesLeadController::class);
});