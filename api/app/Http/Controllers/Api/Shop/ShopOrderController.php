<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopOrder;
use App\Models\Shop\ShopOrderItem;
use App\Models\Shop\ShopProduct;
use App\Models\Shop\ShopProductVariant;
use App\Models\Shop\ShopLog;
use App\Http\Resources\Shop\ShopOrderResource;
use App\Http\Requests\Shop\ShopOrder\StoreShopOrderRequest;
use App\Http\Requests\Shop\ShopOrder\UpdateShopOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ShopOrderController extends Controller
{
    /**
     * Seznam objednávek s filtrováním
     */

/**
 * Seznam objednávek s filtrováním
 */
/**
 * Seznam objednávek s filtrováním
 */
public function index(Request $request): JsonResponse
{
    $perPage = $request->input('per_page', 15);
    $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

    $query = ShopOrder::with([
        'customer',
        'paymentMethod',
        'shippingMethod',
        'coupon',
        'items'
    ]);

    $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

    // Vyhledávání (univerzální lupa)
    if ($s = $request->input('search')) {
        $query->where(fn($q) => 
            $q->where('id', $s) 
              ->orWhere('order_number', 'like', "%$s%")
              ->orWhere('shipping_address', 'like', "%$s%")
              ->orWhereHas('customer', fn($cq) => 
                  $cq->where('email', 'like', "%$s%")
                    ->orWhere('first_name', 'like', "%$s%")
                    ->orWhere('last_name', 'like', "%$s%")
              )
        );
    }

    // --- Dedikované filtry ---

    // Filtr podle ID
    if ($request->filled('id')) {
        $query->where('id', $request->input('id'));
    }

    // Filtr podle čísla objednávky
    if ($request->filled('order_number')) {
        $query->where('order_number', 'like', '%' . $request->input('order_number') . '%');
    }

    // OPRAVA: Filtry podle stavů (podpora pro více stavů oddělených čárkou)
    if ($request->filled('status')) {
        $statusValue = $request->input('status');
        
        if (is_string($statusValue) && str_contains($statusValue, ',')) {
            // Pokud přijde "pending,confirmed,processing", uděláme z toho pole
            $statuses = explode(',', $statusValue);
            $query->whereIn('status', $statuses);
        } else {
            // Pokud přijde jen jeden stav
            $query->where('status', $statusValue);
        }
    }

    if ($request->filled('payment_status')) {
        $query->where('payment_status', $request->input('payment_status'));
    }

    // Filtry podle zákazníka a částek
    if ($request->filled('customer_id')) {
        $query->where('customer_id', $request->input('customer_id'));
    }

    if ($request->filled('amount_from')) {
        $query->where('final_amount', '>=', $request->input('amount_from'));
    }

    if ($request->filled('amount_to')) {
        $query->where('final_amount', '<=', $request->input('amount_to'));
    }

    // Filtry podle data
    if ($request->filled('date_from')) {
        $query->whereDate('created_at', '>=', $request->input('date_from'));
    }

    if ($request->filled('date_to')) {
        $query->whereDate('created_at', '<=', $request->input('date_to'));
    }

    // --- Řazení ---
    $sortBy = $request->input('sort_by', 'created_at');
    $sortDirection = $request->input('sort_direction', 'desc');
    
    if (str_contains($sortBy, '.')) {
        $sortBy = 'created_at';
    }

    $query->orderBy($sortBy, $sortDirection);

    // --- Finalizace dat ---
    $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
    $data = $noPagination ? $query->get() : $query->paginate($perPage);

    if ($noPagination) {
        return response()->json(ShopOrderResource::collection($data));
    }

    return response()->json([
        'data' => ShopOrderResource::collection($data->items()),
        'total' => $data->total(),
        'per_page' => $data->perPage(),
        'current_page' => $data->currentPage(),
        'last_page' => $data->lastPage(),
    ]);
}
/**
 * Vytvoření nové objednávky s automatickou synchronizací skladu přes modely
 */
/**
 * Vytvoření nové objednávky s automatickou synchronizací skladu a výpočtem daní
 */
public function store(StoreShopOrderRequest $request): JsonResponse
{
    Log::info("ShopOrder Store started", ['payload' => $request->all()]);
    
    $validated = $request->validated();
    $totalAmount = 0;
    foreach ($validated['items'] as $itemData) {
        $totalAmount += (float)$itemData['quantity'] * (float)$itemData['unit_price'];
    }

    // --- STRIKTNÍ VALIDACE KUPÓNU ---
    $coupon = null;
    $discountAmount = 0;

    if (!empty($validated['coupon_id'])) {
        $coupon = \App\Models\Shop\ShopCoupon::find($validated['coupon_id']);
        
        if (!$coupon) {
            return response()->json(['message' => 'Vybraný kupón neexistuje.'], 422);
        }

        if (!$coupon->is_active) {
            return response()->json(['message' => 'Tento kupón není aktivní.'], 422);
        }

        $now = now();
        if ($coupon->valid_from && $now->lt($coupon->valid_from)) {
            return response()->json(['message' => 'Platnost tohoto kupónu ještě nezačala.'], 422);
        }
        if ($coupon->valid_until && $now->gt($coupon->valid_until)) {
            return response()->json(['message' => 'Platnost tohoto kupónu již vypršela.'], 422);
        }

        if ($coupon->max_usage > 0 && $coupon->usage_count >= $coupon->max_usage) {
            return response()->json(['message' => 'Tento kupón již byl vyčerpán.'], 422);
        }

        if ($coupon->min_order_amount > 0 && $totalAmount < (float)$coupon->min_order_amount) {
            return response()->json([
                'message' => "Minimální hodnota objednávky pro tento kupón je " . number_format($coupon->min_order_amount, 2) . " Kč."
            ], 422);
        }

        $discountAmount = ($coupon->discount_type === 'percent') 
            ? ($totalAmount * (float)$coupon->discount_value) / 100 
            : (float)$coupon->discount_value;
    }

    try {
        DB::beginTransaction();

        $shippingAmount = 0;
        if (!empty($validated['shipping_method_id'])) {
            $shippingMethod = \App\Models\Shop\ShopShippingMethod::find($validated['shipping_method_id']);
            $shippingAmount = $shippingMethod ? (float)$shippingMethod->base_price : 0;
        }

        if ($coupon) {
            $coupon->increment('usage_count');
        }

        $discountFactor = $totalAmount > 0 ? ($totalAmount - $discountAmount) / $totalAmount : 1;
        $totalTax = 0;
        $finalAmount = max(0, $totalAmount + $shippingAmount - $discountAmount);

        $order = ShopOrder::create([
            'customer_id'          => $validated['customer_id'],
            'order_number'         => ShopOrder::generateOrderNumber(),
            'status'               => $validated['status'] ?? 'pending',
            'payment_status'       => $validated['payment_status'] ?? 'pending',
            'total_amount'         => $totalAmount,
            'shipping_amount'      => $shippingAmount,
            'tax_amount'           => 0, 
            'discount_amount'      => $discountAmount,
            'final_amount'         => $finalAmount,
            'coupon_id'            => $validated['coupon_id'] ?? null,
            'payment_method_id'    => $validated['payment_method_id'],
            'shipping_method_id'   => $validated['shipping_method_id'],
            'shipping_address'     => $validated['shipping_address'],
            'shipping_city'        => $validated['shipping_city'],
            'shipping_postal_code' => $validated['shipping_postal_code'],
            'shipping_country'     => $validated['shipping_country'],
            'notes'                => $validated['notes'] ?? null,
            'paid_at'              => ($validated['payment_status'] ?? 'pending') === 'paid' ? now() : null,
        ]);

        foreach ($validated['items'] as $itemData) {
            $quantity = (int)$itemData['quantity'];
            $product = ShopProduct::findOrFail($itemData['product_id']);
            
            $variantName = null;
            $vatRate = $itemData['vat_rate'] ?? $product->vat_rate ?? 21;

            if (!empty($itemData['product_variant_id'])) {
                $variant = ShopProductVariant::lockForUpdate()->findOrFail($itemData['product_variant_id']);
                $variant->decrement('stock_quantity', $quantity);
                $variantName = $variant->variant_name;
                
                if (isset($variant->vat_rate)) { $vatRate = $variant->vat_rate; }
                ShopProductVariant::forceSyncParentStock($product->id);
            } else {
                $product->lockForUpdate();
                $product->decrement('stock_quantity', $quantity);
            }

            $linePrice = $quantity * (float)$itemData['unit_price'];
            $linePriceAfterDiscount = $linePrice * $discountFactor;
            $itemTax = $linePriceAfterDiscount * ($vatRate / (100 + $vatRate));
            $totalTax += $itemTax;

            ShopOrderItem::create([
                'order_id'           => $order->id,
                'product_id'         => $product->id,
                'product_variant_id' => $itemData['product_variant_id'] ?? null,
                'product_name'       => $product->name,
                'variant_name'       => $variantName,
                'quantity'           => $quantity,
                'unit_price'         => $itemData['unit_price'],
                'total_price'        => $linePrice,
                'vat_rate'           => $vatRate,
            ]);
        }

        $order->update(['tax_amount' => $totalTax]);

        DB::commit();

        // Přepočet celkové útraty zákazníka
        if ($order->customer) {
            $order->customer->recalculateTotalSpent();
        }

        $order->load(['customer', 'paymentMethod', 'shippingMethod', 'coupon', 'items']);
        $this->logAction($request, 'create', 'ShopOrder', "Vytvořena objednávka: {$order->order_number}.", $order->id);

        return response()->json(new ShopOrderResource($order), 201);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error("ShopOrder creation error: " . $e->getMessage());
        return response()->json(['message' => 'Vytvoření objednávky selhalo: ' . $e->getMessage()], 500);
    }
}
    /**
     * Detail objednávky
     */
    public function show($id): JsonResponse
    {
        $order = ShopOrder::with([
            'customer',
            'paymentMethod',
            'shippingMethod',
            'coupon',
            'items'
        ])->findOrFail($id);

        return response()->json(new ShopOrderResource($order));
    }

    /**
     * Aktualizace objednávky
     */
public function update(UpdateShopOrderRequest $request, $id): JsonResponse
{
    Log::info("ShopOrder Update started", ['id' => $id, 'payload' => $request->all()]);

    try {
        DB::beginTransaction();

        $order = ShopOrder::findOrFail($id);
        $validated = $request->validated();

        $updateData = collect($validated)
            ->except(['items', 'delete_items'])
            ->toArray();

        $order->update($updateData);

        if ($request->has('delete_items')) {
            ShopOrderItem::whereIn('id', $request->input('delete_items'))
                ->delete();
        }

        if ($request->has('items')) {
            $this->updateOrderItems($order, $request->input('items'));
        }

        $this->recalculateOrderTotals($order);

        DB::commit();

        // Přepočet celkové útraty po změně cen nebo položek
        if ($order->customer) {
            $order->customer->recalculateTotalSpent();
        }

        $order->load(['customer', 'paymentMethod', 'shippingMethod', 'coupon', 'items']);
        $this->logAction($request, 'update', 'ShopOrder', "Aktualizace objednávky: {$order->order_number}", $order->id);

        return response()->json(new ShopOrderResource($order));
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error("ShopOrder update error: " . $e->getMessage());
        return response()->json(['message' => 'Aktualizace selhala: ' . $e->getMessage()], 500);
    }
}

    /**
     * Smazání objednávky
     */


// 1. NOVÁ FUNKCE PRO ZMĚNU STAVU
public function updateStatus(Request $request, $id)
{
    $order = ShopOrder::with(['items', 'customer'])->findOrFail($id);
    $oldStatus = $order->status;
    $newStatus = $request->input('status');

    DB::transaction(function () use ($order, $oldStatus, $newStatus) {
        $inventoryStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        $restoringStatuses = ['canceled', 'returned'];

        if (in_array($oldStatus, $inventoryStatuses) && in_array($newStatus, $restoringStatuses)) {
            $order->restoreStock();
        }

        $order->update(['status' => $newStatus]);
        
        // Přepočet útraty zákazníka (pokud se stav změnil na neplatný pro útratu)
        if ($order->customer) {
            $order->customer->recalculateTotalSpent();
        }
    });

    return response()->json($order);
}

// 2. UPRAVENÁ FUNKCE DESTROY
public function destroy(Request $request, $id)
{
    try {
        DB::beginTransaction();
        
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $order = ShopOrder::withTrashed()->with(['items', 'customer'])->findOrFail($id);

        $alreadyRestored = ['canceled', 'returned'];

        if ($forceDelete) {
            if (!in_array($order->status, $alreadyRestored)) {
                $order->restoreStock();
            }
            $order->items()->forceDelete();
            $order->forceDelete();
        } else {
            $order->delete();
        }

        DB::commit();

        // Přepočet útraty zákazníka po smazání objednávky
        if ($order->customer) {
            $order->customer->recalculateTotalSpent();
        }

        return response()->json(null, 204);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error("ShopOrder delete error: " . $e->getMessage());
        return response()->json(['message' => 'Smazání selhalo.'], 500);
    }
}
    /**
     * Obnova z koše
     */
    public function restore(Request $request, $id): JsonResponse
    {
        try {
            $order = ShopOrder::withTrashed()->findOrFail($id);
            $order->restore();
            $order->items()->restore();

            Log::info("Order restored", ['id' => $id]);
            $order->load(['customer', 'paymentMethod', 'shippingMethod', 'coupon', 'items']);
            $this->logAction($request, 'restore', 'ShopOrder', "Obnova objednávky ID: $id", $id);

            return response()->json(new ShopOrderResource($order));
        } catch (\Exception $e) {
            Log::error("ShopOrder restore error: " . $e->getMessage());
            return response()->json(['message' => 'Obnova objednávky selhala.'], 500);
        }
    }

    /**
     * Vyprázdnění koše
     */
   public function forceDeleteAllTrashed(Request $request): JsonResponse
{
    try {
        $trashedOrders = ShopOrder::onlyTrashed()->with('items')->get();
        DB::beginTransaction();

        foreach ($trashedOrders as $order) {
            $alreadyRestored = ['canceled', 'returned'];
            
            // Protože Soft Delete sklad nesnížil, musíme ho vrátit teď při Hard Delete
            if (!in_array($order->status, $alreadyRestored)) {
                $order->restoreStock();
            }

            $order->items()->forceDelete();
            $order->forceDelete();
        }

        DB::commit();
        return response()->json(null, 204);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['message' => 'Chyba při vyprazdňování koše.'], 500);
    }
}
    /**
     * ========== HELPERS ==========
     */

    /**
     * Aktualizace položek objednávky
     */
    private function updateOrderItems(ShopOrder $order, array $items): void
    {
        foreach ($items as $idx => $itemData) {
            if (isset($itemData['id']) && $itemData['id'] > 0) {
                // Update existující
                $item = ShopOrderItem::find($itemData['id']);
                if ($item) {
                    $item->update([
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total_price' => $itemData['quantity'] * $itemData['unit_price'],
                    ]);
                }
            } else {
                // Nová položka
                $product = ShopProduct::find($itemData['product_id']);
                $variant = !empty($itemData['product_variant_id']) 
                    ? ShopProductVariant::find($itemData['product_variant_id']) 
                    : null;

                ShopOrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'product_variant_id' => $itemData['product_variant_id'] ?? null,
                    'product_name' => $product->name,
                    'variant_name' => $variant?->variant_name,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['quantity'] * $itemData['unit_price'],
                ]);
            }
        }
    }

    /**
     * Přepočítání součtů objednávky
     */


