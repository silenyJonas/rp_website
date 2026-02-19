<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RawRequestCommissionController;
use App\Http\Controllers\Api\UserController; // Změněno z UserLoginController
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\BusinessLogController;
use App\Http\Controllers\Api\TranslationController;
use App\Http\Controllers\Api\SalesLeadController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\SalesOrderController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\JobApplicationController;
use Illuminate\Support\Facades\Storage;

Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});

// --- VEŘEJNÉ ROUTY (Public) ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);
Route::post('sales_orders', [SalesOrderController::class, 'store']);
Route::post('job_applications', [JobApplicationController::class, 'store']);

Route::get('/download-file/{folder}/{file}', function ($folder, $file) {
    $path = $folder . '/' . $file;
    if (!Storage::disk('public')->exists($path)) abort(404);
    return Storage::disk('public')->download($path);
})->where('file', '.*');

// --- ROUTY VYŽADUJÍCÍ AUTENTIZACI (Protected) ---
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Použijeme AuthController pro detail uživatele, aby se správně načetly role přes Resource
    Route::get('/user', [AuthController::class, 'user']);

    Route::post('/save-translations', [TranslationController::class, 'save']);

    // Job Applications
    Route::prefix('job_applications')->group(function () {
        Route::get('/{jobApplication}/details', [JobApplicationController::class, 'show']); 
        Route::post('/{id}/restore', [JobApplicationController::class, 'restore']);
        Route::delete('/force-delete-all', [JobApplicationController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('job_applications', JobApplicationController::class)->except(['store', 'create', 'edit']);

    // BusinessLogs
    Route::prefix('business_logs')->group(function () {
        Route::get('/', [BusinessLogController::class, 'index']);
        Route::post('/', [BusinessLogController::class, 'store']);
        Route::get('/{businessLog}/details', [BusinessLogController::class, 'show']);
    });
    
    // Support Tickets
    Route::prefix('support_tickets')->group(function () {
        Route::get('/{supportTicket}/details', [SupportTicketController::class, 'show']); 
        Route::post('/{id}/restore', [SupportTicketController::class, 'restore']);
        Route::delete('/force-delete-all', [SupportTicketController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('support_tickets', SupportTicketController::class);

    // RawRequestCommission
    Route::prefix('raw_request_commissions')->group(function () {
        Route::get('/{rawRequestCommission}/details', [RawRequestCommissionController::class, 'show']);
        Route::post('/{rawRequestCommission}/restore', [RawRequestCommissionController::class, 'restore']);
        Route::delete('/force-delete-all', [RawRequestCommissionController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store', 'create', 'edit']);

    // SalesOrder
    Route::prefix('sales_orders')->group(function () {
        Route::get('/{salesOrder}/details', [SalesOrderController::class, 'show']); 
        Route::post('/{id}/restore', [SalesOrderController::class, 'restore']);
        Route::delete('/force-delete-all', [SalesOrderController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('sales_orders', SalesOrderController::class)->except(['store', 'create', 'edit']);

    // News
    Route::prefix('news')->group(function () {
        Route::get('/{news}/details', [NewsController::class, 'show']);
        Route::post('/{news}/restore', [NewsController::class, 'restore']);
        Route::delete('/force-delete-all', [NewsController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('news', NewsController::class);

    // --- SEKCE UŽIVATELÉ (Sjednoceno pod UserController) ---
    // Prefix ponechán 'users' pro zpětnou kompatibilitu s Angular frontedem
    Route::prefix('users')->group(function () {
        Route::post('/', [UserController::class, 'store']);
        // Všimni si změny parametru na {user} – Laravel provede Route Model Binding na model User
        Route::get('/{user}/details', [UserController::class, 'show']);
        Route::post('/{id}/restore', [UserController::class, 'restore']);
        Route::post('/{id}/change-password', [UserController::class, 'changePassword']);
        Route::delete('/force-delete-all', [UserController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('users', UserController::class)->except(['store', 'create', 'edit']);

    // Roles
    Route::prefix('roles')->group(function () {
        Route::post('/', [RoleController::class, 'store']);
        Route::post('/{role}/restore', [RoleController::class, 'restore']);
        Route::delete('/force-delete-all', [RoleController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('roles', RoleController::class)->except(['store', 'create', 'edit']);

    // SalesLeads
    Route::prefix('sales_leads')->group(function () {
        Route::get('/{salesLead}/details', [SalesLeadController::class, 'show']);
        Route::post('/{salesLead}/restore', [SalesLeadController::class, 'restore']);
        Route::delete('/force-delete-all', [SalesLeadController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('sales_leads', SalesLeadController::class);
});