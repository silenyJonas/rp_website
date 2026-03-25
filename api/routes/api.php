<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Web\WebRawRequestCommissionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\Core\CoreRoleController;
use App\Http\Controllers\Api\Web\WebLogController;
use App\Http\Controllers\Api\TranslationController;
use App\Http\Controllers\Api\Web\WebSalesLeadController;
use App\Http\Controllers\Api\Web\WebNewsController;
use App\Http\Controllers\Api\Web\WebSalesOrderController;
use App\Http\Controllers\Api\Web\WebSupportTicketController;
use App\Http\Controllers\Api\Web\WebJobApplicationController;
use Illuminate\Support\Facades\Storage;

Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});

// --- public routes ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

Route::post('raw_request_commissions', [WebRawRequestCommissionController::class, 'store']);
Route::post('sales_orders', [WebSalesOrderController::class, 'store']);
Route::post('job_applications', [WebJobApplicationController::class, 'store']);

Route::get('/download-file/{folder}/{file}', function ($folder, $file) {
    $path = $folder . '/' . $file;
    if (!Storage::disk('public')->exists($path)) abort(404);
    return Storage::disk('public')->download($path);
})->where('file', '.*');

// --- protected routes ---
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/save-translations', [TranslationController::class, 'save']);

    // Job Applications
    Route::prefix('job_applications')->group(function () {
        Route::get('/{jobApplication}/details', [WebJobApplicationController::class, 'show']); 
        Route::post('/{id}/restore', [WebJobApplicationController::class, 'restore']);
        Route::delete('/force-delete-all', [WebJobApplicationController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('job_applications', WebJobApplicationController::class)->except(['store', 'create', 'edit']);

    // WebLog
    Route::prefix('web_log')->group(function () {
        Route::get('/', [WebLogController::class, 'index']);
        Route::post('/', [WebLogController::class, 'store']);
        Route::get('/{WebLog}/details', [WebLogController::class, 'show']);
    });
    
    // Support Tickets
    Route::prefix('support_tickets')->group(function () {
        Route::get('/{supportTicket}/details', [WebSupportTicketController::class, 'show']); 
        Route::post('/{id}/restore', [WebSupportTicketController::class, 'restore']);
        Route::delete('/force-delete-all', [WebSupportTicketController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('support_tickets', WebSupportTicketController::class);

    // RawRequestCommission
    Route::prefix('raw_request_commissions')->group(function () {
        Route::get('/{rawRequestCommission}/details', [WebRawRequestCommissionController::class, 'show']);
        Route::post('/{rawRequestCommission}/restore', [WebRawRequestCommissionController::class, 'restore']);
        Route::delete('/force-delete-all', [WebRawRequestCommissionController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('raw_request_commissions', WebRawRequestCommissionController::class)->except(['store', 'create', 'edit']);

    // SalesOrder
    Route::prefix('sales_orders')->group(function () {
        Route::get('/{sales_order}/details', [WebSalesOrderController::class, 'show']); 
        Route::post('/{id}/restore', [WebSalesOrderController::class, 'restore']);
        Route::delete('/force-delete-all', [WebSalesOrderController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('sales_orders', WebSalesOrderController::class)->except(['store', 'create', 'edit']);

    // News
    Route::prefix('news')->group(function () {
        Route::get('/{news}/details', [WebNewsController::class, 'show']);
        Route::post('/{news}/restore', [WebNewsController::class, 'restore']);
        Route::delete('/force-delete-all', [WebNewsController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('news', WebNewsController::class);

    // --- SEKCE UŽIVATELÉ (Sjednoceno pod UserController) ---
    // Prefix ponechán 'users' pro zpětnou kompatibilitu s Angular frontedem
    Route::prefix('users')->group(function () {
        Route::post('/', [UserController::class, 'store']);
        // Všimni si změny parametru na {user} – Laravel provede Route Model Binding na model User
        Route::get('/{user}/details', [UserController::class, 'show']);
        Route::post('/{id}/restore', [UserController::class, 'restore']);
        Route::put('/{id}/change-password', [UserController::class, 'changePassword']);
        Route::delete('/force-delete-all', [UserController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('users', UserController::class)->except(['store', 'create', 'edit']);

    // Roles
    Route::prefix('roles')->group(function () {
        Route::post('/', [CoreRoleController::class, 'store']);
        Route::post('/{role}/restore', [CoreRoleController::class, 'restore']);
        Route::delete('/force-delete-all', [CoreRoleController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('roles', CoreRoleController::class)->except(['store', 'create', 'edit']);

    // SalesLeads
    Route::prefix('sales_leads')->group(function () {
        Route::get('/{salesLead}/details', [WebSalesLeadController::class, 'show']);
        Route::post('/{salesLead}/restore', [WebSalesLeadController::class, 'restore']);
        Route::delete('/force-delete-all', [WebSalesLeadController::class, 'forceDeleteAllTrashed']);
    });
    Route::apiResource('sales_leads', WebSalesLeadController::class);
});