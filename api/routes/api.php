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
        Route::apiResource('raw_request_commissions', RawRequestCommissionController::class);

        // Pokud máte další API resource, přidejte je sem
    });
    