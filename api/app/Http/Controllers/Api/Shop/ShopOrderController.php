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
    // public function index(Request $request): JsonResponse
    // {
    //     $perPage = $request->input('per_page', 15);
    //     $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

    //     $query = ShopOrder::with([
    //         'customer',
    //         'paymentMethod',
    //         'shippingMethod',
    //         'coupon',
    //         'items'
    //     ]);

    //     $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

    //     // Vyhledávání
    //     if ($s = $request->input('search')) {
    //         $query->where(fn($q) => 
    //             $q->where('order_number', 'like', "%$s%")
    //               ->orWhere('shipping_address', 'like', "%$s%")
    //               ->orWhereHas('customer', fn($cq) => 
    //                   $cq->where('email', 'like', "%$s%")
    //                     ->orWhere('first_name', 'like', "%$s%")
    //                     ->orWhere('last_name', 'like', "%$s%")
    //               )
    //         );
    //     }

    //     // Filtry
    //     if ($request->filled('status')) {
    //         $query->where('status', $request->input('status'));
    //     }

    //     if ($request->filled('payment_status')) {
    //         $query->where('payment_status', $request->input('payment_status'));
    //     }

    //     if ($request->filled('customer_id')) {
    //         $query->where('customer_id', $request->input('customer_id'));
    //     }

    //     if ($request->filled('date_from')) {
    //         $query->whereDate('created_at', '>=', $request->input('date_from'));
    //     }

    //     if ($request->filled('date_to')) {
    //         $query->whereDate('created_at', '<=', $request->input('date_to'));
    //     }

    //     if ($request->filled('amount_from')) {
    //         $query->where('final_amount', '>=', $request->input('amount_from'));
    //     }

    //     if ($request->filled('amount_to')) {
    //         $query->where('final_amount', '<=', $request->input('amount_to'));
    //     }

    //     $sortBy = $request->input('sort_by', 'created_at');
    //     $sortDirection = $request->input('sort_direction', 'desc');
    //     $query->orderBy($sortBy, $sortDirection);

    //     $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
    //     $data = $noPagination ? $query->get() : $query->paginate($perPage);

    //     if ($noPagination) {
    //         return response()->json(ShopOrderResource::collection($data));
    //     }

    //     return response()->json([
    //         'data' => ShopOrderResource::collection($data->items()),
    //         'total' => $data->total(),
    //         'per_page' => $data->perPage(),
    //         'current_page' => $data->currentPage(),
    //         'last_page' => $data->lastPage(),
    //     ]);
    // }
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
            $q->where('id', $s) // Přidáno hledání podle ID i v hlavním search
              ->orWhere('order_number', 'like', "%$s%")
              ->orWhere('shipping_address', 'like', "%$s%")
              ->orWhereHas('customer', fn($cq) => 
                  $cq->where('email', 'like', "%$s%")
                    ->orWhere('first_name', 'like', "%$s%")
                    ->orWhere('last_name', 'like', "%$s%")
              )
        );
    }

    // --- Dedikované filtry (přesné shody z jednotlivých políček) ---

    // Filtr podle ID
    if ($request->filled('id')) {
        $query->where('id', $request->input('id'));
    }

    // Filtr podle čísla objednávky
    if ($request->filled('order_number')) {
        $query->where('order_number', 'like', '%' . $request->input('order_number') . '%');
    }

    // Filtry podle stavů
    if ($request->filled('status')) {
        $query->where('status', $request->input('status'));
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

    // Filtry podle data (ponecháno pro případnou budoucí potřebu)
    if ($request->filled('date_from')) {
        $query->whereDate('created_at', '>=', $request->input('date_from'));
    }

    if ($request->filled('date_to')) {
        $query->whereDate('created_at', '<=', $request->input('date_to'));
    }

    // --- Řazení ---
    $sortBy = $request->input('sort_by', 'created_at');
    $sortDirection = $request->input('sort_direction', 'desc');
    
    // Ochrana před řazením podle neexistujících sloupců (např. customer.full_name)
    // Pokud key obsahuje tečku, Laravel orderBy selže, proto řadíme podle ID jako fallback
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
public function store(StoreShopOrderRequest $request): JsonResponse
{
    Log::info("ShopOrder Store started", ['payload' => $request->all()]);
    
    try {
        DB::beginTransaction();

        $validated = $request->validated();

        // 1. Výpočet základních částek
        $totalAmount = 0;
        foreach ($validated['items'] as $itemData) {
            $totalAmount += (float)$itemData['quantity'] * (float)$itemData['unit_price'];
        }

        // 2. Logika kupónu
        $discountAmount = 0;
        if (!empty($validated['coupon_id'])) {
            $coupon = \App\Models\Shop\ShopCoupon::find($validated['coupon_id']);
            if ($coupon && $coupon->isValid($totalAmount)) {
                $discountAmount = ($coupon->discount_type === 'percent') 
                    ? ($totalAmount * (float)$coupon->discount_value) / 100 
                    : (float)$coupon->discount_value;
                
                $coupon->increment('usage_count');
            }
        }

        // 3. Dopravní náklady
        $shippingAmount = 0;
        if (!empty($validated['shipping_method_id'])) {
            $shippingMethod = \App\Models\Shop\ShopShippingMethod::find($validated['shipping_method_id']);
            $shippingAmount = $shippingMethod ? (float)$shippingMethod->base_price : 0;
        }

        $finalAmount = max(0, $totalAmount + $shippingAmount - $discountAmount);

        // 4. Vytvoření objednávky
        $order = ShopOrder::create([
            'customer_id'          => $validated['customer_id'],
            'order_number'         => ShopOrder::generateOrderNumber(),
            'status'               => $validated['status'] ?? 'pending',
            'payment_status'       => $validated['payment_status'] ?? 'pending',
            'total_amount'         => $totalAmount,
            'shipping_amount'      => $shippingAmount,
            'tax_amount'           => 0, // Případně dopočítat dle sazeb
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

        // 5. Položky a odečtení ze skladu (Sync hlavního produktu proběhne automaticky v modelu)
        foreach ($validated['items'] as $itemData) {
            $quantity = (int)$itemData['quantity'];
            $product = ShopProduct::findOrFail($itemData['product_id']);
            
            $variantName = null;

            if (!empty($itemData['product_variant_id'])) {
    // LOCK a odečtení varianty
    $variant = ShopProductVariant::lockForUpdate()->findOrFail($itemData['product_variant_id']);
    $variant->decrement('stock_quantity', $quantity);
    $variantName = $variant->variant_name;

    // Ručně vynutíme přepočet hlavního produktu
    ShopProductVariant::forceSyncParentStock($product->id);

} else {
    // Pokud produkt nemá varianty, odečítáme přímo z něj
    $product->lockForUpdate();
    $product->decrement('stock_quantity', $quantity);
    // Tady není co sčítat, protože produkt nemá varianty, 
    // takže se jen sníží jeho vlastní stock_quantity.
}

            ShopOrderItem::create([
                'order_id'           => $order->id,
                'product_id'         => $product->id,
                'product_variant_id' => $itemData['product_variant_id'] ?? null,
                'product_name'       => $product->name,
                'variant_name'       => $variantName,
                'quantity'           => $quantity,
                'unit_price'         => $itemData['unit_price'],
                'total_price'        => $quantity * (float)$itemData['unit_price'],
            ]);
        }

        DB::commit();

        $order->load(['customer', 'paymentMethod', 'shippingMethod', 'coupon', 'items']);
        $this->logAction($request, 'create', 'ShopOrder', "Vytvořena objednávka: {$order->order_number}.", $order->id);

        return response()->json(new ShopOrderResource($order), 201);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error("ShopOrder creation error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
        return response()->json(['message' => 'Vytvoření objednávky selhalo.'], 500);
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

            // Aktualizuj základní data
            $updateData = collect($validated)
                ->except(['items', 'delete_items'])
                ->toArray();

            $order->update($updateData);

            // Smazání položek
            if ($request->has('delete_items')) {
                ShopOrderItem::whereIn('id', $request->input('delete_items'))
                    ->delete();
                Log::info("Order items deleted", ['order_id' => $order->id, 'ids' => $request->input('delete_items')]);
            }

            // Aktualizace/Vytvoření položek
            if ($request->has('items')) {
                $this->updateOrderItems($order, $request->input('items'));
            }

            // Přepočítej ceny
            $this->recalculateOrderTotals($order);

            DB::commit();

            $order->load(['customer', 'paymentMethod', 'shippingMethod', 'coupon', 'items']);
            $this->logAction($request, 'update', 'ShopOrder', "Aktualizace objednávky: {$order->order_number}", $order->id);

            return response()->json(new ShopOrderResource($order));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("ShopOrder update error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Aktualizace selhala: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Smazání objednávky
     */


// 1. NOVÁ FUNKCE PRO ZMĚNU STAVU
public function updateStatus(Request $request, $id)
{
    $order = ShopOrder::with('items')->findOrFail($id);
    $oldStatus = $order->status;
    $newStatus = $request->input('status');

    DB::transaction(function () use ($order, $oldStatus, $newStatus) {
        // Stavy, kdy je zboží pryč ze skladu
        $inventoryStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        // Stavy, které znamenají návrat zboží
        $restoringStatuses = ['canceled', 'returned'];

        // Pokud se mění ze "skladem pryč" na "storno/vráceno", vrátíme kusy
        if (in_array($oldStatus, $inventoryStatuses) && in_array($newStatus, $restoringStatuses)) {
            $order->restoreStock();
        }

        $order->update(['status' => $newStatus]);
    });

    return response()->json($order);
}

// 2. UPRAVENÁ FUNKCE DESTROY
public function destroy(Request $request, $id)
{
    try {
        DB::beginTransaction();
        
        $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
        $order = ShopOrder::withTrashed()->with('items')->findOrFail($id);

        $alreadyRestored = ['canceled', 'returned'];

        if ($forceDelete) {
            // POUZE u Hard Delete vracíme sklad, pokud už nebyl vrácen dříve
            if (!in_array($order->status, $alreadyRestored)) {
                Log::info("Hard delete: Definitivní smazání, navracím zásoby.");
                $order->restoreStock();
            }
            $order->items()->forceDelete();
            $order->forceDelete();
        } else {
            // Soft Delete: Jen přesun do koše, se skladem NIC neděláme
            Log::info("Soft delete: Objednávka jde do koše, sklad zůstává beze změny.");
            $order->delete();
        }

        DB::commit();
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
    // private function recalculateOrderTotals(ShopOrder $order): void
    // {
    //     $totalAmount = $order->items()->sum(DB::raw('quantity * unit_price'));
        
    //     $discountAmount = 0;
    //     if ($order->coupon_id) {
    //         $coupon = \App\Models\Shop\ShopCoupon::find($order->coupon_id);
    //         if ($coupon && $coupon->is_active) {
    //             if ($coupon->discount_type === 'percent') {
    //                 $discountAmount = ($totalAmount * $coupon->discount_value) / 100;
    //             } else {
    //                 $discountAmount = $coupon->discount_value;
    //             }
    //         }
    //     }

    //     $shippingAmount = 0;
    //     if ($order->shipping_method_id) {
    //         $shippingMethod = \App\Models\Shop\ShopShippingMethod::find($order->shipping_method_id);
    //         if ($shippingMethod) {
    //             $shippingAmount = (float)$shippingMethod->base_price;
    //         }
    //     }

    //     $finalAmount = $totalAmount + $shippingAmount - $discountAmount;

    //     $order->update([
    //         'total_amount' => $totalAmount,
    //         'discount_amount' => $discountAmount,
    //         'shipping_amount' => $shippingAmount,
    //         'final_amount' => $finalAmount,
    //     ]);

    //     Log::info("Order totals recalculated", ['order_id' => $order->id, 'final_amount' => $finalAmount]);
    // }
private function recalculateOrderTotals(ShopOrder $order): void
{
    // Základní součet položek
    $totalAmount = (float)$order->items()->sum(DB::raw('quantity * unit_price'));
    
    $discountAmount = 0;
    if ($order->coupon_id) {
        $coupon = \App\Models\Shop\ShopCoupon::find($order->coupon_id);
        
        // Použijeme stejnou validaci (při přepočtu už neinkrementujeme usage_count!)
        if ($coupon && $coupon->isValid($totalAmount)) {
            if ($coupon->discount_type === 'percent') {
                $discountAmount = ($totalAmount * (float)$coupon->discount_value) / 100;
            } else {
                $discountAmount = (float)$coupon->discount_value;
            }
        }
    }

    $shippingAmount = 0;
    if ($order->shipping_method_id) {
        $shippingMethod = \App\Models\Shop\ShopShippingMethod::find($order->shipping_method_id);
        if ($shippingMethod) {
            $shippingAmount = (float)$shippingMethod->base_price;
        }
    }

    // Finální částka (ošetřeno proti záporným hodnotám)
    $finalAmount = max(0, $totalAmount + $shippingAmount - $discountAmount);

    $order->update([
        'total_amount' => $totalAmount,
        'discount_amount' => $discountAmount,
        'shipping_amount' => $shippingAmount,
        'final_amount' => $finalAmount,
    ]);

    Log::info("Order totals recalculated", ['order_id' => $order->id, 'final_amount' => $finalAmount]);
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