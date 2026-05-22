<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopProduct;
use App\Models\Shop\ShopProductImage;
use App\Models\Shop\ShopProductVariant;
use App\Models\Shop\ShopProductPrice;
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

        $query = ShopProduct::with([
            'category',
            'supplier',
            'primaryImage',
            'prices',
            'variants' => function ($q) {
                $q->with(['images', 'prices']);
            }
        ]);
        
        $onlyTrashed ? $query->onlyTrashed() : $query->withoutTrashed();

        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('name', 'like', "%$s%")
                ->orWhere('slug', 'like', "%$s%")
                ->orWhere('sku', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"));
        }

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

        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }

        // Úprava: Filtrování cen přes novou tabulku cen (předpoklad filtru na hlavní měnu CZK s DPH)
        if ($request->filled('price_from')) {
            $query->whereHas('prices', function ($q) use ($request) {
                $q->where('price_czk_with_vat', '>=', $request->input('price_from'));
            });
        }
        if ($request->filled('price_to')) {
            $query->whereHas('prices', function ($q) use ($request) {
                $q->where('price_czk_with_vat', '<=', $request->input('price_to'));
            });
        }

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
        Log::info("ShopProduct Store started", ['payload' => $request->all(), 'files' => $request->allFiles()]);
        try {
            $validated = $request->validated();
            
            // Extrakce dat pro produkt mimo pole cen
            $productData = collect($validated)->except(['prices', 'variants', 'images'])->toArray();
            $product = ShopProduct::create($productData);
            Log::info("Product created", ['id' => $product->id]);

            // Úprava: Uložení cen pro hlavní produkt
            if ($request->has('prices')) {
                $product->prices()->create($request->input('prices'));
            }

            if ($request->has('images')) {
                Log::info("Found images in request", ['count' => count($request->input('images', []))]);
                $this->storeImages($product, $request->input('images', []), $request, 'images');
            }

            if ($request->has('variants')) {
                Log::info("Found variants in request", ['count' => count($request->input('variants', []))]);
                $this->storeVariants($product, $request->input('variants', []), $request);
                $this->syncProductStock($product);
            }

            $product->load(['category', 'supplier', 'primaryImage', 'images', 'prices', 'variants' => fn($q) => $q->with(['images', 'prices'])]);
            $this->logAction($request, 'create', 'ShopProduct', "Vytvořen produkt: {$product->name}", $product->id);

            return response()->json(new ShopProductResource($product), 201);
        } catch (\Exception $e) {
            Log::error("ShopProduct creation error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Vytvoření produktu selhalo: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Detail produktu
     */
    public function show($id): JsonResponse
    {
        $product = ShopProduct::with([
            'category',
            'supplier',
            'images',
            'prices',
            'variants' => fn($q) => $q->with(['images', 'prices'])
        ])->findOrFail($id);

        return response()->json(new ShopProductResource($product));
    }

    /**
     * Aktualizace produktu
     */
    public function update(UpdateShopProductRequest $request, $id): JsonResponse
    {
        Log::info("ShopProduct Update started", ['id' => $id, 'payload' => $request->all(), 'files' => $request->allFiles()]);
        try {
            $product = ShopProduct::findOrFail($id);
            $validated = $request->validated();

            $updateData = collect($validated)
                ->except(['prices', 'images', 'variants', 'delete_images', 'delete_variants'])
                ->toArray();

            $product->update($updateData);

            // Úprava: Update/Uložení cen pro hlavní produkt
            if ($request->has('prices')) {
                $product->prices()->updateOrCreate(
                    ['product_id' => $product->id, 'variant_id' => null],
                    $request->input('prices')
                );
            }

            // Smazání obrázků produktu
            if ($request->has('delete_images')) {
                Log::info("Deleting product images", ['ids' => $request->input('delete_images')]);
                $this->deleteImages($request->input('delete_images'));
            }

            // Uložení nových/update obrázků produktu
            if ($request->has('images')) {
                $this->storeImages($product, $request->input('images', []), $request, 'images');
            }

            // Smazání variant
            if ($request->has('delete_variants')) {
                Log::info("Deleting variants and their images", ['ids' => $request->delete_variants]);
                
                $variantsToDelete = ShopProductVariant::whereIn('id', $request->delete_variants)->get();
                
                foreach ($variantsToDelete as $variant) {
                    // Úprava: Odstranění navázaných cen varianty před smazáním
                    $variant->prices()->delete();
                    $variant->delete();
                }
            }

            // Update/Create variant
            if ($request->has('variants')) {
                Log::info("Updating variants", ['count' => count($request->input('variants', []))]);
                $this->updateVariants($product, $request->input('variants', []), $request);
            }

            $this->syncProductStock($product);

            // 🔥 VYČIŠTĚNÍ CACHE: Odstranění starých stavů skladu z cache paměti
            \Illuminate\Support\Facades\Cache::forget("product_stock_{$product->id}");
            foreach ($product->variants as $variant) {
                \Illuminate\Support\Facades\Cache::forget("product_stock_{$product->id}_v{$variant->id}");
            }

            $product->load(['category', 'supplier', 'primaryImage', 'images', 'prices', 'variants' => fn($q) => $q->with(['images', 'prices'])]);
            $this->logAction($request, 'update', 'ShopProduct', "Aktualizace produktu: {$product->name}", $product->id);

            return response()->json(new ShopProductResource($product));
        } catch (\Exception $e) {
            Log::error("ShopProduct update error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Aktualizace selhala: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Smazání produktu
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        Log::info("ShopProduct Destroy started", ['id' => $id, 'force_delete' => $request->input('force_delete')]);
        try {
            $forceDelete = filter_var($request->input('force_delete', false), FILTER_VALIDATE_BOOLEAN);
            $product = ShopProduct::withTrashed()->findOrFail($id);

            if ($forceDelete) {
                Log::info("Performing hard delete for product", ['id' => $id]);
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete('products/' . $image->image_path);
                }
                foreach ($product->variants as $variant) {
                    foreach ($variant->images as $image) {
                        Storage::disk('public')->delete('products/' . $image->image_path);
                    }
                    // Úprava: Tvrdé smazání cen varianty
                    $variant->prices()->delete();
                }
                // Úprava: Tvrdé smazání hlavních cen produktu
                $product->prices()->delete();
                $product->forceDelete();
            } else {
                Log::info("Performing soft delete for product", ['id' => $id]);
                $product->delete();
            }

            $this->logAction($request, $forceDelete ? 'hard_delete' : 'soft_delete', 'ShopProduct', "Smazání produktu ID: $id", $id);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("ShopProduct delete error: " . $e->getMessage());
            return response()->json(['message' => 'Smazání produktu selhalo: ' . $e->getMessage()], 500);
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
            Log::info("Product restored", ['id' => $id]);
            $product->load(['category', 'supplier', 'primaryImage', 'images', 'prices', 'variants' => fn($q) => $q->with(['images', 'prices'])]);
            $this->logAction($request, 'restore', 'ShopProduct', "Obnova produktu ID: $id", $id);

            return response()->json(new ShopProductResource($product));
        } catch (\Exception $e) {
            Log::error("ShopProduct restore error: " . $e->getMessage());
            return response()->json(['message' => 'Obnova produktu selhala.'], 500);
        }
    }

    /**
     * Vyprázdnění koše
     */
    public function forceDeleteAllTrashed(Request $request): JsonResponse
    {
        Log::info("ShopProduct force delete all trashed started");
        try {
            $trashedProducts = ShopProduct::onlyTrashed()->with(['variants', 'images'])->get();
            $count = $trashedProducts->count();

            foreach ($trashedProducts as $product) {
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete('products/' . $image->image_path);
                }
                foreach ($product->variants as $variant) {
                    foreach ($variant->images as $image) {
                        Storage::disk('public')->delete('products/' . $image->image_path);
                    }
                    // Úprava: Vyčištění cen varianty při vyprazdňování koše
                    $variant->prices()->delete();
                }
                // Úprava: Vyčištění cen produktu při vyprazdňování koše
                $product->prices()->delete();
                $product->forceDelete();
            }
            Log::info("Trashed products emptied", ['deleted_count' => $count]);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("ShopProduct force delete all error: " . $e->getMessage());
            return response()->json(['message' => 'Vyprázdnění koše selhalo: ' . $e->getMessage()], 500);
        }
    }

    /**
     * ========== HELPERS ==========
     */

    /**
     * Uložení obrázků - podporuje jak hlavní obrázky, tak obrázky variant
     */
    private function storeImages(ShopProduct $product, array $images, Request $request, string $prefix = 'images'): void
    {
        foreach ($images as $index => $imageData) {
            if (!empty($imageData['id']) && !$request->hasFile("{$prefix}.{$index}.file")) {
                Log::info("Skipping existing image without new file", ['image_id' => $imageData['id']]);
                continue;
            }

            if (!empty($imageData['id']) && !$request->hasFile("{$prefix}.{$index}.file")) {
                ShopProductImage::find($imageData['id'])?->update([
                    'alt_text' => $imageData['alt_text'] ?? '',
                    'sort_order' => $imageData['sort_order'] ?? $index,
                    'is_primary' => filter_var($imageData['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN),
                ]);
                continue;
            }

            $file = $request->file("{$prefix}.{$index}.file");

            if (!$file) {
                Log::warning("File not found in request for key: {$prefix}.{$index}.file");
                continue;
            }

            if (!$file->isValid()) {
                Log::warning("File at key {$prefix}.{$index}.file is not valid.");
                continue;
            }

            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('products', $fileName, 'public');
            Log::info("Image stored to disk", ['path' => $path, 'filename' => $fileName]);

            if (!empty($imageData['id'])) {
                $oldImage = ShopProductImage::find($imageData['id']);
                if ($oldImage) {
                    Storage::disk('public')->delete('products/' . $oldImage->image_path);
                    $oldImage->update([
                        'image_path' => $fileName,
                        'alt_text' => $imageData['alt_text'] ?? $product->name,
                        'sort_order' => $imageData['sort_order'] ?? $index,
                        'is_primary' => filter_var($imageData['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    ]);
                }
            } else {
                ShopProductImage::create([
                    'product_id' => $product->id,
                    'variant_id' => $imageData['variant_id'] ?? null,
                    'image_path' => $fileName,
                    'alt_text' => $imageData['alt_text'] ?? $product->name,
                    'is_primary' => filter_var($imageData['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'sort_order' => $imageData['sort_order'] ?? $index,
                ]);
            }

            Log::info("Image record processed", [
                'product_id' => $product->id, 
                'variant_id' => $imageData['variant_id'] ?? null
            ]);
        }
    }

    /**
     * Smazání obrázků
     */
    private function deleteImages(array $imageIds): void
    {
        $images = ShopProductImage::whereIn('id', $imageIds)->get();
        foreach ($images as $image) {
            if (Storage::disk('public')->exists('products/' . $image->image_path)) {
                Storage::disk('public')->delete('products/' . $image->image_path);
                Log::info("Image file deleted from disk", ['path' => $image->image_path]);
            }
            $image->delete();
        }
    }

    /**
     * Smazání variant a jejich obrázků
     */
    private function deleteVariantsWithImages(array $variantIds): void
    {
        $variants = ShopProductVariant::whereIn('id', $variantIds)->get();
        
        foreach ($variants as $variant) {
            $images = ShopProductImage::where('variant_id', $variant->id)->get();
            foreach ($images as $image) {
                if (Storage::disk('public')->exists('products/' . $image->image_path)) {
                    Storage::disk('public')->delete('products/' . $image->image_path);
                }
                $image->delete();
            }
            // Úprava: Odstranění navázaných cen varianty
            $variant->prices()->delete();
            $variant->delete();
        }
    }

    /**
     * Uložení nových variant
     */
    private function storeVariants(ShopProduct $product, array $variants, Request $request = null): void
    {
        foreach ($variants as $idx => $variantData) {
            // Úprava: Odstraněna stará cenová pole přímo z dat varianty
            $variant = ShopProductVariant::create([
                'product_id' => $product->id,
                'variant_name' => $variantData['variant_name'],
                'attribute_1_name' => $variantData['attribute_1_name'] ?? null,
                'attribute_1_value' => $variantData['attribute_1_value'] ?? null,
                'attribute_2_name' => $variantData['attribute_2_name'] ?? null,
                'attribute_2_value' => $variantData['attribute_2_value'] ?? null,
                'sku_variant' => $variantData['sku_variant'] ?? null,
                'stock_quantity' => $variantData['stock_quantity'] ?? 0,
            ]);

            // Úprava: Zápis multoměnových cen do nové tabulky cen pro novou variantu
            if (isset($variantData['prices']) && is_array($variantData['prices'])) {
                $variant->prices()->create(array_merge($variantData['prices'], [
                    'product_id' => $product->id
                ]));
            }

            if (isset($variantData['images']) && is_array($variantData['images']) && $request) {
                Log::info("Processing images for new variant", ['variant_id' => $variant->id]);
                
                $variantImages = array_map(function($img) use ($variant) {
                    $img['variant_id'] = $variant->id;
                    return $img;
                }, $variantData['images']);

                $this->storeImages($product, $variantImages, $request, "variants.{$idx}.images");
            }
        }
    }

    /**
     * Aktualizace existujících variant
     */
    private function updateVariants(ShopProduct $product, array $variants, Request $request): void
    {
        foreach ($variants as $idx => $variantData) {
            if (isset($variantData['id']) && $variantData['id'] > 0) {
                $variant = ShopProductVariant::findOrFail($variantData['id']);
                
                // Úprava: Odstraněna stará cenová pole přímo z update metody varianty
                $variant->update([
                    'variant_name'      => $variantData['variant_name'],
                    'attribute_1_name'  => $variantData['attribute_1_name'] ?? null,
                    'attribute_1_value' => $variantData['attribute_1_value'] ?? null,
                    'attribute_2_name'  => $variantData['attribute_2_name'] ?? null,
                    'attribute_2_value' => $variantData['attribute_2_value'] ?? null,
                    'sku_variant'       => $variantData['sku_variant'] ?? null,
                    'stock_quantity'    => $variantData['stock_quantity'] ?? 0,
                ]);

                // Úprava: Aktualizace nebo vytvoření cenového záznamu pro upravovanou variantu
                if (isset($variantData['prices']) && is_array($variantData['prices'])) {
                    $variant->prices()->updateOrCreate(
                        ['variant_id' => $variant->id],
                        array_merge($variantData['prices'], ['product_id' => $product->id])
                    );
                }

                if (isset($variantData['delete_images']) && is_array($variantData['delete_images'])) {
                    Log::info("Deleting variant images", [
                        'variant_id' => $variant->id,
                        'image_ids' => $variantData['delete_images']
                    ]);
                    
                    $this->deleteImages($variantData['delete_images']);
                }

                if (isset($variantData['images']) && is_array($variantData['images'])) {
                    $variantImages = array_map(function($img) use ($variant) {
                        $img['variant_id'] = $variant->id;
                        return $img;
                    }, $variantData['images']);

                    $this->storeImages($product, $variantImages, $request, "variants.{$idx}.images");
                }
            } else {
                $this->storeVariants($product, [$variantData], $request);
            }
        }
    }

    /**
     * Veřejný seznam produktů pro e-shop (Paginace + Filtry)
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);

        $query = ShopProduct::active()
            ->with(['primaryImage', 'category', 'prices']);

        if ($s = $request->input('search')) {
            $query->where(fn($q) => $q->where('name', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Úprava: Filtrování veřejných cen přes novou tabulku cen
        if ($request->filled('price_from')) {
            $query->whereHas('prices', function ($q) use ($request) {
                $q->where('price_czk_with_vat', '>=', $request->input('price_from'));
            });
        }
        if ($request->filled('price_to')) {
            $query->whereHas('prices', function ($q) use ($request) {
                $q->where('price_czk_with_vat', '<=', $request->input('price_to'));
            });
        }

        $sortBy = $request->input('sort_by', 'created_at'); 
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $products = $query->paginate($perPage);

        return response()->json([
            'data'         => ShopProductResource::collection($products->items()),
            'total'        => $products->total(),
            'per_page'     => $products->perPage(),
            'current_page' => $products->currentPage(),
            'last_page'    => $products->lastPage(),
        ]);
    }

    /**
     * Veřejný detail produktu pro e-shop
     */
    public function publicShow($slugOrId): JsonResponse
    {
        $query = ShopProduct::active()
            ->with([
                'category', 
                'prices',
                'images' => fn($q) => $q->orderBy('sort_order'),
                'variants' => fn($q) => $q->with(['images', 'prices'])
            ]);

        $product = is_numeric($slugOrId) 
            ? $query->find($slugOrId) 
            : $query->where('slug', $slugOrId)->first();

        if (!$product) {
            return response()->json(['message' => 'Produkt nebyl nalezen nebo není aktivní.'], 404);
        }

        return response()->json(new ShopProductResource($product));
    }

    /**
     * Synchronizace skladových zásob
     */
    private function syncProductStock(ShopProduct $product): void
    {
        $totalStock = ShopProductVariant::where('product_id', $product->id)
            ->whereNull('deleted_at')
            ->sum('stock_quantity');

        $product->update(['stock_quantity' => $totalStock]);
        Log::info("Stock synced", ['product_id' => $product->id, 'total_stock' => $totalStock]);
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
                'affected_entity_type' => 'ShopProduct',
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