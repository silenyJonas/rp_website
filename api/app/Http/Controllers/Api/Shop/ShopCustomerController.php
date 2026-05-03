<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopCustomer;
use App\Models\Shop\ShopLog;
use App\Http\Resources\Shop\ShopCustomerResource;
use App\Http\Requests\Shop\ShopCustomer\StoreShopCustomerRequest;
use App\Http\Requests\Shop\ShopCustomer\UpdateShopCustomerRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ShopCustomerController extends Controller
{
    /**
     * Seznam zákazníků s filtrováním
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = ShopCustomer::query();
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        // Vyhledávání
        if ($s = $request->input('search')) {
            $query->where(fn($q) => 
                $q->where('email', 'like', "%$s%")
                  ->orWhere('first_name', 'like', "%$s%")
                  ->orWhere('last_name', 'like', "%$s%")
                  ->orWhere('phone', 'like', "%$s%")
            );
        }

        // Filtry
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $data = $noPagination ? $query->get() : $query->paginate($perPage);

        if ($noPagination) {
            return response()->json(ShopCustomerResource::collection($data));
        }

        return response()->json([
            'data' => ShopCustomerResource::collection($data->items()),
            'total' => $data->total(),
            'per_page' => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page' => $data->lastPage(),
        ]);
    }

    /**
     * Vytvoření nového zákazníka
     */
    public function store(StoreShopCustomerRequest $request): JsonResponse
    {
        Log::info("ShopCustomer Store started", ['payload' => $request->all()]);

        try {
            $customer = ShopCustomer::create($request->validated());
            Log::info("Customer created", ['id' => $customer->id]);
            
            $this->logAction($request, 'create', 'ShopCustomer', "Vytvořen zákazník: {$customer->getFullName()}", $customer->id);
            return response()->json(new ShopCustomerResource($customer), 201);
        } catch (\Exception $e) {
            Log::error("ShopCustomer creation error: " . $e->getMessage());
            return response()->json(['message' => 'Vytvoření zákazníka selhalo: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Detail zákazníka
     */
    public function show($id): JsonResponse
    {
        $customer = ShopCustomer::findOrFail($id);
        return response()->json(new ShopCustomerResource($customer));
    }

    /**
     * Aktualizace zákazníka
     */
    public function update(UpdateShopCustomerRequest $request, $id): JsonResponse
    {
        Log::info("ShopCustomer Update started", ['id' => $id, 'payload' => $request->all()]);

        try {
            $customer = ShopCustomer::findOrFail($id);
            $customer->update($request->validated());
            
            Log::info("Customer updated", ['id' => $id]);
            $this->logAction($request, 'update', 'ShopCustomer', "Aktualizace zákazníka: {$customer->getFullName()}", $customer->id);
            return response()->json(new ShopCustomerResource($customer));
        } catch (\Exception $e) {
            Log::error("ShopCustomer update error: " . $e->getMessage());
            return response()->json(['message' => 'Aktualizace selhala: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Smazání zákazníka
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
            $customer = ShopCustomer::withTrashed()->findOrFail($id);

            if ($forceDelete) {
                Log::info("Performing hard delete for customer", ['id' => $id]);
                $customer->forceDelete();
            } else {
                Log::info("Performing soft delete for customer", ['id' => $id]);
                $customer->delete();
            }

            $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'ShopCustomer', "Smazání zákazníka ID: $id", $id);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("ShopCustomer delete error: " . $e->getMessage());
            return response()->json(['message' => 'Smazání zákazníka selhalo.'], 500);
        }
    }

    /**
     * Obnova z koše
     */
    public function restore(Request $request, $id): JsonResponse
    {
        try {
            $customer = ShopCustomer::withTrashed()->findOrFail($id);
            $customer->restore();

            Log::info("Customer restored", ['id' => $id]);
            $this->logAction($request, 'restore', 'ShopCustomer', "Obnova zákazníka ID: $id", $id);
            return response()->json(new ShopCustomerResource($customer));
        } catch (\Exception $e) {
            Log::error("ShopCustomer restore error: " . $e->getMessage());
            return response()->json(['message' => 'Obnova zákazníka selhala.'], 500);
        }
    }

    /**
     * Vyprázdnění koše
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        try {
            $trashedCustomers = ShopCustomer::onlyTrashed()->get();
            $count = $trashedCustomers->count();

            foreach ($trashedCustomers as $customer) {
                $customer->forceDelete();
            }

            Log::info("Trashed customers emptied", ['deleted_count' => $count]);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("ShopCustomer force delete all error: " . $e->getMessage());
            return response()->json(['message' => 'Vyprázdnění koše selhalo.'], 500);
        }
    }

    /**
     * Logování akcí
     */
    protected function logAction(Request $request, string $eventType, string $module, string $description, ?int $affectedId = null): void
    {
        try {
            $user = $request->user() ?? auth('sanctum')->user();
            ShopLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'ShopCustomer',
                'affected_entity_id' => $affectedId,
                'user_id' => $user?->id,
                'context_data' => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain' => (string)($user?->id ?? '0'),
                'user_plain' => $user ? ($user->full_name ?? $user->user_email) : 'Systém'
            ]);
        } catch (\Exception $e) {
            Log::error("Log action error: " . $e->getMessage());
        }
    }
}