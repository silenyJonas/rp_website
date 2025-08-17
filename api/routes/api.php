<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RawRequestCommissionController;
use App\Http\Controllers\Api\UserLoginController;
use App\Http\Controllers\Api\RoleController;


Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json([], 204);
});
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);

// Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::delete('raw_request_commissions/force-delete-all', [RawRequestCommissionController::class, 'forceDeleteAllTrashed']);
    Route::post('raw_request_commissions/{rawRequestCommission}/restore', [RawRequestCommissionController::class, 'restore']);
    Route::get('raw_request_commissions/{rawRequestCommission}/details', [RawRequestCommissionController::class, 'showDetails']);
    Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store', 'create', 'edit']);

    // Povolí metodu store na user_login
    Route::post('user_login', [UserLoginController::class, 'store']);
    Route::delete('user_login/force-delete-all', [UserLoginController::class, 'forceDeleteAllTrashed']);
    Route::post('user_login/{userLogin}/restore', [UserLoginController::class, 'restore']);
    Route::apiResource('user_login', UserLoginController::class)->except(['store', 'create', 'edit']);

    // Povolí metodu store a destroy na roles
    Route::post('roles', [RoleController::class, 'store']);
    Route::delete('roles/force-delete-all', [RoleController::class, 'forceDeleteAllTrashed']);
    Route::post('roles/{role}/restore', [RoleController::class, 'restore']);
    Route::apiResource('roles', RoleController::class)->except(['store', 'create', 'edit']);
// });

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\Api\AuthController;
// use App\Http\Controllers\Api\RawRequestCommissionController;
// use App\Http\Controllers\Api\UserLoginController;
// use App\Http\Controllers\Api\RoleController;


// Route::get('/sanctum/csrf-cookie', function (Request $request) {
//     return response()->json([], 204);
// });
// Route::post('/login', [AuthController::class, 'login']);
// Route::post('/refresh', [AuthController::class, 'refresh']);
// Route::post('raw_request_commissions', [RawRequestCommissionController::class, 'store']);

//     Route::post('/logout', [AuthController::class, 'logout']);
//     Route::get('/user', function (Request $request) {
//         return $request->user();
//     });
//     Route::delete('raw_request_commissions/force-delete-all', [RawRequestCommissionController::class, 'forceDeleteAllTrashed']);
//     Route::post('raw_request_commissions/{rawRequestCommission}/restore', [RawRequestCommissionController::class, 'restore']);
//     Route::get('raw_request_commissions/{rawRequestCommission}/details', [RawRequestCommissionController::class, 'showDetails']);
//     Route::apiResource('raw_request_commissions', RawRequestCommissionController::class)->except(['store', 'create', 'edit']);

//      Route::delete('user_login/force-delete-all', [UserLoginController::class, 'forceDeleteAllTrashed']);
//     Route::post('user_login/{userLogin}/restore', [UserLoginController::class, 'restore']);
//     Route::apiResource('user_login', UserLoginController::class)->except(['store']);

//     Route::delete('roles/force-delete-all', [RoleController::class, 'forceDeleteAllTrashed']);
//     Route::post('roles/{role}/restore', [RoleController::class, 'restore']);
//     Route::apiResource('roles', RoleController::class);

   