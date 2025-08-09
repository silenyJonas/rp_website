<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RawRequestCommissionController;

Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::delete('raw_request_commissions/force-delete-all', [RawRequestCommissionController::class, 'forceDeleteAllTrashed']);
    Route::post('raw_request_commissions/{rawRequestCommission}/restore', [RawRequestCommissionController::class, 'restore']);
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store', 'create', 'edit']);
});
