<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopPaymentMethod;
use App\Models\Shop\ShopLog;
use App\Http\Resources\Shop\ShopPaymentMethodResource;
use App\Http\Requests\Shop\ShopPaymentMethod\StoreShopPaymentMethodRequest;
use App\Http\Requests\Shop\ShopPaymentMethod\UpdateShopPaymentMethodRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ShopPaymentMethodController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = ShopPaymentMethod::query();
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('name', 'like', "%$s%")
                ->orWhere('code', 'like', "%$s%")
                ->orWhere('provider', 'like', "%$s%"));
        }

        // Filtry na shodu - POUZE pokud jsou specifikovány v requesti
        foreach (['provider', 'is_active', 'is_external'] as $f) {
            if ($request->filled($f)) $query->where($f, $request->input($f));
        }

        $query->orderBy($request->input('sort_by', 'sort_order'), $request->input('sort_direction', 'asc'));

        $data = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN) 
            ? $query->get() 
            : $query->paginate($perPage);

        return response()->json($data instanceof \Illuminate\Support\Collection 
            ? ShopPaymentMethodResource::collection($data) 
            : [
                'data' => ShopPaymentMethodResource::collection($data->items()),
                'total' => $data->total(),
                'per_page' => $data->perPage(),
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
            ]);
    }

    public function store(StoreShopPaymentMethodRequest $request): JsonResponse
    {
        try {
            $method = ShopPaymentMethod::create($request->validated());
            $this->logAction($request, 'create', 'ShopPaymentMethod', "Vytvořena platební metoda: {$method->name}", $method->id);
            return response()->json(new ShopPaymentMethodResource($method), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Chyba při vytváření platební metody.'], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $method = ShopPaymentMethod::withTrashed()->findOrFail($id);
        return response()->json(new ShopPaymentMethodResource($method));
    }

    // public function update(UpdateShopPaymentMethodRequest $request, $id): JsonResponse
    // {
    //     try {
    //         $method = ShopPaymentMethod::withTrashed()->findOrFail($id);
    //         $method->update($request->validated());
    //         $this->logAction($request, 'update', 'ShopPaymentMethod', "Aktualizace platební metody: {$method->name}", $method->id);
    //         return response()->json(new ShopPaymentMethodResource($method));
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'Aktualizace selhala.'], 500);
    //     }
    // }
    /**
     * Aktualizace konkrétní platební metody.
     */
    // public function update(UpdateShopPaymentMethodRequest $request, ShopPaymentMethod $id)
    // {
    //     try {
    //         // Validovaná data získáme z requestu
    //         $validated = $request->validated();
            
    //         // Provedeme update
    //         $payment_method->update($validated);

    //         // Logování akce
    //         $this->logAction(
    //             $request, 
    //             'update', 
    //             'ShopPaymentMethod', 
    //             "Aktualizace platební metody: {$payment_method->name}", 
    //             $payment_method->id
    //         );

    //         return response()->json(new ShopPaymentMethodResource($payment_method));
    //     } catch (\Exception $e) {
    //         Log::error("Update error: " . $e->getMessage());
    //         return response()->json(['message' => 'Aktualizace selhala.'], 500);
    //     }
    // }
    /**
     * Aktualizace platební metody
     */
    public function update(UpdateShopPaymentMethodRequest $request, $id): JsonResponse
    {
        try {
            // Najdeme záznam
            $method = ShopPaymentMethod::withTrashed()->findOrFail($id);
            
            // Provedeme update pomocí validovaných dat z Requestu
            // Tady se provede skutečný zápis do databáze
            $method->update($request->validated());

            // Logování akce
            $this->logAction(
                $request, 
                'update', 
                'ShopPaymentMethod', 
                "Aktualizace platební metody: {$method->name}", 
                $method->id
            );

            // Vrátíme čerstvá data přes Resource
            return response()->json(new ShopPaymentMethodResource($method));
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Update error: " . $e->getMessage());
            return response()->json(['message' => 'Aktualizace selhala.'], 500);
        }
    }
    public function destroy(Request $request, $id): JsonResponse
    {
        $force = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $item = ShopPaymentMethod::withTrashed()->findOrFail($id);
        $force ? $item->forceDelete() : $item->delete();
        $this->logAction($request, $force ? 'hard_delete' : 'soft_delete', 'ShopPaymentMethod', "Smazání platební metody ID: $id", $id);
        return response()->json(null, 204);
    }

    public function restore(Request $request, $id): JsonResponse
    {
        $item = ShopPaymentMethod::withTrashed()->findOrFail($id);
        $item->restore();
        $this->logAction($request, 'restore', 'ShopPaymentMethod', "Obnova platební metody ID: $id", $id);
        return response()->json(new ShopPaymentMethodResource($item));
    }

    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null): void
    {
        try {
            $user = $request->user();
            ShopLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'ShopPaymentMethod',
                'affected_entity_id' => $affectedId,
                'user_id' => $user?->id,
                'context_data' => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain' => (string)($user?->id ?? '0'),
                'user_plain' => $user ? ($user->full_name ?? $user->user_email) : 'Systém'
            ]);
        } catch (\Exception $e) { Log::error("Log error: " . $e->getMessage()); }
    }
}