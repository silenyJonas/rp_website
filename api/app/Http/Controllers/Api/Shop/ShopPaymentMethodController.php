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
        // 🔒 BEZPEČNOSTNÍ POJISTKA: Zamezení vytváření nových metod přes API
        return response()->json(['message' => 'Vytváření nových platebních metod je zakázáno.'], 403);
    }

    public function show($id): JsonResponse
    {
        $method = ShopPaymentMethod::withTrashed()->findOrFail($id);
        return response()->json(new ShopPaymentMethodResource($method));
    }

    public function update(UpdateShopPaymentMethodRequest $request, $id): JsonResponse
    {
        try {
            $method = ShopPaymentMethod::withTrashed()->findOrFail($id);
            $validated = $request->validated();
            
            // 🔒 BEZPEČNOSTNÍ POJISTKA: Nedovolíme změnit unikátní kód metody a poskytovatele,
            // protože na tyto řetězce bude navázána pevná procesní logika aplikace.
            unset($validated['code']);
            unset($validated['provider']);

            $method->update($validated);

            $this->logAction($request, 'update', 'ShopPaymentMethod', "Aktualizace platební metody: {$method->name}", $method->id);

            return response()->json(new ShopPaymentMethodResource($method));
            
        } catch (\Exception $e) {
            Log::error("Payment method update error: " . $e->getMessage());
            return response()->json(['message' => 'Aktualizace selhala.'], 500);
        }
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        // 🔒 BEZPEČNOSTNÍ POJISTKA: Fixní metody se nesmí mazat, pouze deaktivovat přes 'is_active'
        return response()->json(['message' => 'Systémové platební metody nelze smazat, pouze deaktivovat.'], 403);
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
            $user = $request->user() ?? auth('sanctum')->user();
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