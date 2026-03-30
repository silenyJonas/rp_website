<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopCoupon;
use App\Models\Shop\ShopLog;
use App\Http\Resources\Shop\ShopCouponResource;
use App\Http\Requests\Shop\ShopCoupon\StoreShopCouponRequest;
use App\Http\Requests\Shop\ShopCoupon\UpdateShopCouponRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ShopCouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = ShopCoupon::query();
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('code', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"));
        }

        // Filtry na shodu
        foreach (['discount_type', 'applies_to', 'is_active'] as $f) {
            if ($request->filled($f)) $query->where($f, $request->input($f));
        }

        $query->orderBy($request->input('sort_by', 'id'), $request->input('sort_direction', 'desc'));

        $data = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN) 
            ? $query->get() 
            : $query->paginate($perPage);

        return response()->json($data instanceof \Illuminate\Support\Collection 
            ? ShopCouponResource::collection($data) 
            : [
                'data' => ShopCouponResource::collection($data->items()),
                'total' => $data->total(),
                'per_page' => $data->perPage(),
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
            ]);
    }

    public function store(StoreShopCouponRequest $request): JsonResponse
    {
        try {
            $coupon = ShopCoupon::create($request->validated());
            $this->logAction($request, 'create', 'ShopCoupon', "Vytvořen kupón: {$coupon->code}", $coupon->id);
            return response()->json(new ShopCouponResource($coupon), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Chyba při vytváření kupónu.'], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $coupon = ShopCoupon::withTrashed()->findOrFail($id);
        return response()->json(new ShopCouponResource($coupon));
    }

    public function update(UpdateShopCouponRequest $request, $id): JsonResponse
    {
        try {
            $coupon = ShopCoupon::withTrashed()->findOrFail($id);
            $coupon->update($request->validated());
            $this->logAction($request, 'update', 'ShopCoupon', "Aktualizace kupónu: {$coupon->code}", $coupon->id);
            return response()->json(new ShopCouponResource($coupon));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Aktualizace selhala.'], 500);
        }
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $force = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $item = ShopCoupon::withTrashed()->findOrFail($id);
        $force ? $item->forceDelete() : $item->delete();
        $this->logAction($request, $force ? 'hard_delete' : 'soft_delete', 'ShopCoupon', "Smazání kupónu ID: $id", $id);
        return response()->json(null, 204);
    }

    public function restore(Request $request, $id): JsonResponse
    {
        $item = ShopCoupon::withTrashed()->findOrFail($id);
        $item->restore();
        $this->logAction($request, 'restore', 'ShopCoupon', "Obnova kupónu ID: $id", $id);
        return response()->json(new ShopCouponResource($item));
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
                'affected_entity_type' => 'ShopCoupon',
                'affected_entity_id' => $affectedId,
                'user_id' => $user?->id,
                'context_data' => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain' => (string)($user?->id ?? '0'),
                'user_plain' => $user ? ($user->full_name ?? $user->user_email) : 'Systém'
            ]);
        } catch (\Exception $e) { Log::error("Log error: " . $e->getMessage()); }
    }
}