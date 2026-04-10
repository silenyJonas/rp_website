<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopProduct;
use App\Models\Shop\ShopProductImage;
use App\Models\Shop\ShopProductVariant;
use App\Models\Shop\ShopLog;
use App\Http\Resources\Shop\ShopProductResource;
use App\Http\Requests\Shop\ShopProduct\StoreShopProductRequest;
use App\Http\Requests\Shop\ShopProduct\UpdateShopProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ShopProductController extends Controller
{
    /**
     * Seznam produktů s filtrováním
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $onlyTrashed = filter_var($request->input('only_trashed', false), FILTER_VALIDATE_BOOLEAN);

        $query = ShopProduct::with(['category', 'supplier', 'primaryImage']);
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        // Fulltextové vyhledávání
        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('name', 'like', "%$s%")
                ->orWhere('slug', 'like', "%$s%")
                ->orWhere('sku', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"));
        }

        // Filtry na přesnou shodu
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        // Nízké zásoby
        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }

        // Rozsah cen
        if ($request->filled('price_from')) {
            $query->where('price', '>=', $request->input('price_from'));
        }
        if ($request->filled('price_to')) {
            $query->where('price', '<=', $request->input('price_to'));
        }

        // Řazení
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $noPagination = filter_var($request->input('no_pagination', false), FILTER_VALIDATE_BOOLEAN);
        $data = $noPagination ? $query->get() : $query->paginate($perPage);

        if ($noPagination) {
            return response()->json(ShopProductResource::collection($data));
        }

        return response()->json([
            'data'         => ShopProductResource::collection($data->items()),
            'total'        => $data->total(),
            'per_page'     => $data->perPage(),
            'current_page' => $data->currentPage(),
            'last_page'    => $data->lastPage(),
        ]);
    }

    /**
     * Uložení nového produktu
     */
    public function store(StoreShopProductRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Vytvořit produkt
            $product = ShopProduct::create($validated);

            // Uložit obrázky
            if ($request->has('images')) {
                $this->storeImages($product, $request->input('images'));
            }

            // Uložit varianty
            if ($request->has('variants')) {
                $this->storeVariants($product, $request->input('variants'));
            }

            $product->load(['category', 'supplier', 'primaryImage', 'images', 'variants']);

            $this->logAction(
                $request,
                'create',
                'ShopProduct',
                "Vytvořen produkt: {$product->name} (SKU: {$product->sku})",
                $product->id
            );

            return response()->json(new ShopProductResource($product), 201);
        } catch (\Exception $e) {
            Log::error("ShopProduct creation error: " . $e->getMessage());
            $this->logAction($request, 'error', 'ShopProduct', "Chyba při vytváření: " . $e->getMessage());
            return response()->json(['message' => 'Vytvoření produktu selhalo.'], 500);
        }
    }

    /**
     * Detail produktu
     */
    public function show($id): JsonResponse
    {
        $product = ShopProduct::with(['category', 'supplier', 'images', 'variants', 'reviews'])->findOrFail($id);
        return response()->json(new ShopProductResource($product));
    }

    /**
     * Aktualizace produktu
     */
    public function update(UpdateShopProductRequest $request, $id): JsonResponse
    {
        try {
            $product = ShopProduct::findOrFail($id);
            $validated = $request->validated();

            // Odstranit klíče, které nejsou v fillable
            $updateData = collect($validated)
                ->except(['images', 'variants', 'delete_images', 'delete_variants'])
                ->toArray();

            $product->update($updateData);

            // Spravovat obrázky
            if ($request->has('delete_images')) {
                $this->deleteImages($request->input('delete_images'));
            }
            if ($request->has('images')) {
                $this->storeImages($product, $request->input('images'));
            }

            // Spravovat varianty
            if ($request->has('delete_variants')) {
                ShopProductVariant::whereIn('id', $request->input('delete_variants'))->delete();
            }
            if ($request->has('variants')) {
                $this->updateVariants($product, $request->input('variants'));
            }

            $product->load(['category', 'supplier', 'primaryImage', 'images', 'variants']);

            $this->logAction(
                $request,
                'update',
                'ShopProduct',
                "Aktualizace produktu: {$product->name}",
                $product->id
            );

            return response()->json(new ShopProductResource($product));
        } catch (\Exception $e) {
            Log::error("ShopProduct update error: " . $e->getMessage());
            $this->logAction($request, 'error', 'ShopProduct', "Chyba při aktualizaci: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Aktualizace produktu selhala.'], 500);
        }
    }

    /**
     * Smazání produktu (Soft/Hard)
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
            $product = ShopProduct::withTrashed()->findOrFail($id);

            if ($forceDelete) {
                // Vymazat obrázky
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete('products/' . $image->image_path);
                }
                $product->forceDelete();
            } else {
                $product->delete();
            }

            $this->logAction(
                $request,
                $forceDelete ? 'hard_delete' : 'soft_delete',
                'ShopProduct',
                "Smazání produktu ID: $id",
                $id
            );

            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("ShopProduct delete error: " . $e->getMessage());
            $this->logAction($request, 'error', 'ShopProduct', "Chyba při mazání: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Smazání produktu selhalo.'], 500);
        }
    }

    /**
     * Obnova z koše
     */
    public function restore(Request $request, $id): JsonResponse
    {
        try {
            $product = ShopProduct::withTrashed()->findOrFail($id);
            $product->restore();
            $product->load(['category', 'supplier', 'primaryImage', 'images', 'variants']);

            $this->logAction(
                $request,
                'restore',
                'ShopProduct',
                "Obnova produktu ID: $id",
                $id
            );

            return response()->json(new ShopProductResource($product));
        } catch (\Exception $e) {
            Log::error("ShopProduct restore error: " . $e->getMessage());
            $this->logAction($request, 'error', 'ShopProduct', "Chyba při obnově: " . $e->getMessage(), $id);
            return response()->json(['message' => 'Obnova produktu selhala.'], 500);
        }
    }

    /**
     * Vyprázdnění koše
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        try {
            $trashedProducts = ShopProduct::onlyTrashed()->get();
            $count = $trashedProducts->count();

            foreach ($trashedProducts as $product) {
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete('products/' . $image->image_path);
                }
                $product->forceDelete();
            }

            $this->logAction(
                $request,
                'force_delete_all',
                'ShopProduct',
                "Vyprázdnění koše. Smazáno produktů: $count"
            );

            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("ShopProduct force delete all error: " . $e->getMessage());
            $this->logAction($request, 'error', 'ShopProduct', "Chyba při vyprazdňování koše: " . $e->getMessage());
            return response()->json(['message' => 'Vyprázdnění koše selhalo.'], 500);
        }
    }

    /**
     * ========== HELPERS ==========
     */

    /**
     * Uložit obrázky produktu
     */
    private function storeImages(ShopProduct $product, array $images): void
    {
        foreach ($images as $index => $imageData) {
            if (!isset($imageData['file'])) {
                continue;
            }

            $file = $imageData['file'];
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();

            // Uložit soubor
            $path = $file->storeAs('products', $fileName, 'public');

            // Vytvořit záznam
            ShopProductImage::create([
                'product_id' => $product->id,
                'image_path' => $fileName,
                'alt_text' => $imageData['alt_text'] ?? $product->name,
                'is_primary' => $imageData['is_primary'] ?? false,
                'sort_order' => $imageData['sort_order'] ?? $index,
            ]);
        }
    }

    /**
     * Smazat obrázky
     */
    private function deleteImages(array $imageIds): void
    {
        $images = ShopProductImage::whereIn('id', $imageIds)->get();

        foreach ($images as $image) {
            Storage::disk('public')->delete('products/' . $image->image_path);
            $image->delete();
        }
    }

    /**
     * Uložit varianty
     */
    private function storeVariants(ShopProduct $product, array $variants): void
    {
        foreach ($variants as $variantData) {
            ShopProductVariant::create([
                'product_id' => $product->id,
                'variant_name' => $variantData['variant_name'],
                'attribute_1_name' => $variantData['attribute_1_name'] ?? null,
                'attribute_1_value' => $variantData['attribute_1_value'] ?? null,
                'attribute_2_name' => $variantData['attribute_2_name'] ?? null,
                'attribute_2_value' => $variantData['attribute_2_value'] ?? null,
                'sku_variant' => $variantData['sku_variant'] ?? null,
                'price_modifier' => $variantData['price_modifier'] ?? 0,
                'stock_quantity' => $variantData['stock_quantity'] ?? 0,
            ]);
        }
    }

    /**
     * Aktualizovat varianty (přidání nových, update existujících)
     */
    private function updateVariants(ShopProduct $product, array $variants): void
    {
        foreach ($variants as $variantData) {
            if (isset($variantData['id'])) {
                // Update existující
                ShopProductVariant::findOrFail($variantData['id'])->update([
                    'variant_name' => $variantData['variant_name'],
                    'attribute_1_name' => $variantData['attribute_1_name'] ?? null,
                    'attribute_1_value' => $variantData['attribute_1_value'] ?? null,
                    'attribute_2_name' => $variantData['attribute_2_name'] ?? null,
                    'attribute_2_value' => $variantData['attribute_2_value'] ?? null,
                    'sku_variant' => $variantData['sku_variant'] ?? null,
                    'price_modifier' => $variantData['price_modifier'] ?? 0,
                    'stock_quantity' => $variantData['stock_quantity'] ?? 0,
                ]);
            } else {
                // Vytvořit novou
                $this->storeVariants($product, [$variantData]);
            }
        }
    }

    /**
     * Logování akcí
     */
    protected function logAction(
        Request $request,
        string $eventType,
        string $module,
        string $description,
        ?int $affectedId = null
    ): void {
        try {
            $user = $request->user() ?? auth('sanctum')->user();

            ShopLog::create([
                'origin' => $request->ip(),
                'event_type' => $eventType,
                'module' => $module,
                'description' => $description,
                'affected_entity_type' => 'ShopProduct',
                'affected_entity_id' => $affectedId,
                'user_id' => $user?->id,
                'context_data' => json_encode($request->all(), JSON_UNESCAPED_UNICODE),
                'user_id_plain' => (string)($user?->id ?? '0'),
                'user_plain' => $user ? ($user->full_name ?? $user->user_email) : 'Systém'
            ]);
        } catch (\Exception $e) {
            Log::error("Log error (ShopProduct): " . $e->getMessage());
        }
    }
}