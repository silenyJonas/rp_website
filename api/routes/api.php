<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// Importy kontrolerů
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TranslationController;

use App\Http\Controllers\Api\Core\CoreRoleController;

use App\Http\Controllers\Api\Web\WebRawRequestCommissionController;
use App\Http\Controllers\Api\Web\WebLogController;
use App\Http\Controllers\Api\Web\WebSalesLeadController;
use App\Http\Controllers\Api\Web\WebNewsController;
use App\Http\Controllers\Api\Web\WebSalesOrderController;
use App\Http\Controllers\Api\Web\WebSupportTicketController;
use App\Http\Controllers\Api\Web\WebJobApplicationController;

use App\Http\Controllers\Api\Shop\ShopLogController;
use App\Http\Controllers\Api\Shop\ShopSupplierController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// 🟢 VEŘEJNÉ FORMULÁŘE (Zvenčí z webu bez /web prefixu)
Route::post('raw_request_commissions', [WebRawRequestCommissionController::class, 'store']);
Route::post('sales_orders', [WebSalesOrderController::class, 'store']);
Route::post('job_applications', [WebJobApplicationController::class, 'store']);

Route::get('/download-file/{folder}/{file}', function ($folder, $file) {
    $path = $folder . '/' . $file;
    if (!Storage::disk('public')->exists($path)) abort(404);
    return Storage::disk('public')->download($path);
})->where('file', '.*');


/*
|--------------------------------------------------------------------------
| Protected Routes (Auth:Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/save_translations', [TranslationController::class, 'save']);

    /*
    |--------------------------------------------------------------------------
    | ⚙️ SECTION: CORE (Sjednocení uživatelů a rolí pod jeden prefix)
    |--------------------------------------------------------------------------
    */
    Route::prefix('core')->group(function () {
        
        // Users (přesunuto sem)
        Route::prefix('users')->group(function () {
            Route::post('/', [UserController::class, 'store']);
            Route::get('/{id}/details', [UserController::class, 'show']);
            Route::post('/{id}/restore', [UserController::class, 'restore']);
            Route::put('/{id}/change-password', [UserController::class, 'changePassword']);
            Route::delete('/force-delete-all', [UserController::class, 'forceDeleteAllTrashed']);
        });
        Route::apiResource('users', UserController::class)
            ->except(['store', 'create', 'edit'])
            ->parameters(['users' => 'id']);

        // Roles
        Route::prefix('roles')->group(function () {
            Route::post('/{id}/restore', [CoreRoleController::class, 'restore']);
            Route::delete('/force-delete-all', [CoreRoleController::class, 'forceDeleteAllTrashed']);
            Route::get('/{id}/details', [CoreRoleController::class, 'show']);
        });
        Route::apiResource('roles', CoreRoleController::class)
            ->except(['store', 'create', 'edit'])
            ->parameters(['roles' => 'id']);
        
    });


    /*
    |--------------------------------------------------------------------------
    | 🛒 SECTION: SHOP
    |--------------------------------------------------------------------------
    */
    Route::prefix('shop')->group(function () {

        // Suppliers (Dodavatelé)
        Route::prefix('suppliers')->group(function () {
            Route::get('/{id}/details', [ShopSupplierController::class, 'show']);
            Route::post('/{id}/restore', [ShopSupplierController::class, 'restore']);
            Route::delete('/force-delete-all', [ShopSupplierController::class, 'forceDeleteAllTrashed']);
        });
        Route::apiResource('suppliers', ShopSupplierController::class)
            ->parameters(['suppliers' => 'id']);

        // Shop Logs
        Route::prefix('logs')->group(function () {
            Route::get('/', [ShopLogController::class, 'index']);
            Route::post('/', [ShopLogController::class, 'store']);
            Route::get('/{id}/details', [ShopLogController::class, 'show']);
        });

    });


    /*
    |--------------------------------------------------------------------------
    | 🌍 SECTION: WEB
    |--------------------------------------------------------------------------
    */
    Route::prefix('web')->group(function () {

        // Job Applications
        Route::prefix('job_applications')->group(function () {
            Route::get('/{id}/details', [WebJobApplicationController::class, 'show']); 
            Route::post('/{id}/restore', [WebJobApplicationController::class, 'restore']);
            Route::delete('/force-delete-all', [WebJobApplicationController::class, 'forceDeleteAllTrashed']);
        });
        Route::apiResource('job_applications', WebJobApplicationController::class)
            ->parameters(['job_applications' => 'id']); // ✅ Odstraněno except(['store']) -> funguje z adminu!

        // Web Logs
        Route::prefix('logs')->group(function () {
            Route::get('/', [WebLogController::class, 'index']);
            Route::post('/', [WebLogController::class, 'store']);
            Route::get('/{id}/details', [WebLogController::class, 'show']);
        });

        // Support Tickets
        Route::prefix('support_tickets')->group(function () {
            Route::get('/{id}/details', [WebSupportTicketController::class, 'show']); 
            Route::post('/{id}/restore', [WebSupportTicketController::class, 'restore']);
            Route::delete('/force-delete-all', [WebSupportTicketController::class, 'forceDeleteAllTrashed']);
        });
        Route::apiResource('support_tickets', WebSupportTicketController::class)
            ->parameters(['support_tickets' => 'id']);

        // RawRequestCommission
        Route::prefix('raw_request_commissions')->group(function () {
            Route::get('/{id}/details', [WebRawRequestCommissionController::class, 'show']);
            Route::post('/{id}/restore', [WebRawRequestCommissionController::class, 'restore']);
            Route::delete('/force-delete-all', [WebRawRequestCommissionController::class, 'forceDeleteAllTrashed']);
        });
        Route::apiResource('raw_request_commissions', WebRawRequestCommissionController::class)
            ->parameters(['raw_request_commissions' => 'id']); // ✅ Odstraněno except(['store']) -> funguje z adminu!

        // SalesOrder
        Route::prefix('sales_orders')->group(function () {
            Route::get('/{id}/details', [WebSalesOrderController::class, 'show']); 
            Route::post('/{id}/restore', [WebSalesOrderController::class, 'restore']);
            Route::delete('/force-delete-all', [WebSalesOrderController::class, 'forceDeleteAllTrashed']);
        });
        Route::apiResource('sales_orders', WebSalesOrderController::class)
            ->parameters(['sales_orders' => 'id']); // ✅ Odstraněno except(['store']) -> funguje z adminu!

        // News
        Route::prefix('news')->group(function () {
            Route::get('/{id}/details', [WebNewsController::class, 'show']);
            Route::post('/{id}/restore', [WebNewsController::class, 'restore']);
            Route::delete('/force-delete-all', [WebNewsController::class, 'forceDeleteAllTrashed']);
        });
        Route::apiResource('news', WebNewsController::class)
            ->parameters(['news' => 'id']);

        // SalesLeads
        Route::prefix('sales_leads')->group(function () {
            Route::get('/{id}/details', [WebSalesLeadController::class, 'show']);
            Route::post('/{id}/restore', [WebSalesLeadController::class, 'restore']);
            Route::delete('/force-delete-all', [WebSalesLeadController::class, 'forceDeleteAllTrashed']);
        });
        Route::apiResource('sales_leads', WebSalesLeadController::class)
            ->parameters(['sales_leads' => 'id']);

    });

});