private function recalculateOrderTotals(ShopOrder $order): void
{
    $items = $order->items;
    $totalWithVatBeforeDiscount = (float)$items->sum('total_price');
    $discountAmount = 0;

    // 1. Výpočet slevy - odebrána kontrola isValid()
    if ($order->coupon_id) {
        $coupon = \App\Models\Shop\ShopCoupon::find($order->coupon_id);
        
        // Zde už nevalidujeme expiraci, protože kupón už v objednávce existuje
        if ($coupon) {
            $discountAmount = ($coupon->discount_type === 'percent') 
                ? ($totalWithVatBeforeDiscount * (float)$coupon->discount_value) / 100 
                : (float)$coupon->discount_value;
        }
    }

    // 2. Koeficient slevy
    $discountFactor = $totalWithVatBeforeDiscount > 0 
        ? ($totalWithVatBeforeDiscount - $discountAmount) / $totalWithVatBeforeDiscount 
        : 1;

    $totalTax = 0;

    // 3. Výpočet daně z každé položky po slevě
    foreach ($items as $item) {
        $rate = $item->vat_rate ?? 21; 
        $lineTotalAfterDiscount = $item->total_price * $discountFactor;
        
        $itemTax = $lineTotalAfterDiscount * ($rate / (100 + $rate));
        $totalTax += $itemTax;
    }

    $shippingAmount = $order->shippingMethod ? (float)$order->shippingMethod->base_price : 0;

    $order->update([
        'total_amount'    => $totalWithVatBeforeDiscount,
        'discount_amount' => $discountAmount,
        'tax_amount'      => $totalTax,
        'shipping_amount' => $shippingAmount,
        'final_amount'    => max(0, $totalWithVatBeforeDiscount + $shippingAmount - $discountAmount),
    ]);
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
                'affected_entity_type' => 'ShopOrder',
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